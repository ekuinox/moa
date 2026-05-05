//! Tauri command handlers.

#[tauri::command]
#[specta::specta]
pub fn backend_health() -> bool {
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backend_health_returns_ok() {
        assert!(backend_health());
    }
}
