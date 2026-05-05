//! Category DTOs.

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::domain::models::category::{Category, NewCategory, UpdateCategory};

/// フロントエンドへ返す種別。
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CategoryDto {
    /// 種別を識別する ID。
    pub id: String,
    /// 種別の表示名。
    pub name: String,
}

/// 種別作成 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateCategoryDto {
    /// 種別の表示名。
    pub name: String,
}

/// 種別更新 command の入力値。
#[derive(Clone, Debug, Eq, PartialEq, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCategoryDto {
    /// 更新対象の種別 ID。
    pub id: String,
    /// 更新後の種別の表示名。
    pub name: String,
}

impl From<Category> for CategoryDto {
    fn from(category: Category) -> Self {
        Self {
            id: category.id,
            name: category.name,
        }
    }
}

impl From<CreateCategoryDto> for NewCategory {
    fn from(input: CreateCategoryDto) -> Self {
        Self::new(input.name)
    }
}

impl From<UpdateCategoryDto> for UpdateCategory {
    fn from(input: UpdateCategoryDto) -> Self {
        Self::new(input.id, input.name)
    }
}
