pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod interface;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let specta_builder = interface::bindings::builder();

    tauri::Builder::default()
        .invoke_handler(specta_builder.invoke_handler())
        .setup(|app| {
            let database =
                tauri::async_runtime::block_on(infrastructure::db::initialize(app.handle()))?;

            app.manage(database);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
