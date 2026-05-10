//! SQLite connection and migration setup.

use std::{
    env,
    error::Error,
    fs,
    path::{Path, PathBuf},
};

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
    path: PathBuf,
}

impl AppDatabase {
    pub fn new(pool: SqlitePool, path: PathBuf) -> Self {
        Self { pool, path }
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

pub async fn initialize(app_handle: &AppHandle) -> DbResult<AppDatabase> {
    let db_path = database_path(app_handle)?;
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let options = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    MIGRATOR.run(&pool).await?;

    Ok(AppDatabase::new(pool, db_path))
}

fn database_path(app_handle: &AppHandle) -> DbResult<PathBuf> {
    if let Some(db_path) = env::var_os("MOA_DATABASE_PATH") {
        return Ok(PathBuf::from(db_path));
    }

    Ok(app_handle.path().app_data_dir()?.join("moa.sqlite3"))
}
