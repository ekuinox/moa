//! Tauri command handlers.

use tauri::State;

use crate::{
    application::use_cases,
    infrastructure::{db::AppDatabase, repositories::partner_repository::SqlitePartnerRepository},
    interface::dto::partner::{CreatePartnerDto, PartnerDto, UpdatePartnerDto},
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn backend_health_returns_ok() {
        assert!(backend_health());
    }
}
