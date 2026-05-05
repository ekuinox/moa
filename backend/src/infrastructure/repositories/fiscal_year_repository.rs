//! SQLite-backed fiscal year repository.

use sqlx::{FromRow, SqlitePool};

use crate::{
    application::ports::{
        fiscal_year_repository::FiscalYearRepository, partner_repository::RepositoryFuture,
    },
    domain::models::fiscal_year::{
        FiscalYear, FiscalYearSetting, NewFiscalYear, SaveFiscalYearSetting, UpdateFiscalYear,
    },
};

/// 事業年度設定は単一レコードで扱うので固定 ID で永続化する。
const DEFAULT_SETTING_ID: &str = "default";

/// SQLite に保存された事業年度設定と事業年度を操作する repository。
pub struct SqliteFiscalYearRepository<'pool> {
    pool: &'pool SqlitePool,
}

impl<'pool> SqliteFiscalYearRepository<'pool> {
    pub fn new(pool: &'pool SqlitePool) -> Self {
        Self { pool }
    }
}

impl FiscalYearRepository for SqliteFiscalYearRepository<'_> {
    type Error = sqlx::Error;

    fn get_fiscal_year_setting(
        &self,
    ) -> RepositoryFuture<'_, Option<FiscalYearSetting>, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, FiscalYearSettingRow>(
                r#"
                SELECT id, start_month, duration_months, naming_rule
                FROM fiscal_year_settings
                WHERE id = ?
                "#,
            )
            .bind(DEFAULT_SETTING_ID)
            .fetch_optional(self.pool)
            .await?;

            Ok(row.map(FiscalYearSetting::from))
        })
    }

    fn save_fiscal_year_setting(
        &self,
        input: SaveFiscalYearSetting,
    ) -> RepositoryFuture<'_, FiscalYearSetting, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, FiscalYearSettingRow>(
                r#"
                INSERT INTO fiscal_year_settings (id, start_month, duration_months, naming_rule)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    start_month = excluded.start_month,
                    duration_months = excluded.duration_months,
                    naming_rule = excluded.naming_rule,
                    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                RETURNING id, start_month, duration_months, naming_rule
                "#,
            )
            .bind(DEFAULT_SETTING_ID)
            .bind(input.start_month)
            .bind(input.duration_months)
            .bind(input.naming_rule.trim())
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn list_fiscal_years(&self) -> RepositoryFuture<'_, Vec<FiscalYear>, Self::Error> {
        Box::pin(async move {
            let rows = sqlx::query_as::<_, FiscalYearRow>(
                r#"
                SELECT id, name, start_month, end_month
                FROM fiscal_years
                ORDER BY start_month ASC, end_month ASC
                "#,
            )
            .fetch_all(self.pool)
            .await?;

            Ok(rows.into_iter().map(FiscalYear::from).collect())
        })
    }

    fn create_fiscal_year(
        &self,
        input: NewFiscalYear,
    ) -> RepositoryFuture<'_, FiscalYear, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, FiscalYearRow>(
                r#"
                INSERT INTO fiscal_years (id, name, start_month, end_month)
                VALUES (lower(hex(randomblob(16))), ?, ?, ?)
                RETURNING id, name, start_month, end_month
                "#,
            )
            .bind(input.name.trim())
            .bind(input.start_month.trim())
            .bind(input.end_month.trim())
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn update_fiscal_year(
        &self,
        input: UpdateFiscalYear,
    ) -> RepositoryFuture<'_, FiscalYear, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, FiscalYearRow>(
                r#"
                UPDATE fiscal_years
                SET
                  name = ?,
                  start_month = ?,
                  end_month = ?,
                  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
                RETURNING id, name, start_month, end_month
                "#,
            )
            .bind(input.name.trim())
            .bind(input.start_month.trim())
            .bind(input.end_month.trim())
            .bind(input.id)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn delete_fiscal_year<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error> {
        Box::pin(async move {
            let result = sqlx::query(
                r#"
                DELETE FROM fiscal_years
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

/// `fiscal_year_settings` テーブルから取得した 1 行。
#[derive(FromRow)]
struct FiscalYearSettingRow {
    id: String,
    start_month: i32,
    duration_months: i32,
    naming_rule: String,
}

impl From<FiscalYearSettingRow> for FiscalYearSetting {
    fn from(row: FiscalYearSettingRow) -> Self {
        Self {
            id: row.id,
            start_month: row.start_month,
            duration_months: row.duration_months,
            naming_rule: row.naming_rule,
        }
    }
}

/// `fiscal_years` テーブルから取得した 1 行。
#[derive(FromRow)]
struct FiscalYearRow {
    id: String,
    name: String,
    start_month: String,
    end_month: String,
}

impl From<FiscalYearRow> for FiscalYear {
    fn from(row: FiscalYearRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            start_month: row.start_month,
            end_month: row.end_month,
        }
    }
}
