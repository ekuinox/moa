//! Domain layer.
//!
//! This layer owns business concepts and must not depend on Tauri, SQLite, or
//! infrastructure-specific crates.

pub mod models;
pub mod value_objects;
