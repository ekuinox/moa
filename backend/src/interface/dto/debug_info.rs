//! Debug information DTOs.

use serde::Serialize;
use specta::Type;

/// フロントエンドへ返すアプリのデバッグ情報。
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct DebugInfoDto {
    /// アプリのバージョン。
    pub app_version: String,
    /// ビルド時点の Git commit hash。
    pub commit_hash: String,
    /// ビルド日時。
    pub build_timestamp: String,
    /// 利用中の SQLite DB パス。
    pub database_path: String,
}
