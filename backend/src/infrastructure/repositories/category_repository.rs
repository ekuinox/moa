//! SQLite-backed category repository.

use sqlx::{FromRow, SqlitePool};

use crate::{
    application::ports::{
        category_repository::CategoryRepository, partner_repository::RepositoryFuture,
    },
    domain::models::category::{Category, NewCategory, UpdateCategory},
};

/// SQLite に保存された種別マスタを操作する repository。
pub struct SqliteCategoryRepository<'pool> {
    pool: &'pool SqlitePool,
}

impl<'pool> SqliteCategoryRepository<'pool> {
    pub fn new(pool: &'pool SqlitePool) -> Self {
        Self { pool }
    }
}

impl CategoryRepository for SqliteCategoryRepository<'_> {
    type Error = sqlx::Error;

    fn list_categories(&self) -> RepositoryFuture<'_, Vec<Category>, Self::Error> {
        Box::pin(async move {
            let rows = sqlx::query_as::<_, CategoryRow>(
                r#"
                SELECT id, name
                FROM categories
                ORDER BY name ASC
                "#,
            )
            .fetch_all(self.pool)
            .await?;

            Ok(rows.into_iter().map(Category::from).collect())
        })
    }

    fn create_category(&self, input: NewCategory) -> RepositoryFuture<'_, Category, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, CategoryRow>(
                r#"
                INSERT INTO categories (id, name)
                VALUES (lower(hex(randomblob(16))), ?)
                RETURNING id, name
                "#,
            )
            .bind(input.name.trim())
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn update_category(
        &self,
        input: UpdateCategory,
    ) -> RepositoryFuture<'_, Category, Self::Error> {
        Box::pin(async move {
            let row = sqlx::query_as::<_, CategoryRow>(
                r#"
                UPDATE categories
                SET
                  name = ?,
                  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
                WHERE id = ?
                RETURNING id, name
                "#,
            )
            .bind(input.name.trim())
            .bind(input.id)
            .fetch_one(self.pool)
            .await?;

            Ok(row.into())
        })
    }

    fn delete_category<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error> {
        Box::pin(async move {
            let result = sqlx::query(
                r#"
                DELETE FROM categories
                WHERE id = ?
                "#,
            )
            .bind(id)
            .execute(self.pool)
            .await?;

            if result.rows_affected() == 0 {
                return Err(sqlx::Error::RowNotFound);
            }

            Ok(())
        })
    }
}

/// `categories` テーブルから取得した 1 行。
#[derive(FromRow)]
struct CategoryRow {
    id: String,
    name: String,
}

impl From<CategoryRow> for Category {
    fn from(row: CategoryRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
        }
    }
}
