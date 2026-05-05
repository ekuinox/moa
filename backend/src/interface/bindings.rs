//! Tauri command binding setup.

use std::path::Path;

use specta_typescript::Typescript;
use tauri_specta::{Builder, ErrorHandlingMode, collect_commands};

pub fn builder() -> Builder<tauri::Wry> {
    Builder::<tauri::Wry>::new()
        .commands(collect_commands![super::commands::backend_health])
        .error_handling(ErrorHandlingMode::Throw)
}

pub fn export_typescript_bindings(path: impl AsRef<Path>) -> Result<(), specta_typescript::Error> {
    builder().export(Typescript::default(), path)
}
