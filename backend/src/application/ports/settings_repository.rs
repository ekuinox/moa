//! Settings repository port.

use crate::{
    application::ports::partner_repository::RepositoryFuture,
    domain::models::settings::{Settings, UpdateSettings},
};

/// アプリ全体の設定を永続化する repository 境界。
pub trait SettingsRepository {
    /// repository 実装が返すエラー型。
    type Error;

    /// 設定を取得する。
    fn get_settings(&self) -> RepositoryFuture<'_, Settings, Self::Error>;

    /// 設定を保存する。
    fn save_settings(&self, input: UpdateSettings) -> RepositoryFuture<'_, Settings, Self::Error>;
}
