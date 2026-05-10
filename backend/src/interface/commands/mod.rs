//! Tauri command handlers.

use std::fs;

use tauri::State;
use tauri_plugin_dialog::DialogExt as _;

use crate::{
    application::use_cases,
    infrastructure::{
        db::AppDatabase,
        repositories::{
            account_entry_repository::SqliteAccountEntryRepository,
            category_repository::SqliteCategoryRepository,
            partner_repository::SqlitePartnerRepository,
            settings_repository::SqliteSettingsRepository,
        },
    },
    interface::dto::{
        account_entry::{AccountEntryDto, CreateAccountEntryDto, UpdateAccountEntryDto},
        category::{CategoryDto, CreateCategoryDto, UpdateCategoryDto},
        debug_info::DebugInfoDto,
        partner::{CreatePartnerDto, PartnerDto, UpdatePartnerDto},
        settings::{SettingsDto, UpdateSettingsDto},
    },
};

#[tauri::command]
#[specta::specta]
pub fn backend_health() -> bool {
    true
}

#[tauri::command]
#[specta::specta]
pub fn get_debug_info(database: State<'_, AppDatabase>) -> DebugInfoDto {
    DebugInfoDto {
        app_version: env!("CARGO_PKG_VERSION").to_owned(),
        commit_hash: option_env!("MOA_COMMIT_HASH")
            .unwrap_or("unknown")
            .to_owned(),
        build_timestamp: option_env!("MOA_BUILD_TIMESTAMP")
            .unwrap_or("unknown")
            .to_owned(),
        database_path: database.path().display().to_string(),
    }
}

#[tauri::command]
#[specta::specta]
pub async fn list_partners(database: State<'_, AppDatabase>) -> Result<Vec<PartnerDto>, String> {
    let repository = SqlitePartnerRepository::new(database.pool());
    let partners = use_cases::partners::list_partners(&repository).await?;

    Ok(partners.into_iter().map(PartnerDto::from).collect())
}

#[tauri::command]
#[specta::specta]
pub async fn create_partner(
    database: State<'_, AppDatabase>,
    input: CreatePartnerDto,
) -> Result<PartnerDto, String> {
    let repository = SqlitePartnerRepository::new(database.pool());
    let partner = use_cases::partners::create_partner(&repository, input.into()).await?;

    Ok(partner.into())
}

#[tauri::command]
#[specta::specta]
pub async fn update_partner(
    database: State<'_, AppDatabase>,
    input: UpdatePartnerDto,
) -> Result<PartnerDto, String> {
    let repository = SqlitePartnerRepository::new(database.pool());
    let partner = use_cases::partners::update_partner(&repository, input.into()).await?;

    Ok(partner.into())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_partner(database: State<'_, AppDatabase>, id: String) -> Result<(), String> {
    let repository = SqlitePartnerRepository::new(database.pool());

    use_cases::partners::delete_partner(&repository, &id).await
}

#[tauri::command]
#[specta::specta]
pub async fn list_categories(database: State<'_, AppDatabase>) -> Result<Vec<CategoryDto>, String> {
    let repository = SqliteCategoryRepository::new(database.pool());
    let categories = use_cases::categories::list_categories(&repository).await?;

    Ok(categories.into_iter().map(CategoryDto::from).collect())
}

#[tauri::command]
#[specta::specta]
pub async fn create_category(
    database: State<'_, AppDatabase>,
    input: CreateCategoryDto,
) -> Result<CategoryDto, String> {
    let repository = SqliteCategoryRepository::new(database.pool());
    let category = use_cases::categories::create_category(&repository, input.into()).await?;

    Ok(category.into())
}

#[tauri::command]
#[specta::specta]
pub async fn update_category(
    database: State<'_, AppDatabase>,
    input: UpdateCategoryDto,
) -> Result<CategoryDto, String> {
    let repository = SqliteCategoryRepository::new(database.pool());
    let category = use_cases::categories::update_category(&repository, input.into()).await?;

    Ok(category.into())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_category(database: State<'_, AppDatabase>, id: String) -> Result<(), String> {
    let repository = SqliteCategoryRepository::new(database.pool());

    use_cases::categories::delete_category(&repository, &id).await
}

/// 設定を取得する Tauri command。
#[tauri::command]
#[specta::specta]
pub async fn get_settings(database: State<'_, AppDatabase>) -> Result<SettingsDto, String> {
    let repository = SqliteSettingsRepository::new(database.pool());
    let settings = use_cases::settings::get_settings(&repository).await?;

    Ok(settings.into())
}

/// 設定を保存する Tauri command。
#[tauri::command]
#[specta::specta]
pub async fn save_settings(
    database: State<'_, AppDatabase>,
    input: UpdateSettingsDto,
) -> Result<SettingsDto, String> {
    let repository = SqliteSettingsRepository::new(database.pool());
    let settings = use_cases::settings::save_settings(&repository, input.into()).await?;

    Ok(settings.into())
}

#[tauri::command]
#[specta::specta]
pub async fn list_account_entries(
    database: State<'_, AppDatabase>,
) -> Result<Vec<AccountEntryDto>, String> {
    let repository = SqliteAccountEntryRepository::new(database.pool());
    let entries = use_cases::account_entries::list_account_entries(&repository).await?;

    Ok(entries.into_iter().map(AccountEntryDto::from).collect())
}

#[tauri::command]
#[specta::specta]
pub async fn create_account_entry(
    database: State<'_, AppDatabase>,
    input: CreateAccountEntryDto,
) -> Result<AccountEntryDto, String> {
    let repository = SqliteAccountEntryRepository::new(database.pool());
    let entry = use_cases::account_entries::create_account_entry(&repository, input.into()).await?;

    Ok(entry.into())
}

#[tauri::command]
#[specta::specta]
pub async fn update_account_entry(
    database: State<'_, AppDatabase>,
    input: UpdateAccountEntryDto,
) -> Result<AccountEntryDto, String> {
    let repository = SqliteAccountEntryRepository::new(database.pool());
    let entry = use_cases::account_entries::update_account_entry(&repository, input.into()).await?;

    Ok(entry.into())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_account_entry(
    database: State<'_, AppDatabase>,
    id: String,
) -> Result<(), String> {
    let repository = SqliteAccountEntryRepository::new(database.pool());

    use_cases::account_entries::delete_account_entry(&repository, &id).await
}

/// CSV の保存先を Tauri のネイティブ保存ダイアログで選ばせ、選択されたパスへ内容を書き込む。
///
/// フロントエンドは CSV 文字列と既定ファイル名だけを渡し、OS ダイアログとファイル書き込みは
/// Tauri command 側へ寄せる。ユーザーがキャンセルした場合は `Ok(false)` を返す。
#[tauri::command]
#[specta::specta]
pub async fn export_ledger_csv(
    app: tauri::AppHandle,
    file_name: String,
    contents: String,
) -> Result<bool, String> {
    let selected_path = app
        .dialog()
        .file()
        .set_title("CSV を保存")
        .set_file_name(file_name)
        .add_filter("CSV", &["csv"])
        .blocking_save_file();
    let Some(selected_path) = selected_path else {
        return Ok(false);
    };
    let path = selected_path
        .into_path()
        .map_err(|error| format!("保存先の取得に失敗しました: {error}"))?;

    fs::write(&path, contents).map_err(|error| format!("CSV の保存に失敗しました: {error}"))?;

    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backend_health_returns_ok() {
        assert!(backend_health());
    }
}
