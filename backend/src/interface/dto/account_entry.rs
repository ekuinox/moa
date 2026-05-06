//! Account entry DTOs.

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::domain::models::account_entry::{AccountEntry, NewAccountEntry, UpdateAccountEntry};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AccountEntryDto {
    pub id: String,
    pub kind: String,
    pub occurred_on: String,
    pub partner_id: String,
    pub category_id: String,
    pub description: String,
    pub amount: i64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateAccountEntryDto {
    pub kind: String,
    pub occurred_on: String,
    pub partner_id: String,
    pub category_id: String,
    pub description: String,
    pub amount: i64,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAccountEntryDto {
    pub id: String,
    pub kind: String,
    pub occurred_on: String,
    pub partner_id: String,
    pub category_id: String,
    pub description: String,
    pub amount: i64,
}

impl From<AccountEntry> for AccountEntryDto {
    fn from(entry: AccountEntry) -> Self {
        Self {
            id: entry.id,
            kind: entry.kind,
            occurred_on: entry.occurred_on,
            partner_id: entry.partner_id,
            category_id: entry.category_id,
            description: entry.description,
            amount: entry.amount,
        }
    }
}

impl From<CreateAccountEntryDto> for NewAccountEntry {
    fn from(input: CreateAccountEntryDto) -> Self {
        Self::new(
            input.kind,
            input.occurred_on,
            input.partner_id,
            input.category_id,
            input.description,
            input.amount,
        )
    }
}

impl From<UpdateAccountEntryDto> for UpdateAccountEntry {
    fn from(input: UpdateAccountEntryDto) -> Self {
        Self::new(
            input.id,
            input.kind,
            input.occurred_on,
            input.partner_id,
            input.category_id,
            input.description,
            input.amount,
        )
    }
}
