//! Category domain model.

/// 買掛・売掛明細に付与する種別。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Category {
    /// 種別を識別する ID。
    pub id: String,
    /// 種別の表示名。
    pub name: String,
}

/// 新しく作成する種別の入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewCategory {
    /// 種別の表示名。
    pub name: String,
}

/// 更新する種別の入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpdateCategory {
    /// 更新対象の種別 ID。
    pub id: String,
    /// 更新後の種別の表示名。
    pub name: String,
}

impl NewCategory {
    pub fn new(name: impl Into<String>) -> Self {
        Self { name: name.into() }
    }
}

impl UpdateCategory {
    pub fn new(id: impl Into<String>, name: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
        }
    }
}
