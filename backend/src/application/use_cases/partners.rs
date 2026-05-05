//! Partner master use cases.

use crate::{
    application::ports::partner_repository::PartnerRepository,
    domain::models::partner::{NewPartner, Partner, UpdatePartner},
};

pub async fn list_partners(
    repository: &impl PartnerRepository<Error = impl std::fmt::Display>,
) -> Result<Vec<Partner>, String> {
    repository
        .list_partners()
        .await
        .map_err(|error| error.to_string())
}

pub async fn create_partner(
    repository: &impl PartnerRepository<Error = impl std::fmt::Display>,
    input: NewPartner,
) -> Result<Partner, String> {
    validate_partner_fields(&input.name, &input.kana)?;

    repository
        .create_partner(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn update_partner(
    repository: &impl PartnerRepository<Error = impl std::fmt::Display>,
    input: UpdatePartner,
) -> Result<Partner, String> {
    if input.id.trim().is_empty() {
        return Err("取引先 ID を指定してください。".to_string());
    }

    validate_partner_fields(&input.name, &input.kana)?;

    repository
        .update_partner(input)
        .await
        .map_err(|error| error.to_string())
}

pub async fn delete_partner(
    repository: &impl PartnerRepository<Error = impl std::fmt::Display>,
    id: &str,
) -> Result<(), String> {
    if id.trim().is_empty() {
        return Err("取引先 ID を指定してください。".to_string());
    }

    repository
        .delete_partner(id)
        .await
        .map_err(|error| error.to_string())
}

fn validate_partner_fields(name: &str, kana: &str) -> Result<(), String> {
    if name.trim().is_empty() {
        return Err("取引先名を入力してください。".to_string());
    }

    if kana.trim().is_empty() {
        return Err("読み仮名を入力してください。".to_string());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{convert::Infallible, sync::Mutex};

    use crate::application::ports::partner_repository::RepositoryFuture;

    use super::*;

    struct InMemoryPartnerRepository {
        partners: Mutex<Vec<Partner>>,
    }

    impl InMemoryPartnerRepository {
        fn new(partners: Vec<Partner>) -> Self {
            Self {
                partners: Mutex::new(partners),
            }
        }
    }

    impl PartnerRepository for InMemoryPartnerRepository {
        type Error = Infallible;

        fn list_partners(&self) -> RepositoryFuture<'_, Vec<Partner>, Self::Error> {
            Box::pin(async move {
                let mut partners = self.partners.lock().unwrap().clone();
                partners.sort_by(|left, right| {
                    left.kana
                        .cmp(&right.kana)
                        .then_with(|| left.name.cmp(&right.name))
                });
                Ok(partners)
            })
        }

        fn create_partner(&self, input: NewPartner) -> RepositoryFuture<'_, Partner, Self::Error> {
            Box::pin(async move {
                let partner = Partner {
                    id: format!("partner-{}", self.partners.lock().unwrap().len() + 1),
                    name: input.name,
                    kana: input.kana,
                };
                self.partners.lock().unwrap().push(partner.clone());
                Ok(partner)
            })
        }

        fn update_partner(
            &self,
            input: UpdatePartner,
        ) -> RepositoryFuture<'_, Partner, Self::Error> {
            Box::pin(async move {
                let partner = Partner {
                    id: input.id,
                    name: input.name,
                    kana: input.kana,
                };
                let mut partners = self.partners.lock().unwrap();
                if let Some(index) = partners.iter().position(|item| item.id == partner.id) {
                    partners[index] = partner.clone();
                }
                Ok(partner)
            })
        }

        fn delete_partner<'repository>(
            &'repository self,
            id: &'repository str,
        ) -> RepositoryFuture<'repository, (), Self::Error> {
            Box::pin(async move {
                self.partners
                    .lock()
                    .unwrap()
                    .retain(|partner| partner.id != id);
                Ok(())
            })
        }
    }

    #[test]
    fn lists_partners_by_kana() {
        let repository = InMemoryPartnerRepository::new(vec![
            Partner {
                id: "2".to_string(),
                name: "山田工業".to_string(),
                kana: "やまだこうぎょう".to_string(),
            },
            Partner {
                id: "1".to_string(),
                name: "青木商店".to_string(),
                kana: "あおきしょうてん".to_string(),
            },
        ]);

        let partners = tauri::async_runtime::block_on(list_partners(&repository)).unwrap();

        assert_eq!(partners[0].name, "青木商店");
        assert_eq!(partners[1].name, "山田工業");
    }

    #[test]
    fn rejects_empty_name() {
        let repository = InMemoryPartnerRepository::new(Vec::new());

        let result = tauri::async_runtime::block_on(create_partner(
            &repository,
            NewPartner::new("", "かな"),
        ));

        assert_eq!(result.unwrap_err(), "取引先名を入力してください。");
    }
}
