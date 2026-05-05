//! Partner DTOs.

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::domain::models::partner::{NewPartner, Partner, UpdatePartner};

/// フロントエンドへ返す取引先。
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PartnerDto {
    /// 取引先を識別する ID。
    pub id: String,
    /// 取引先の表示名。
    pub name: String,
    /// 取引先の読み仮名。
    pub kana: String,
}

/// 取引先作成 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreatePartnerDto {
    /// 取引先の表示名。
    pub name: String,
    /// 取引先の読み仮名。
    pub kana: String,
}

/// 取引先更新 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePartnerDto {
    /// 更新対象の取引先 ID。
    pub id: String,
    /// 更新後の取引先の表示名。
    pub name: String,
    /// 更新後の取引先の読み仮名。
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
