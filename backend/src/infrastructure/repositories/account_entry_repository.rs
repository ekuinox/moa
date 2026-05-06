//! SQLite-backed account entry repository.

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
                SELECT id, kind, occurred_on, partner_id, category_id, description, amount
                FROM account_entries
                ORDER BY occurred_on DESC, updated_at DESC
                "#,
            )
            .fetch_all(self.pool)
            .await?;

            Ok(rows.into_iter().map(AccountEntry::from).collect())
        })
    }

    fn create_account_entry(
        &self,
        input: NewAccountEntry,
    ) -> RepositoryFuture<'_, AccountEntry, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, AccountEntryRow>(
                r#"
                INSERT INTO account_entries (
                  id, kind, occurred_on, partner_id, category_id, description, amount
                )
                VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?)
                RETURNING id, kind, occurred_on, partner_id, category_id, description, amount
                "#,
            )
            .bind(input.kind.trim())
            .bind(input.occurred_on.trim())
            .bind(input.partner_id.trim())
            .bind(input.category_id.trim())
            .bind(input.description.trim())
            .bind(input.amount)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn update_account_entry(
        &self,
        input: UpdateAccountEntry,
    ) -> RepositoryFuture<'_, AccountEntry, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, AccountEntryRow>(
                r#"
                UPDATE account_entries
                SET
                  kind = ?,
                  occurred_on = ?,
                  partner_id = ?,
                  category_id = ?,
                  description = ?,
                  amount = ?,
                  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
                RETURNING id, kind, occurred_on, partner_id, category_id, description, amount
                "#,
            )
            .bind(input.kind.trim())
            .bind(input.occurred_on.trim())
            .bind(input.partner_id.trim())
            .bind(input.category_id.trim())
            .bind(input.description.trim())
            .bind(input.amount)
            .bind(input.id)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
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
    category_id: String,
    description: String,
    amount: i64,
}

impl From<AccountEntryRow> for AccountEntry {
    fn from(row: AccountEntryRow) -> Self {
        Self {
            id: row.id,
            kind: row.kind,
            occurred_on: row.occurred_on,
            partner_id: row.partner_id,
            category_id: row.category_id,
            description: row.description,
            amount: row.amount,
        }
    }
}
