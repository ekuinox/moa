//! Application-wide settings domain models.

/// アプリ全体で 1 行だけ保持する設定。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Settings {
    /// 事業年度の開始月。
    pub fiscal_year_start_month: i32,
}

/// 設定を更新するときの入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpdateSettings {
    /// 事業年度の開始月。
    pub fiscal_year_start_month: i32,
}

impl Settings {
    /// 設定が未保存だった場合に使う既定値。
    pub fn default_settings() -> Self {
        Self {
            fiscal_year_start_month: 4,
        }
    }
}

impl UpdateSettings {
    pub fn new(fiscal_year_start_month: i32) -> Self {
        Self {
            fiscal_year_start_month,
        }
    }
}
