//! Account entry domain model.

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AccountEntry {
    pub id: String,
    pub kind: String,
    pub occurred_on: String,
    pub partner_id: String,
    pub category_ids: Vec<String>,
    pub description: String,
    pub amount: i64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewAccountEntry {
    pub kind: String,
    pub occurred_on: String,
    pub partner_id: String,
    pub category_ids: Vec<String>,
    pub description: String,
    pub amount: i64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpdateAccountEntry {
    pub id: String,
    pub kind: String,
    pub occurred_on: String,
    pub partner_id: String,
    pub category_ids: Vec<String>,
    pub description: String,
    pub amount: i64,
}

impl NewAccountEntry {
    pub fn new(
        kind: impl Into<String>,
        occurred_on: impl Into<String>,
        partner_id: impl Into<String>,
        category_ids: Vec<String>,
        description: impl Into<String>,
        amount: i64,
    ) -> Self {
        Self {
            kind: kind.into(),
            occurred_on: occurred_on.into(),
            partner_id: partner_id.into(),
            category_ids,
            description: description.into(),
            amount,
        }
    }
}

impl UpdateAccountEntry {
    pub fn new(
        id: impl Into<String>,
        kind: impl Into<String>,
        occurred_on: impl Into<String>,
        partner_id: impl Into<String>,
        category_ids: Vec<String>,
        description: impl Into<String>,
        amount: i64,
    ) -> Self {
        Self {
            id: id.into(),
            kind: kind.into(),
            occurred_on: occurred_on.into(),
            partner_id: partner_id.into(),
            category_ids,
            description: description.into(),
            amount,
        }
    }
}
