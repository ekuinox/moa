//! Partner repository port.

use std::{future::Future, pin::Pin};

use crate::domain::models::partner::{NewPartner, Partner, UpdatePartner};

/// Repository trait が返す非同期処理。
pub type RepositoryFuture<'future, T, E> =
    Pin<Box<dyn Future<Output = Result<T, E>> + Send + 'future>>;

/// 取引先マスタを永続化する repository 境界。
pub trait PartnerRepository {
    /// repository 実装が返すエラー型。
    type Error;

    /// 取引先を読み仮名順で一覧取得する。
    fn list_partners(&self) -> RepositoryFuture<'_, Vec<Partner>, Self::Error>;

    /// 取引先を作成する。
    fn create_partner(&self, input: NewPartner) -> RepositoryFuture<'_, Partner, Self::Error>;

    /// 既存の取引先を更新する。
    fn update_partner(&self, input: UpdatePartner) -> RepositoryFuture<'_, Partner, Self::Error>;

    /// 指定した ID の取引先を削除する。
    fn delete_partner<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error>;
}
