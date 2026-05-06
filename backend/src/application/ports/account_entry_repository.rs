//! Account entry repository port.

use crate::{
    application::ports::partner_repository::RepositoryFuture,
    domain::models::account_entry::{AccountEntry, NewAccountEntry, UpdateAccountEntry},
};

pub trait AccountEntryRepository {
    type Error;

    fn list_account_entries(&self) -> RepositoryFuture<'_, Vec<AccountEntry>, Self::Error>;

    fn create_account_entry(
        &self,
        input: NewAccountEntry,
    ) -> RepositoryFuture<'_, AccountEntry, Self::Error>;

    fn update_account_entry(
        &self,
        input: UpdateAccountEntry,
    ) -> RepositoryFuture<'_, AccountEntry, Self::Error>;

    fn delete_account_entry<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error>;
}
