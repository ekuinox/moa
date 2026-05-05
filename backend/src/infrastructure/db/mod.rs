//! SQLite connection and migration setup.

use std::{error::Error, fs};

use sqlx::{
    SqlitePool,
    migrate::Migrator,
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};
use tauri::{AppHandle, Manager};

static MIGRATOR: Migrator = sqlx::migrate!("./migrations");

pub type DbResult<T> = Result<T, Box<dyn Error>>;

pub struct AppDatabase {
    pool: SqlitePool,
}

impl AppDatabase {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}

pub async fn initialize(app_handle: &AppHandle) -> DbResult<AppDatabase> {
    let app_data_dir = app_handle.path().app_data_dir()?;
    fs::create_dir_all(&app_data_dir)?;

    let db_path = app_data_dir.join("moa.sqlite3");
    let options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    MIGRATOR.run(&pool).await?;

    Ok(AppDatabase::new(pool))
}
