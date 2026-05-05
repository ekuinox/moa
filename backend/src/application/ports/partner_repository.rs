//! Partner repository port.

use std::{future::Future, pin::Pin};

use crate::domain::models::partner::{NewPartner, Partner, UpdatePartner};

pub type RepositoryFuture<'future, T, E> =
    Pin<Box<dyn Future<Output = Result<T, E>> + Send + 'future>>;

pub trait PartnerRepository {
    type Error;

    fn list_partners(&self) -> RepositoryFuture<'_, Vec<Partner>, Self::Error>;

    fn create_partner(&self, input: NewPartner) -> RepositoryFuture<'_, Partner, Self::Error>;

    fn update_partner(&self, input: UpdatePartner) -> RepositoryFuture<'_, Partner, Self::Error>;

    fn delete_partner<'repository>(
        &'repository self,
        id: &'repository str,
    ) -> RepositoryFuture<'repository, (), Self::Error>;
}
