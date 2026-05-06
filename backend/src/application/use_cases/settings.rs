//! Settings use cases.

use crate::{
    application::ports::settings_repository::SettingsRepository,
    domain::models::settings::{Settings, UpdateSettings},
};

/// 永続化された設定を取得する。`settings` テーブルの初期行はマイグレーションで挿入される。
pub async fn get_settings(
    repository: &impl SettingsRepository<Error = impl std::fmt::Display>,
) -> Result<Settings, String> {
    repository
        .get_settings()
        .await
        .map_err(|error| error.to_string())
}

/// 設定を保存する。1〜12 の範囲外を弾いてから repository に書き込む。
pub async fn save_settings(
    repository: &impl SettingsRepository<Error = impl std::fmt::Display>,
    input: UpdateSettings,
) -> Result<Settings, String> {
    if !(1..=12).contains(&input.fiscal_year_start_month) {
        return Err("開始月は 1 から 12 の範囲で指定してください。".to_string());
    }

    repository
        .save_settings(input)
        .await
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use std::{convert::Infallible, sync::Mutex};

    use crate::application::ports::{
        partner_repository::RepositoryFuture, settings_repository::SettingsRepository,
    };

    use super::*;

    struct InMemorySettingsRepository {
        settings: Mutex<Settings>,
    }

    impl InMemorySettingsRepository {
        fn new(settings: Settings) -> Self {
            Self {
                settings: Mutex::new(settings),
            }
        }
    }

    impl SettingsRepository for InMemorySettingsRepository {
        type Error = Infallible;

        fn get_settings(&self) -> RepositoryFuture<'_, Settings, Self::Error> {
            Box::pin(async move { Ok(self.settings.lock().unwrap().clone()) })
        }

        fn save_settings(
            &self,
            input: UpdateSettings,
        ) -> RepositoryFuture<'_, Settings, Self::Error> {
            Box::pin(async move {
                let settings = Settings {
                    fiscal_year_start_month: input.fiscal_year_start_month,
                };
                *self.settings.lock().unwrap() = settings.clone();
                Ok(settings)
            })
        }
    }

    #[test]
    fn returns_default_settings() {
        let repository = InMemorySettingsRepository::new(Settings::default_settings());

        let settings = tauri::async_runtime::block_on(get_settings(&repository)).unwrap();

        assert_eq!(settings.fiscal_year_start_month, 4);
    }

    #[test]
    fn rejects_out_of_range_start_month() {
        let repository = InMemorySettingsRepository::new(Settings::default_settings());

        let result =
            tauri::async_runtime::block_on(save_settings(&repository, UpdateSettings::new(13)));

        assert_eq!(
            result.unwrap_err(),
            "開始月は 1 から 12 の範囲で指定してください。"
        );
    }

    #[test]
    fn saves_valid_start_month() {
        let repository = InMemorySettingsRepository::new(Settings::default_settings());

        let saved =
            tauri::async_runtime::block_on(save_settings(&repository, UpdateSettings::new(1)))
                .unwrap();

        assert_eq!(saved.fiscal_year_start_month, 1);
    }
}
