//! Settings DTOs.

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::domain::models::settings::{Settings, UpdateSettings};

/// フロントエンドへ返すアプリ全体の設定。
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct SettingsDto {
    /// 事業年度の開始月。
    pub fiscal_year_start_month: i32,
}

/// 設定更新 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsDto {
    /// 事業年度の開始月。
    pub fiscal_year_start_month: i32,
}

impl From<Settings> for SettingsDto {
    fn from(settings: Settings) -> Self {
        Self {
            fiscal_year_start_month: settings.fiscal_year_start_month,
        }
    }
}

impl From<UpdateSettingsDto> for UpdateSettings {
    fn from(input: UpdateSettingsDto) -> Self {
        Self::new(input.fiscal_year_start_month)
    }
}
