//! Fiscal year DTOs.

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::domain::models::fiscal_year::{
    FiscalYear, FiscalYearSetting, GenerateFiscalYear, NewFiscalYear, SaveFiscalYearSetting,
    UpdateFiscalYear,
};

/// フロントエンドへ返す事業年度設定。
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FiscalYearSettingDto {
    /// 事業年度の開始月。
    pub start_month: i32,
    /// 事業年度の期間月数。
    pub duration_months: i32,
    /// 事業年度名の付け方。
    pub naming_rule: String,
}

/// 事業年度設定保存 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SaveFiscalYearSettingDto {
    /// 事業年度の開始月。
    pub start_month: i32,
    /// 事業年度の期間月数。
    pub duration_months: i32,
    /// 事業年度名の付け方。
    pub naming_rule: String,
}

/// フロントエンドへ返す事業年度。
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FiscalYearDto {
    /// 事業年度を識別する ID。
    pub id: String,
    /// 事業年度の表示名。
    pub name: String,
    /// 事業年度の開始月。`YYYY-MM` 形式。
    pub start_month: String,
    /// 事業年度の終了月。`YYYY-MM` 形式。
    pub end_month: String,
}

/// 事業年度作成 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateFiscalYearDto {
    /// 事業年度の表示名。
    pub name: String,
    /// 事業年度の開始月。`YYYY-MM` 形式。
    pub start_month: String,
    /// 事業年度の終了月。`YYYY-MM` 形式。
    pub end_month: String,
}

/// 事業年度更新 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateFiscalYearDto {
    /// 更新対象の事業年度 ID。
    pub id: String,
    /// 更新後の事業年度の表示名。
    pub name: String,
    /// 更新後の事業年度の開始月。`YYYY-MM` 形式。
    pub start_month: String,
    /// 更新後の事業年度の終了月。`YYYY-MM` 形式。
    pub end_month: String,
}

/// 事業年度自動生成 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GenerateFiscalYearDto {
    /// 生成する事業年度の開始年。
    pub start_year: i32,
}

impl From<FiscalYearSetting> for FiscalYearSettingDto {
    fn from(setting: FiscalYearSetting) -> Self {
        Self {
            start_month: setting.start_month,
            duration_months: setting.duration_months,
            naming_rule: setting.naming_rule,
        }
    }
}

impl From<SaveFiscalYearSettingDto> for SaveFiscalYearSetting {
    fn from(input: SaveFiscalYearSettingDto) -> Self {
        Self::new(input.start_month, input.duration_months, input.naming_rule)
    }
}

impl From<FiscalYear> for FiscalYearDto {
    fn from(fiscal_year: FiscalYear) -> Self {
        Self {
            id: fiscal_year.id,
            name: fiscal_year.name,
            start_month: fiscal_year.start_month,
            end_month: fiscal_year.end_month,
        }
    }
}

impl From<CreateFiscalYearDto> for NewFiscalYear {
    fn from(input: CreateFiscalYearDto) -> Self {
        Self::new(input.name, input.start_month, input.end_month)
    }
}

impl From<UpdateFiscalYearDto> for UpdateFiscalYear {
    fn from(input: UpdateFiscalYearDto) -> Self {
        Self::new(input.id, input.name, input.start_month, input.end_month)
    }
}

impl From<GenerateFiscalYearDto> for GenerateFiscalYear {
    fn from(input: GenerateFiscalYearDto) -> Self {
        Self::new(input.start_year)
    }
}
