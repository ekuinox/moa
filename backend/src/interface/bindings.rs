//! Tauri command binding setup.

use std::path::Path;

use specta_typescript::Typescript;
use tauri_specta::{Builder, ErrorHandlingMode, collect_commands};

pub fn builder() -> Builder<tauri::Wry> {
    Builder::<tauri::Wry>::new()
        .commands(collect_commands![
            super::commands::backend_health,
            super::commands::list_partners,
            super::commands::create_partner,
            super::commands::update_partner,
            super::commands::delete_partner,
            super::commands::list_categories,
            super::commands::create_category,
            super::commands::update_category,
            super::commands::delete_category,
            super::commands::get_settings,
            super::commands::save_settings,
            super::commands::list_account_entries,
            super::commands::create_account_entry,
            super::commands::update_account_entry,
            super::commands::delete_account_entry,
            super::commands::export_ledger_csv
        ])
        .error_handling(ErrorHandlingMode::Throw)
}

pub fn export_typescript_bindings(path: impl AsRef<Path>) -> Result<(), specta_typescript::Error> {
    builder().export(Typescript::default(), path)
}
