//! Tauri command handlers.

use tauri::State;

use crate::{
    application::use_cases,
    infrastructure::{
        db::AppDatabase,
        repositories::{
            category_repository::SqliteCategoryRepository,
            fiscal_year_repository::SqliteFiscalYearRepository,
            partner_repository::SqlitePartnerRepository,
        },
    },
    interface::dto::{
        category::{CategoryDto, CreateCategoryDto, UpdateCategoryDto},
        fiscal_year::{
            CreateFiscalYearDto, FiscalYearDto, FiscalYearSettingDto, GenerateFiscalYearDto,
            SaveFiscalYearSettingDto, UpdateFiscalYearDto,
        },
        partner::{CreatePartnerDto, PartnerDto, UpdatePartnerDto},
    },
};

#[tauri::command]
#[specta::specta]
pub fn backend_health() -> bool {
    true
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

#[tauri::command]
#[specta::specta]
pub async fn get_fiscal_year_setting(
    database: State<'_, AppDatabase>,
) -> Result<FiscalYearSettingDto, String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());
    let setting = use_cases::fiscal_years::get_fiscal_year_setting(&repository).await?;

    Ok(setting.into())
}

#[tauri::command]
#[specta::specta]
pub async fn save_fiscal_year_setting(
    database: State<'_, AppDatabase>,
    input: SaveFiscalYearSettingDto,
) -> Result<FiscalYearSettingDto, String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());
    let setting =
        use_cases::fiscal_years::save_fiscal_year_setting(&repository, input.into()).await?;

    Ok(setting.into())
}

#[tauri::command]
#[specta::specta]
pub async fn list_fiscal_years(
    database: State<'_, AppDatabase>,
) -> Result<Vec<FiscalYearDto>, String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());
    let fiscal_years = use_cases::fiscal_years::list_fiscal_years(&repository).await?;

    Ok(fiscal_years.into_iter().map(FiscalYearDto::from).collect())
}

#[tauri::command]
#[specta::specta]
pub async fn create_fiscal_year(
    database: State<'_, AppDatabase>,
    input: CreateFiscalYearDto,
) -> Result<FiscalYearDto, String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());
    let fiscal_year =
        use_cases::fiscal_years::create_fiscal_year(&repository, input.into()).await?;

    Ok(fiscal_year.into())
}

#[tauri::command]
#[specta::specta]
pub async fn update_fiscal_year(
    database: State<'_, AppDatabase>,
    input: UpdateFiscalYearDto,
) -> Result<FiscalYearDto, String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());
    let fiscal_year =
        use_cases::fiscal_years::update_fiscal_year(&repository, input.into()).await?;

    Ok(fiscal_year.into())
}

#[tauri::command]
#[specta::specta]
pub async fn delete_fiscal_year(
    database: State<'_, AppDatabase>,
    id: String,
) -> Result<(), String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());

    use_cases::fiscal_years::delete_fiscal_year(&repository, &id).await
}

#[tauri::command]
#[specta::specta]
pub async fn generate_fiscal_year(
    database: State<'_, AppDatabase>,
    input: GenerateFiscalYearDto,
) -> Result<FiscalYearDto, String> {
    let repository = SqliteFiscalYearRepository::new(database.pool());
    let fiscal_year =
        use_cases::fiscal_years::generate_fiscal_year(&repository, input.into()).await?;

    Ok(fiscal_year.into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backend_health_returns_ok() {
        assert!(backend_health());
    }
}
