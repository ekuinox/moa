//! Partner domain model.

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Partner {
    pub id: String,
    pub name: String,
    pub kana: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewPartner {
    pub name: String,
    pub kana: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UpdatePartner {
    pub id: String,
    pub name: String,
    pub kana: String,
}

impl NewPartner {
    pub fn new(name: impl Into<String>, kana: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            kana: kana.into(),
        }
    }
}

impl UpdatePartner {
    pub fn new(id: impl Into<String>, name: impl Into<String>, kana: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            kana: kana.into(),
        }
    }
}
