//! Partner domain model.

/// 取引先マスタに登録された取引先。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Partner {
    /// 取引先を識別する ID。
    pub id: String,
    /// 取引先の表示名。
    pub name: String,
    /// 取引先の読み仮名。
    pub kana: String,
}

/// 新しく作成する取引先の入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewPartner {
    /// 取引先の表示名。
    pub name: String,
    /// 取引先の読み仮名。
    pub kana: String,
}

/// 更新する取引先の入力値。
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpdatePartner {
    /// 更新対象の取引先 ID。
    pub id: String,
    /// 更新後の取引先の表示名。
    pub name: String,
    /// 更新後の取引先の読み仮名。
    pub kana: String,
}

impl NewPartner {
    pub fn new(name: impl Into<String>, kana: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            kana: kana.into(),
        }
    }
}

impl UpdatePartner {
    pub fn new(id: impl Into<String>, name: impl Into<String>, kana: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            kana: kana.into(),
        }
    }
}
