//! SQLite-backed account entry repository.

use std::collections::HashMap;

use sqlx::{FromRow, SqlitePool};

use crate::{
    application::ports::{
        account_entry_repository::AccountEntryRepository, partner_repository::RepositoryFuture,
    },
    domain::models::account_entry::{AccountEntry, NewAccountEntry, UpdateAccountEntry},
};

pub struct SqliteAccountEntryRepository<'pool> {
    pool: &'pool SqlitePool,
}

impl<'pool> SqliteAccountEntryRepository<'pool> {
    pub fn new(pool: &'pool SqlitePool) -> Self {
        Self { pool }
    }
}

impl AccountEntryRepository for SqliteAccountEntryRepository<'_> {
    type Error = sqlx::Error;

    fn list_account_entries(&self) -> RepositoryFuture<'_, Vec<AccountEntry>, Self::Error> {
        Box::pin(async move {
            let rows = sqlx::query_as::<_, AccountEntryRow>(
                r#"
                SELECT id, kind, occurred_on, partner_id, description, amount
                FROM account_entries
                ORDER BY occurred_on DESC, updated_at DESC
                "#,
            )
            .fetch_all(self.pool)
            .await?;

            let links = sqlx::query_as::<_, AccountEntryCategoryRow>(
                r#"
                SELECT account_entry_id, category_id
                FROM account_entry_categories
                "#,
            )
            .fetch_all(self.pool)
            .await?;

            let mut by_entry: HashMap<String, Vec<String>> = HashMap::new();
            for link in links {
                by_entry
                    .entry(link.account_entry_id)
                    .or_default()
                    .push(link.category_id);
            }

            Ok(rows
                .into_iter()
                .map(|row| {
                    let category_ids = by_entry.remove(&row.id).unwrap_or_default();
                    build_account_entry(row, category_ids)
                })
                .collect())
        })
    }

    fn create_account_entry(
        &self,
        input: NewAccountEntry,
    ) -> RepositoryFuture<'_, AccountEntry, Self::Error> {
        Box::pin(async move {
            let mut tx = self.pool.begin().await?;

            let row = sqlx::query_as::<_, AccountEntryRow>(
                r#"
                INSERT INTO account_entries (
                  id, kind, occurred_on, partner_id, description, amount
                )
                VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?)
                RETURNING id, kind, occurred_on, partner_id, description, amount
                "#,
            )
            .bind(input.kind.trim())
            .bind(input.occurred_on.trim())
            .bind(input.partner_id.trim())
            .bind(input.description.trim())
            .bind(input.amount)
            .fetch_one(&mut *tx)
            .await?;

            let mut category_ids: Vec<String> = Vec::with_capacity(input.category_ids.len());
            for category_id in &input.category_ids {
                let trimmed = category_id.trim().to_string();
                sqlx::query(
                    r#"
                    INSERT INTO account_entry_categories (account_entry_id, category_id)
                    VALUES (?, ?)
                    "#,
                )
                .bind(&row.id)
                .bind(&trimmed)
                .execute(&mut *tx)
                .await?;
                category_ids.push(trimmed);
            }

            tx.commit().await?;

            Ok(build_account_entry(row, category_ids))
        })
    }

    fn update_account_entry(
        &self,
        input: UpdateAccountEntry,
    ) -> RepositoryFuture<'_, AccountEntry, Self::Error> {
        Box::pin(async move {
            let mut tx = self.pool.begin().await?;

            let row = sqlx::query_as::<_, AccountEntryRow>(
                r#"
                UPDATE account_entries
                SET
                  kind = ?,
                  occurred_on = ?,
                  partner_id = ?,
                  description = ?,
                  amount = ?,
                  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
                RETURNING id, kind, occurred_on, partner_id, description, amount
                "#,
            )
            .bind(input.kind.trim())
            .bind(input.occurred_on.trim())
            .bind(input.partner_id.trim())
            .bind(input.description.trim())
            .bind(input.amount)
            .bind(&input.id)
            .fetch_one(&mut *tx)
            .await?;

            sqlx::query(
                r#"
                DELETE FROM account_entry_categories
                WHERE account_entry_id = ?
                "#,
            )
            .bind(&row.id)
            .execute(&mut *tx)
            .await?;

            let mut category_ids: Vec<String> = Vec::with_capacity(input.category_ids.len());
            for category_id in &input.category_ids {
                let trimmed = category_id.trim().to_string();
                sqlx::query(
                    r#"
                    INSERT INTO account_entry_categories (account_entry_id, category_id)
                    VALUES (?, ?)
                    "#,
                )
                .bind(&row.id)
                .bind(&trimmed)
                .execute(&mut *tx)
                .await?;
                category_ids.push(trimmed);
            }

            tx.commit().await?;

            Ok(build_account_entry(row, category_ids))
        })
    }

    fn delete_account_entry<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error> {
        Box::pin(async move {
            let result = sqlx::query(
                r#"
                DELETE FROM account_entries
                WHERE id = ?
                "#,
            )
            .bind(id)
            .execute(self.pool)
            .await?;

            if result.rows_affected() == 0 {
                return Err(sqlx::Error::RowNotFound);
            }

            Ok(())
        })
    }
}

#[derive(FromRow)]
struct AccountEntryRow {
    id: String,
    kind: String,
    occurred_on: String,
    partner_id: String,
    description: String,
    amount: i64,
}

#[derive(FromRow)]
struct AccountEntryCategoryRow {
    account_entry_id: String,
    category_id: String,
}

fn build_account_entry(row: AccountEntryRow, category_ids: Vec<String>) -> AccountEntry {
    AccountEntry {
        id: row.id,
        kind: row.kind,
        occurred_on: row.occurred_on,
        partner_id: row.partner_id,
        category_ids,
        description: row.description,
        amount: row.amount,
    }
}
