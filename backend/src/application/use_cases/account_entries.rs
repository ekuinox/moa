//! Account entry use cases.

use std::collections::HashSet;

use crate::{
    application::ports::account_entry_repository::AccountEntryRepository,
    domain::models::account_entry::{AccountEntry, NewAccountEntry, UpdateAccountEntry},
};

pub async fn list_account_entries(
    repository: &impl AccountEntryRepository<Error = impl std::fmt::Display>,
) -> Result<Vec<AccountEntry>, String> {
    repository
        .list_account_entries()
        .await
        .map_err(|error| error.to_string())
}

pub async fn create_account_entry(
    repository: &impl AccountEntryRepository<Error = impl std::fmt::Display>,
    input: NewAccountEntry,
) -> Result<AccountEntry, String> {
    validate_entry(
        &input.kind,
        &input.occurred_on,
        &input.partner_id,
        &input.category_ids,
        input.amount,
    )?;

    repository
        .create_account_entry(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn update_account_entry(
    repository: &impl AccountEntryRepository<Error = impl std::fmt::Display>,
    input: UpdateAccountEntry,
) -> Result<AccountEntry, String> {
    if input.id.trim().is_empty() {
        return Err("明細 ID を指定してください。".to_string());
    }
    validate_entry(
        &input.kind,
        &input.occurred_on,
        &input.partner_id,
        &input.category_ids,
        input.amount,
    )?;

    repository
        .update_account_entry(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn delete_account_entry(
    repository: &impl AccountEntryRepository<Error = impl std::fmt::Display>,
    id: &str,
) -> Result<(), String> {
    if id.trim().is_empty() {
        return Err("明細 ID を指定してください。".to_string());
    }

    repository
        .delete_account_entry(id)
        .await
        .map_err(|error| error.to_string())
}

fn validate_entry(
    kind: &str,
    occurred_on: &str,
    partner_id: &str,
    category_ids: &[String],
    amount: i64,
) -> Result<(), String> {
    if !matches!(kind.trim(), "payable" | "receivable") {
        return Err("区分は買掛または売掛を指定してください。".to_string());
    }
    if !is_valid_date(occurred_on.trim()) {
        return Err("発生日は YYYY-MM-DD 形式で入力してください。".to_string());
    }
    if partner_id.trim().is_empty() {
        return Err("取引先を指定してください。".to_string());
    }
    let mut seen = HashSet::new();
    for category_id in category_ids {
        let trimmed = category_id.trim();
        if trimmed.is_empty() {
            return Err("空の種別 ID は指定できません。".to_string());
        }
        if !seen.insert(trimmed.to_string()) {
            return Err("同じ種別を重複して指定することはできません。".to_string());
        }
    }
    if amount < 0 {
        return Err("金額は 0 以上で入力してください。".to_string());
    }

    Ok(())
}

fn is_valid_date(value: &str) -> bool {
    let mut parts = value.split('-');
    let Some(year) = parts.next() else {
        return false;
    };
    let Some(month) = parts.next() else {
        return false;
    };
    let Some(day) = parts.next() else {
        return false;
    };
    if parts.next().is_some() || year.len() != 4 || month.len() != 2 || day.len() != 2 {
        return false;
    }
    let Ok(month) = month.parse::<i32>() else {
        return false;
    };
    let Ok(day) = day.parse::<i32>() else {
        return false;
    };

    (1..=12).contains(&month) && (1..=31).contains(&day)
}

#[cfg(test)]
mod tests {
    use std::{convert::Infallible, sync::Mutex};

    use crate::application::ports::{
        account_entry_repository::AccountEntryRepository, partner_repository::RepositoryFuture,
    };

    use super::*;

    struct InMemoryAccountEntryRepository {
        entries: Mutex<Vec<AccountEntry>>,
    }

    impl InMemoryAccountEntryRepository {
        fn new(entries: Vec<AccountEntry>) -> Self {
            Self {
                entries: Mutex::new(entries),
            }
        }
    }

    impl AccountEntryRepository for InMemoryAccountEntryRepository {
        type Error = Infallible;

        fn list_account_entries(&self) -> RepositoryFuture<'_, Vec<AccountEntry>, Self::Error> {
            Box::pin(async move {
                let mut entries = self.entries.lock().unwrap().clone();
                entries.sort_by(|left, right| right.occurred_on.cmp(&left.occurred_on));
                Ok(entries)
            })
        }

        fn create_account_entry(
            &self,
            input: NewAccountEntry,
        ) -> RepositoryFuture<'_, AccountEntry, Self::Error> {
            Box::pin(async move {
                let entry = AccountEntry {
                    id: format!("entry-{}", self.entries.lock().unwrap().len() + 1),
                    kind: input.kind,
                    occurred_on: input.occurred_on,
                    partner_id: input.partner_id,
                    category_ids: input.category_ids,
                    description: input.description,
                    amount: input.amount,
                };
                self.entries.lock().unwrap().push(entry.clone());
                Ok(entry)
            })
        }

        fn update_account_entry(
            &self,
            input: UpdateAccountEntry,
        ) -> RepositoryFuture<'_, AccountEntry, Self::Error> {
            Box::pin(async move {
                let entry = AccountEntry {
                    id: input.id,
                    kind: input.kind,
                    occurred_on: input.occurred_on,
                    partner_id: input.partner_id,
                    category_ids: input.category_ids,
                    description: input.description,
                    amount: input.amount,
                };
                let mut entries = self.entries.lock().unwrap();
                if let Some(index) = entries.iter().position(|item| item.id == entry.id) {
                    entries[index] = entry.clone();
                }
                Ok(entry)
            })
        }

        fn delete_account_entry<'repository>(
            &'repository self,
            id: &'repository str,
        ) -> RepositoryFuture<'repository, (), Self::Error> {
            Box::pin(async move {
                self.entries.lock().unwrap().retain(|entry| entry.id != id);
                Ok(())
            })
        }
    }

    #[test]
    fn creates_valid_entry() {
        let repository = InMemoryAccountEntryRepository::new(Vec::new());

        let entry = tauri::async_runtime::block_on(create_account_entry(
            &repository,
            NewAccountEntry::new(
                "payable",
                "2026-05-06",
                "partner-1",
                vec!["category-1".to_string()],
                "memo",
                1200,
            ),
        ))
        .unwrap();

        assert_eq!(entry.kind, "payable");
        assert_eq!(entry.amount, 1200);
        assert_eq!(entry.category_ids, vec!["category-1".to_string()]);
    }

    #[test]
    fn creates_entry_without_categories() {
        let repository = InMemoryAccountEntryRepository::new(Vec::new());

        let entry = tauri::async_runtime::block_on(create_account_entry(
            &repository,
            NewAccountEntry::new(
                "receivable",
                "2026-05-06",
                "partner-1",
                Vec::new(),
                "memo",
                500,
            ),
        ))
        .unwrap();

        assert!(entry.category_ids.is_empty());
    }

    #[test]
    fn rejects_invalid_kind() {
        let repository = InMemoryAccountEntryRepository::new(Vec::new());

        let result = tauri::async_runtime::block_on(create_account_entry(
            &repository,
            NewAccountEntry::new(
                "other",
                "2026-05-06",
                "partner-1",
                vec!["category-1".to_string()],
                "memo",
                1200,
            ),
        ));

        assert_eq!(
            result.unwrap_err(),
            "区分は買掛または売掛を指定してください。"
        );
    }

    #[test]
    fn rejects_negative_amount() {
        let repository = InMemoryAccountEntryRepository::new(Vec::new());

        let result = tauri::async_runtime::block_on(create_account_entry(
            &repository,
            NewAccountEntry::new(
                "payable",
                "2026-05-06",
                "partner-1",
                vec!["category-1".to_string()],
                "memo",
                -1,
            ),
        ));

        assert_eq!(result.unwrap_err(), "金額は 0 以上で入力してください。");
    }

    #[test]
    fn rejects_duplicate_category_ids() {
        let repository = InMemoryAccountEntryRepository::new(Vec::new());

        let result = tauri::async_runtime::block_on(create_account_entry(
            &repository,
            NewAccountEntry::new(
                "payable",
                "2026-05-06",
                "partner-1",
                vec!["category-1".to_string(), "category-1".to_string()],
                "memo",
                1200,
            ),
        ));

        assert_eq!(
            result.unwrap_err(),
            "同じ種別を重複して指定することはできません。"
        );
    }

    #[test]
    fn rejects_empty_category_id() {
        let repository = InMemoryAccountEntryRepository::new(Vec::new());

        let result = tauri::async_runtime::block_on(create_account_entry(
            &repository,
            NewAccountEntry::new(
                "payable",
                "2026-05-06",
                "partner-1",
                vec!["   ".to_string()],
                "memo",
                1200,
            ),
        ));

        assert_eq!(result.unwrap_err(), "空の種別 ID は指定できません。");
    }
}
