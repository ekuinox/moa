//! Fiscal year domain models.

/// 事業年度を生成・解釈するための基本ルール。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FiscalYearSetting {
    /// 設定を識別する ID。
    pub id: String,
    /// 事業年度の開始月。
    pub start_month: i32,
    /// 事業年度の期間月数。
    pub duration_months: i32,
    /// 事業年度名の付け方。
    pub naming_rule: String,
}

/// 事業年度設定を保存するときの入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SaveFiscalYearSetting {
    /// 事業年度の開始月。
    pub start_month: i32,
    /// 事業年度の期間月数。
    pub duration_months: i32,
    /// 事業年度名の付け方。
    pub naming_rule: String,
}

/// 実際に利用する事業年度期間。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FiscalYear {
    /// 事業年度を識別する ID。
    pub id: String,
    /// 事業年度の表示名。
    pub name: String,
    /// 事業年度の開始月。`YYYY-MM` 形式。
    pub start_month: String,
    /// 事業年度の終了月。`YYYY-MM` 形式。
    pub end_month: String,
}

/// 新しく作成する事業年度の入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewFiscalYear {
    /// 事業年度の表示名。
    pub name: String,
    /// 事業年度の開始月。`YYYY-MM` 形式。
    pub start_month: String,
    /// 事業年度の終了月。`YYYY-MM` 形式。
    pub end_month: String,
}

/// 更新する事業年度の入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpdateFiscalYear {
    /// 更新対象の事業年度 ID。
    pub id: String,
    /// 更新後の事業年度の表示名。
    pub name: String,
    /// 更新後の事業年度の開始月。`YYYY-MM` 形式。
    pub start_month: String,
    /// 更新後の事業年度の終了月。`YYYY-MM` 形式。
    pub end_month: String,
}

/// 基本ルールから事業年度を自動生成するときの入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GenerateFiscalYear {
    /// 生成する事業年度の開始年。
    pub start_year: i32,
}

impl FiscalYearSetting {
    pub fn default_setting() -> Self {
        Self {
            id: "default".to_string(),
            start_month: 4,
            duration_months: 12,
            naming_rule: "start_year".to_string(),
        }
    }
}

impl SaveFiscalYearSetting {
    pub fn new(start_month: i32, duration_months: i32, naming_rule: impl Into<String>) -> Self {
        Self {
            start_month,
            duration_months,
            naming_rule: naming_rule.into(),
        }
    }
}

impl NewFiscalYear {
    pub fn new(
        name: impl Into<String>,
        start_month: impl Into<String>,
        end_month: impl Into<String>,
    ) -> Self {
        Self {
            name: name.into(),
            start_month: start_month.into(),
            end_month: end_month.into(),
        }
    }
}

impl UpdateFiscalYear {
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        start_month: impl Into<String>,
        end_month: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            start_month: start_month.into(),
            end_month: end_month.into(),
        }
    }
}

impl GenerateFiscalYear {
    pub fn new(start_year: i32) -> Self {
        Self { start_year }
    }
}
