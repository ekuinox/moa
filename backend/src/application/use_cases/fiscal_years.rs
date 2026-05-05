//! Fiscal year setting and fiscal year use cases.

use crate::{
    application::ports::fiscal_year_repository::FiscalYearRepository,
    domain::models::fiscal_year::{
        FiscalYear, FiscalYearSetting, GenerateFiscalYear, NewFiscalYear, SaveFiscalYearSetting,
        UpdateFiscalYear,
    },
};

const DEFAULT_NAMING_RULE: &str = "start_year";

pub async fn get_fiscal_year_setting(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
) -> Result<FiscalYearSetting, String> {
    Ok(repository
        .get_fiscal_year_setting()
        .await
        .map_err(|error| error.to_string())?
        .unwrap_or_else(FiscalYearSetting::default_setting))
}

pub async fn save_fiscal_year_setting(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
    input: SaveFiscalYearSetting,
) -> Result<FiscalYearSetting, String> {
    validate_setting(&input)?;

    repository
        .save_fiscal_year_setting(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn list_fiscal_years(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
) -> Result<Vec<FiscalYear>, String> {
    repository
        .list_fiscal_years()
        .await
        .map_err(|error| error.to_string())
}

pub async fn create_fiscal_year(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
    input: NewFiscalYear,
) -> Result<FiscalYear, String> {
    validate_fiscal_year(&input.name, &input.start_month, &input.end_month)?;
    ensure_period_not_overlapping(repository, None, &input.start_month, &input.end_month).await?;

    repository
        .create_fiscal_year(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn update_fiscal_year(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
    input: UpdateFiscalYear,
) -> Result<FiscalYear, String> {
    if input.id.trim().is_empty() {
        return Err("事業年度 ID を指定してください。".to_string());
    }

    validate_fiscal_year(&input.name, &input.start_month, &input.end_month)?;
    ensure_period_not_overlapping(
        repository,
        Some(input.id.as_str()),
        &input.start_month,
        &input.end_month,
    )
    .await?;

    repository
        .update_fiscal_year(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn delete_fiscal_year(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
    id: &str,
) -> Result<(), String> {
    if id.trim().is_empty() {
        return Err("事業年度 ID を指定してください。".to_string());
    }

    repository
        .delete_fiscal_year(id)
        .await
        .map_err(|error| error.to_string())
}

pub async fn generate_fiscal_year(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
    input: GenerateFiscalYear,
) -> Result<FiscalYear, String> {
    if input.start_year < 1900 || input.start_year > 9999 {
        return Err("開始年は 1900 から 9999 の範囲で指定してください。".to_string());
    }

    let setting = get_fiscal_year_setting(repository).await?;
    validate_setting(&SaveFiscalYearSetting::new(
        setting.start_month,
        setting.duration_months,
        setting.naming_rule.clone(),
    ))?;

    let start = YearMonth::new(input.start_year, setting.start_month)?;
    let end = start.add_months(setting.duration_months - 1)?;
    let fiscal_year = NewFiscalYear::new(
        fiscal_year_name(input.start_year, &setting.naming_rule)?,
        start.to_string(),
        end.to_string(),
    );

    create_fiscal_year(repository, fiscal_year).await
}

async fn ensure_period_not_overlapping(
    repository: &impl FiscalYearRepository<Error = impl std::fmt::Display>,
    excluded_id: Option<&str>,
    start_month: &str,
    end_month: &str,
) -> Result<(), String> {
    let start = YearMonth::parse(start_month)?;
    let end = YearMonth::parse(end_month)?;
    let fiscal_years = list_fiscal_years(repository).await?;

    for fiscal_year in fiscal_years {
        if excluded_id == Some(fiscal_year.id.as_str()) {
            continue;
        }

        let existing_start = YearMonth::parse(&fiscal_year.start_month)?;
        let existing_end = YearMonth::parse(&fiscal_year.end_month)?;

        if start <= existing_end && end >= existing_start {
            return Err("事業年度の期間が既存の年度と重複しています。".to_string());
        }
    }

    Ok(())
}

fn validate_setting(input: &SaveFiscalYearSetting) -> Result<(), String> {
    if !(1..=12).contains(&input.start_month) {
        return Err("開始月は 1 から 12 の範囲で指定してください。".to_string());
    }

    if !(1..=120).contains(&input.duration_months) {
        return Err("期間月数は 1 から 120 の範囲で指定してください。".to_string());
    }

    if input.naming_rule.trim() != DEFAULT_NAMING_RULE {
        return Err("年度名の付け方が不正です。".to_string());
    }

    Ok(())
}

fn validate_fiscal_year(name: &str, start_month: &str, end_month: &str) -> Result<(), String> {
    if name.trim().is_empty() {
        return Err("事業年度名を入力してください。".to_string());
    }

    let start = YearMonth::parse(start_month)?;
    let end = YearMonth::parse(end_month)?;

    if start > end {
        return Err("終了月は開始月以降にしてください。".to_string());
    }

    Ok(())
}

fn fiscal_year_name(start_year: i32, naming_rule: &str) -> Result<String, String> {
    match naming_rule {
        DEFAULT_NAMING_RULE => Ok(format!("{start_year}年度")),
        _ => Err("年度名の付け方が不正です。".to_string()),
    }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct YearMonth {
    year: i32,
    month: i32,
}

impl YearMonth {
    fn new(year: i32, month: i32) -> Result<Self, String> {
        if !(1..=12).contains(&month) {
            return Err("月は 1 から 12 の範囲で指定してください。".to_string());
        }

        Ok(Self { year, month })
    }

    fn parse(value: &str) -> Result<Self, String> {
        let Some((year, month)) = value.split_once('-') else {
            return Err("年月は YYYY-MM 形式で入力してください。".to_string());
        };

        if year.len() != 4 || month.len() != 2 {
            return Err("年月は YYYY-MM 形式で入力してください。".to_string());
        }

        Self::new(
            year.parse().map_err(|_| "年が不正です。".to_string())?,
            month.parse().map_err(|_| "月が不正です。".to_string())?,
        )
    }

    fn add_months(self, months: i32) -> Result<Self, String> {
        let total_months = self.year * 12 + (self.month - 1) + months;
        let year = total_months.div_euclid(12);
        let month = total_months.rem_euclid(12) + 1;

        Self::new(year, month)
    }
}

impl std::fmt::Display for YearMonth {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{:04}-{:02}", self.year, self.month)
    }
}

#[cfg(test)]
mod tests {
    use std::{convert::Infallible, sync::Mutex};

    use crate::application::ports::{
        fiscal_year_repository::FiscalYearRepository, partner_repository::RepositoryFuture,
    };

    use super::*;

    struct InMemoryFiscalYearRepository {
        setting: Mutex<Option<FiscalYearSetting>>,
        fiscal_years: Mutex<Vec<FiscalYear>>,
    }

    impl InMemoryFiscalYearRepository {
        fn new(setting: Option<FiscalYearSetting>, fiscal_years: Vec<FiscalYear>) -> Self {
            Self {
                setting: Mutex::new(setting),
                fiscal_years: Mutex::new(fiscal_years),
            }
        }
    }

    impl FiscalYearRepository for InMemoryFiscalYearRepository {
        type Error = Infallible;

        fn get_fiscal_year_setting(
            &self,
        ) -> RepositoryFuture<'_, Option<FiscalYearSetting>, Self::Error> {
            Box::pin(async move { Ok(self.setting.lock().unwrap().clone()) })
        }

        fn save_fiscal_year_setting(
            &self,
            input: SaveFiscalYearSetting,
        ) -> RepositoryFuture<'_, FiscalYearSetting, Self::Error> {
            Box::pin(async move {
                let setting = FiscalYearSetting {
                    id: "default".to_string(),
                    start_month: input.start_month,
                    duration_months: input.duration_months,
                    naming_rule: input.naming_rule,
                };
                *self.setting.lock().unwrap() = Some(setting.clone());
                Ok(setting)
            })
        }

        fn list_fiscal_years(&self) -> RepositoryFuture<'_, Vec<FiscalYear>, Self::Error> {
            Box::pin(async move {
                let mut fiscal_years = self.fiscal_years.lock().unwrap().clone();
                fiscal_years.sort_by(|left, right| left.start_month.cmp(&right.start_month));
                Ok(fiscal_years)
            })
        }

        fn create_fiscal_year(
            &self,
            input: NewFiscalYear,
        ) -> RepositoryFuture<'_, FiscalYear, Self::Error> {
            Box::pin(async move {
                let fiscal_year = FiscalYear {
                    id: format!(
                        "fiscal-year-{}",
                        self.fiscal_years.lock().unwrap().len() + 1
                    ),
                    name: input.name,
                    start_month: input.start_month,
                    end_month: input.end_month,
                };
                self.fiscal_years.lock().unwrap().push(fiscal_year.clone());
                Ok(fiscal_year)
            })
        }

        fn update_fiscal_year(
            &self,
            input: UpdateFiscalYear,
        ) -> RepositoryFuture<'_, FiscalYear, Self::Error> {
            Box::pin(async move {
                let fiscal_year = FiscalYear {
                    id: input.id,
                    name: input.name,
                    start_month: input.start_month,
                    end_month: input.end_month,
                };
                let mut fiscal_years = self.fiscal_years.lock().unwrap();
                if let Some(index) = fiscal_years
                    .iter()
                    .position(|item| item.id == fiscal_year.id)
                {
                    fiscal_years[index] = fiscal_year.clone();
                }
                Ok(fiscal_year)
            })
        }

        fn delete_fiscal_year<'repository>(
            &'repository self,
            id: &'repository str,
        ) -> RepositoryFuture<'repository, (), Self::Error> {
            Box::pin(async move {
                self.fiscal_years
                    .lock()
                    .unwrap()
                    .retain(|fiscal_year| fiscal_year.id != id);
                Ok(())
            })
        }
    }

    #[test]
    fn returns_default_setting_when_not_saved() {
        let repository = InMemoryFiscalYearRepository::new(None, Vec::new());

        let setting = tauri::async_runtime::block_on(get_fiscal_year_setting(&repository)).unwrap();

        assert_eq!(setting.start_month, 4);
        assert_eq!(setting.duration_months, 12);
    }

    #[test]
    fn generates_fiscal_year_from_setting() {
        let repository = InMemoryFiscalYearRepository::new(
            Some(FiscalYearSetting {
                id: "default".to_string(),
                start_month: 4,
                duration_months: 12,
                naming_rule: "start_year".to_string(),
            }),
            Vec::new(),
        );

        let fiscal_year = tauri::async_runtime::block_on(generate_fiscal_year(
            &repository,
            GenerateFiscalYear::new(2026),
        ))
        .unwrap();

        assert_eq!(fiscal_year.name, "2026年度");
        assert_eq!(fiscal_year.start_month, "2026-04");
        assert_eq!(fiscal_year.end_month, "2027-03");
    }

    #[test]
    fn rejects_overlapping_period() {
        let repository = InMemoryFiscalYearRepository::new(
            None,
            vec![FiscalYear {
                id: "2026".to_string(),
                name: "2026年度".to_string(),
                start_month: "2026-04".to_string(),
                end_month: "2027-03".to_string(),
            }],
        );

        let result = tauri::async_runtime::block_on(create_fiscal_year(
            &repository,
            NewFiscalYear::new("重複年度", "2027-01", "2027-12"),
        ));

        assert_eq!(
            result.unwrap_err(),
            "事業年度の期間が既存の年度と重複しています。"
        );
    }
}
