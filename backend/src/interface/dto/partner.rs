//! Partner DTOs.

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::domain::models::partner::{NewPartner, Partner, UpdatePartner};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PartnerDto {
    pub id: String,
    pub name: String,
    pub kana: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreatePartnerDto {
    pub name: String,
    pub kana: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePartnerDto {
    pub id: String,
    pub name: String,
    pub kana: String,
}

impl From<Partner> for PartnerDto {
    fn from(partner: Partner) -> Self {
        Self {
            id: partner.id,
            name: partner.name,
            kana: partner.kana,
        }
    }
}

impl From<CreatePartnerDto> for NewPartner {
    fn from(input: CreatePartnerDto) -> Self {
        Self::new(input.name, input.kana)
    }
}

impl From<UpdatePartnerDto> for UpdatePartner {
    fn from(input: UpdatePartnerDto) -> Self {
        Self::new(input.id, input.name, input.kana)
    }
}
