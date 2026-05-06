use std::{
    env,
    error::Error,
    fs,
    path::{Path, PathBuf},
};

use serde::Deserialize;
use sqlx::{
    SqlitePool,
    migrate::Migrator,
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
};

static MIGRATOR: Migrator = sqlx::migrate!("./migrations");

type SeedResult<T> = Result<T, Box<dyn Error>>;

fn main() {
    if let Err(error) = tauri::async_runtime::block_on(seed_dev_data()) {
        eprintln!("failed to seed development data: {error}");
        std::process::exit(1);
    }
}

/// 開発用 DB を初期化し、CSV から画面確認しやすい固定データを投入する。
async fn seed_dev_data() -> SeedResult<()> {
    let seed_dir = parse_seed_dir_arg()?;
    let pool = connect_dev_database().await?;

    MIGRATOR.run(&pool).await?;
    clear_existing_data(&pool).await?;
    insert_seed_data(&pool, &seed_dir).await?;

    println!("seeded development database from {}", seed_dir.display());

    Ok(())
}

/// CSV ディレクトリの配置先は実行時に CLI 引数で受け取る。
fn parse_seed_dir_arg() -> SeedResult<PathBuf> {
    let mut args = env::args();
    let _bin = args.next();
    let seed_dir = args.next().ok_or("usage: seed_dev_data <seed-csv-dir>")?;
    Ok(PathBuf::from(seed_dir))
}

/// Tauri dev と同じ app data 配下の SQLite に接続する。
async fn connect_dev_database() -> SeedResult<SqlitePool> {
    let app_data = env::var_os("APPDATA").ok_or("APPDATA is not set")?;
    let db_dir = std::path::PathBuf::from(app_data).join("dev.ekuinox.moa");

    fs::create_dir_all(&db_dir)?;

    let db_path = db_dir.join("moa.sqlite3");
    let options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        .foreign_keys(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(options)
        .await?;

    Ok(pool)
}

/// 外部キーの参照順に合わせて既存データをすべて削除する。
async fn clear_existing_data(pool: &SqlitePool) -> SeedResult<()> {
    for table in [
        "account_entries",
        "fiscal_years",
        "fiscal_year_settings",
        "categories",
        "partners",
    ] {
        sqlx::query(&format!("DELETE FROM {table}"))
            .execute(pool)
            .await?;
    }

    Ok(())
}

/// 買掛・売掛表の月次、年間、取引先別の見た目を確認できる seed を CSV から投入する。
async fn insert_seed_data(pool: &SqlitePool, seed_dir: &Path) -> SeedResult<()> {
    let partners: Vec<PartnerRow> = read_csv(seed_dir, "partners.csv")?;
    let categories: Vec<CategoryRow> = read_csv(seed_dir, "categories.csv")?;
    let fiscal_year_settings: Vec<FiscalYearSettingRow> =
        read_csv(seed_dir, "fiscal_year_settings.csv")?;
    let fiscal_years: Vec<FiscalYearRow> = read_csv(seed_dir, "fiscal_years.csv")?;
    let account_entries: Vec<AccountEntryRow> = read_csv(seed_dir, "account_entries.csv")?;

    insert_partners(pool, &partners).await?;
    insert_categories(pool, &categories).await?;
    insert_fiscal_year_settings(pool, &fiscal_year_settings).await?;
    insert_fiscal_years(pool, &fiscal_years).await?;
    insert_account_entries(pool, &account_entries).await?;

    Ok(())
}

fn read_csv<T>(seed_dir: &Path, file_name: &str) -> SeedResult<Vec<T>>
where
    T: for<'de> Deserialize<'de>,
{
    let path = seed_dir.join(file_name);
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .from_path(&path)
        .map_err(|error| format!("failed to open {}: {error}", path.display()))?;
    let mut rows = Vec::new();
    for record in reader.deserialize::<T>() {
        rows.push(record.map_err(|error| format!("invalid row in {}: {error}", path.display()))?);
    }
    Ok(rows)
}

async fn insert_partners(pool: &SqlitePool, rows: &[PartnerRow]) -> SeedResult<()> {
    for row in rows {
        sqlx::query(
            r#"
            INSERT INTO partners (id, name, kana)
            VALUES (?, ?, ?)
            "#,
        )
        .bind(&row.id)
        .bind(&row.name)
        .bind(&row.kana)
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn insert_categories(pool: &SqlitePool, rows: &[CategoryRow]) -> SeedResult<()> {
    for row in rows {
        sqlx::query(
            r#"
            INSERT INTO categories (id, name)
            VALUES (?, ?)
            "#,
        )
        .bind(&row.id)
        .bind(&row.name)
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn insert_fiscal_year_settings(
    pool: &SqlitePool,
    rows: &[FiscalYearSettingRow],
) -> SeedResult<()> {
    for row in rows {
        sqlx::query(
            r#"
            INSERT INTO fiscal_year_settings (id, start_month, duration_months, naming_rule)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(&row.id)
        .bind(row.start_month)
        .bind(row.duration_months)
        .bind(&row.naming_rule)
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn insert_fiscal_years(pool: &SqlitePool, rows: &[FiscalYearRow]) -> SeedResult<()> {
    for row in rows {
        sqlx::query(
            r#"
            INSERT INTO fiscal_years (id, name, start_month, end_month)
            VALUES (?, ?, ?, ?)
            "#,
        )
        .bind(&row.id)
        .bind(&row.name)
        .bind(&row.start_month)
        .bind(&row.end_month)
        .execute(pool)
        .await?;
    }

    Ok(())
}

async fn insert_account_entries(pool: &SqlitePool, rows: &[AccountEntryRow]) -> SeedResult<()> {
    for row in rows {
        sqlx::query(
            r#"
            INSERT INTO account_entries (
              id, kind, occurred_on, partner_id, category_id, description, amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&row.id)
        .bind(&row.kind)
        .bind(&row.occurred_on)
        .bind(&row.partner_id)
        .bind(&row.category_id)
        .bind(&row.description)
        .bind(row.amount)
        .execute(pool)
        .await?;
    }

    Ok(())
}

#[derive(Debug, Deserialize)]
struct PartnerRow {
    id: String,
    name: String,
    kana: String,
}

#[derive(Debug, Deserialize)]
struct CategoryRow {
    id: String,
    name: String,
}

#[derive(Debug, Deserialize)]
struct FiscalYearSettingRow {
    id: String,
    start_month: i64,
    duration_months: i64,
    naming_rule: String,
}

#[derive(Debug, Deserialize)]
struct FiscalYearRow {
    id: String,
    name: String,
    start_month: String,
    end_month: String,
}

#[derive(Debug, Deserialize)]
struct AccountEntryRow {
    id: String,
    kind: String,
    occurred_on: String,
    partner_id: String,
    category_id: String,
    description: String,
    amount: i64,
}
