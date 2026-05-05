//! Category master use cases.

use crate::{
    application::ports::category_repository::CategoryRepository,
    domain::models::category::{Category, NewCategory, UpdateCategory},
};

pub async fn list_categories(
    repository: &impl CategoryRepository<Error = impl std::fmt::Display>,
) -> Result<Vec<Category>, String> {
    repository
        .list_categories()
        .await
        .map_err(|error| error.to_string())
}

pub async fn create_category(
    repository: &impl CategoryRepository<Error = impl std::fmt::Display>,
    input: NewCategory,
) -> Result<Category, String> {
    validate_category_name(&input.name)?;

    repository
        .create_category(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn update_category(
    repository: &impl CategoryRepository<Error = impl std::fmt::Display>,
    input: UpdateCategory,
) -> Result<Category, String> {
    if input.id.trim().is_empty() {
        return Err("種別 ID を指定してください。".to_string());
    }

    validate_category_name(&input.name)?;

    repository
        .update_category(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn delete_category(
    repository: &impl CategoryRepository<Error = impl std::fmt::Display>,
    id: &str,
) -> Result<(), String> {
    if id.trim().is_empty() {
        return Err("種別 ID を指定してください。".to_string());
    }

    repository
        .delete_category(id)
        .await
        .map_err(|error| error.to_string())
}

fn validate_category_name(name: &str) -> Result<(), String> {
    if name.trim().is_empty() {
        return Err("種別名を入力してください。".to_string());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{convert::Infallible, sync::Mutex};

    use crate::application::ports::{
        category_repository::CategoryRepository, partner_repository::RepositoryFuture,
    };

    use super::*;

    struct InMemoryCategoryRepository {
        categories: Mutex<Vec<Category>>,
    }

    impl InMemoryCategoryRepository {
        fn new(categories: Vec<Category>) -> Self {
            Self {
                categories: Mutex::new(categories),
            }
        }
    }

    impl CategoryRepository for InMemoryCategoryRepository {
        type Error = Infallible;

        fn list_categories(&self) -> RepositoryFuture<'_, Vec<Category>, Self::Error> {
            Box::pin(async move {
                let mut categories = self.categories.lock().unwrap().clone();
                categories.sort_by(|left, right| left.name.cmp(&right.name));
                Ok(categories)
            })
        }

        fn create_category(
            &self,
            input: NewCategory,
        ) -> RepositoryFuture<'_, Category, Self::Error> {
            Box::pin(async move {
                let category = Category {
                    id: format!("category-{}", self.categories.lock().unwrap().len() + 1),
                    name: input.name,
                };
                self.categories.lock().unwrap().push(category.clone());
                Ok(category)
            })
        }

        fn update_category(
            &self,
            input: UpdateCategory,
        ) -> RepositoryFuture<'_, Category, Self::Error> {
            Box::pin(async move {
                let category = Category {
                    id: input.id,
                    name: input.name,
                };
                let mut categories = self.categories.lock().unwrap();
                if let Some(index) = categories.iter().position(|item| item.id == category.id) {
                    categories[index] = category.clone();
                }
                Ok(category)
            })
        }

        fn delete_category<'repository>(
            &'repository self,
            id: &'repository str,
        ) -> RepositoryFuture<'repository, (), Self::Error> {
            Box::pin(async move {
                self.categories
                    .lock()
                    .unwrap()
                    .retain(|category| category.id != id);
                Ok(())
            })
        }
    }

    #[test]
    fn lists_categories_by_name() {
        let repository = InMemoryCategoryRepository::new(vec![
            Category {
                id: "2".to_string(),
                name: "工賃".to_string(),
            },
            Category {
                id: "1".to_string(),
                name: "材料費".to_string(),
            },
        ]);

        let categories = tauri::async_runtime::block_on(list_categories(&repository)).unwrap();

        assert_eq!(categories[0].name, "工賃");
        assert_eq!(categories[1].name, "材料費");
    }

    #[test]
    fn rejects_empty_name() {
        let repository = InMemoryCategoryRepository::new(Vec::new());

        let result =
            tauri::async_runtime::block_on(create_category(&repository, NewCategory::new("")));

        assert_eq!(result.unwrap_err(), "種別名を入力してください。");
    }
}
