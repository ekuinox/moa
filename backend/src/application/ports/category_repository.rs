//! Category repository port.

use crate::{
    application::ports::partner_repository::RepositoryFuture,
    domain::models::category::{Category, NewCategory, UpdateCategory},
};

/// 種別マスタを永続化する repository 境界。
pub trait CategoryRepository {
    /// repository 実装が返すエラー型。
    type Error;

    /// 種別を名称順で一覧取得する。
    fn list_categories(&self) -> RepositoryFuture<'_, Vec<Category>, Self::Error>;

    /// 種別を作成する。
    fn create_category(&self, input: NewCategory) -> RepositoryFuture<'_, Category, Self::Error>;

    /// 既存の種別を更新する。
    fn update_category(&self, input: UpdateCategory)
    -> RepositoryFuture<'_, Category, Self::Error>;

    /// 指定した ID の種別を削除する。
    fn delete_category<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error>;
}
