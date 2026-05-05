pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod interface;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let database =
                tauri::async_runtime::block_on(infrastructure::db::initialize(app.handle()))?;

            app.manage(database);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
