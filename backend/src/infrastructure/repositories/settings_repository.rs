//! SQLite-backed settings repository.

use sqlx::{FromRow, SqlitePool};

use crate::{
    application::ports::{
        partner_repository::RepositoryFuture, settings_repository::SettingsRepository,
    },
    domain::models::settings::{Settings, UpdateSettings},
};

/// 設定はマイグレーションで挿入される単一行で扱うため固定 ID を使う。
const SETTINGS_ID: &str = "default";

/// SQLite に保存された設定を操作する repository。
pub struct SqliteSettingsRepository<'pool> {
    pool: &'pool SqlitePool,
}

impl<'pool> SqliteSettingsRepository<'pool> {
    pub fn new(pool: &'pool SqlitePool) -> Self {
        Self { pool }
    }
}

impl SettingsRepository for SqliteSettingsRepository<'_> {
    type Error = sqlx::Error;

    fn get_settings(&self) -> RepositoryFuture<'_, Settings, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, SettingsRow>(
                r#"
                SELECT fiscal_year_start_month
                FROM settings
                WHERE id = ?
                "#,
            )
            .bind(SETTINGS_ID)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn save_settings(&self, input: UpdateSettings) -> RepositoryFuture<'_, Settings, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, SettingsRow>(
                r#"
                UPDATE settings
                SET fiscal_year_start_month = ?,
                    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
                RETURNING fiscal_year_start_month
                "#,
            )
            .bind(input.fiscal_year_start_month)
            .bind(SETTINGS_ID)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }
}

/// `settings` テーブルから取得した 1 行。
#[derive(FromRow)]
struct SettingsRow {
    fiscal_year_start_month: i32,
}

impl From<SettingsRow> for Settings {
    fn from(row: SettingsRow) -> Self {
        Self {
            fiscal_year_start_month: row.fiscal_year_start_month,
        }
    }
}
