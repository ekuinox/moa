//! Fiscal year repository port.

use crate::{
    application::ports::partner_repository::RepositoryFuture,
    domain::models::fiscal_year::{
        FiscalYear, FiscalYearSetting, NewFiscalYear, SaveFiscalYearSetting, UpdateFiscalYear,
    },
};

/// 事業年度設定と事業年度を永続化する repository 境界。
pub trait FiscalYearRepository {
    /// repository 実装が返すエラー型。
    type Error;

    /// 事業年度設定を取得する。
    fn get_fiscal_year_setting(
        &self,
    ) -> RepositoryFuture<'_, Option<FiscalYearSetting>, Self::Error>;

    /// 事業年度設定を保存する。
    fn save_fiscal_year_setting(
        &self,
        input: SaveFiscalYearSetting,
    ) -> RepositoryFuture<'_, FiscalYearSetting, Self::Error>;

    /// 事業年度を期間順で一覧取得する。
    fn list_fiscal_years(&self) -> RepositoryFuture<'_, Vec<FiscalYear>, Self::Error>;

    /// 事業年度を作成する。
    fn create_fiscal_year(
        &self,
        input: NewFiscalYear,
    ) -> RepositoryFuture<'_, FiscalYear, Self::Error>;

    /// 既存の事業年度を更新する。
    fn update_fiscal_year(
        &self,
        input: UpdateFiscalYear,
    ) -> RepositoryFuture<'_, FiscalYear, Self::Error>;

    /// 指定した ID の事業年度を削除する。
    fn delete_fiscal_year<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error>;
}
