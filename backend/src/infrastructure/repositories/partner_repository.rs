//! SQLite-backed partner repository.

use sqlx::{FromRow, SqlitePool};

use crate::{
    application::ports::partner_repository::{PartnerRepository, RepositoryFuture},
    domain::models::partner::{NewPartner, Partner, UpdatePartner},
};

pub struct SqlitePartnerRepository<'pool> {
    pool: &'pool SqlitePool,
}

impl<'pool> SqlitePartnerRepository<'pool> {
    pub fn new(pool: &'pool SqlitePool) -> Self {
        Self { pool }
    }
}

impl PartnerRepository for SqlitePartnerRepository<'_> {
    type Error = sqlx::Error;

    fn list_partners(&self) -> RepositoryFuture<'_, Vec<Partner>, Self::Error> {
        Box::pin(async move {
            let rows = sqlx::query_as::<_, PartnerRow>(
                r#"
                SELECT id, name, kana
                FROM partners
                ORDER BY kana ASC, name ASC
                "#,
            )
            .fetch_all(self.pool)
            .await?;

            Ok(rows.into_iter().map(Partner::from).collect())
        })
    }

    fn create_partner(&self, input: NewPartner) -> RepositoryFuture<'_, Partner, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, PartnerRow>(
                r#"
                INSERT INTO partners (id, name, kana)
                VALUES (lower(hex(randomblob(16))), ?, ?)
                RETURNING id, name, kana
                "#,
            )
            .bind(input.name.trim())
            .bind(input.kana.trim())
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn update_partner(&self, input: UpdatePartner) -> RepositoryFuture<'_, Partner, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, PartnerRow>(
                r#"
                UPDATE partners
                SET
                  name = ?,
                  kana = ?,
                  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
                RETURNING id, name, kana
                "#,
            )
            .bind(input.name.trim())
            .bind(input.kana.trim())
            .bind(input.id)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn delete_partner<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error> {
        Box::pin(async move {
            let result = sqlx::query(
                r#"
                DELETE FROM partners
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
struct PartnerRow {
    id: String,
    name: String,
    kana: String,
}

impl From<PartnerRow> for Partner {
    fn from(row: PartnerRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            kana: row.kana,
        }
    }
}
