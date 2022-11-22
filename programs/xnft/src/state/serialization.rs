// Copyright (C) 2022 Blue Coral, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

use serde::ser::{Serialize, SerializeStruct, Serializer};

use super::{Access, CuratorStatus, Install, Kind, Review, Tag, Xnft};

impl Serialize for Access {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("Access", 3)?;
        s.serialize_field("wallet", &self.wallet.to_string())?;
        s.serialize_field("xnft", &self.xnft.to_string())?;
        s.serialize_field("bump", &self.bump)?;
        s.end()
    }
}

impl std::fmt::Debug for Access {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Access")
            .field("wallet", &self.wallet)
            .field("xnft", &self.xnft)
            .field("bump", &self.bump)
            .finish()
    }
}

impl Serialize for Install {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("Install", 4)?;
        s.serialize_field("authority", &self.authority.to_string())?;
        s.serialize_field("xnft", &self.xnft.to_string())?;
        s.serialize_field("masterMetadata", &self.master_metadata.to_string())?;
        s.serialize_field("edition", &self.edition)?;
        s.end()
    }
}

impl std::fmt::Debug for Install {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Install")
            .field("authority", &self.authority)
            .field("xnft", &self.xnft)
            .field("master_metadata", &self.master_metadata)
            .field("edition", &self.edition)
            .finish()
    }
}

impl Serialize for Review {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("Review", 4)?;
        s.serialize_field("author", &self.author.to_string())?;
        s.serialize_field("xnft", &self.xnft.to_string())?;
        s.serialize_field("rating", &self.rating)?;
        s.serialize_field("uri", &self.uri)?;
        s.end()
    }
}

impl std::fmt::Debug for Review {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Review")
            .field("author", &self.author)
            .field("xnft", &self.xnft)
            .field("rating", &self.rating)
            .field("uri", &self.uri)
            .finish()
    }
}

impl Serialize for Xnft {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("Xnft", 19)?;
        s.serialize_field("publisher", &self.publisher.to_string())?;
        s.serialize_field("installVault", &self.install_vault.to_string())?;
        s.serialize_field("masterMetadata", &self.master_metadata.to_string())?;
        s.serialize_field("masterMint", &self.master_mint.to_string())?;
        s.serialize_field(
            "installAuthority",
            &self.install_authority.map(|pk| pk.to_string()),
        )?;
        s.serialize_field("curator", &self.curator)?;
        s.serialize_field("uri", &self.uri)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("kind", &self.kind)?;
        s.serialize_field("tag", &self.tag)?;
        s.serialize_field("supply", &self.supply)?;
        s.serialize_field("totalInstalls", &self.total_installs)?;
        s.serialize_field("installPrice", &self.install_price)?;
        s.serialize_field("createdTimestamp", &self.created_ts)?;
        s.serialize_field("updatedTimestamp", &self.updated_ts)?;
        s.serialize_field("totalRating", &self.total_rating)?;
        s.serialize_field("numberOfRatings", &self.num_ratings)?;
        s.serialize_field("suspended", &self.suspended)?;
        s.serialize_field("bump", &self.bump[0])?;
        s.end()
    }
}

impl std::fmt::Debug for Xnft {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Xnft")
            .field("publisher", &self.publisher)
            .field("install_vault", &self.install_vault)
            .field("master_metadata", &self.master_metadata)
            .field("master_mint", &self.master_mint)
            .field("install_authority", &self.install_authority)
            .field("curator", &self.curator)
            .field("uri", &self.uri)
            .field("name", &self.name)
            .field("kind", &self.kind)
            .field("tag", &self.tag)
            .field("supply", &self.supply)
            .field("total_installs", &self.total_installs)
            .field("install_price", &self.install_price)
            .field("created_ts", &self.created_ts)
            .field("updated_ts", &self.updated_ts)
            .field("total_rating", &self.total_rating)
            .field("num_ratings", &self.num_ratings)
            .field("suspended", &self.suspended)
            .field("bump", &self.bump)
            .finish()
    }
}

impl Serialize for Kind {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match *self {
            Kind::App => serializer.serialize_unit_variant("Kind", 0, "App"),
            Kind::Collection => serializer.serialize_unit_variant("Kind", 1, "Collection"),
            Kind::Nft => serializer.serialize_unit_variant("Kind", 2, "Nft"),
        }
    }
}

impl Serialize for Tag {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match *self {
            Tag::None => serializer.serialize_unit_variant("Tag", 0, "None"),
            Tag::Defi => serializer.serialize_unit_variant("Tag", 1, "Defi"),
            Tag::Game => serializer.serialize_unit_variant("Tag", 2, "Game"),
            Tag::Nfts => serializer.serialize_unit_variant("Tag", 3, "Nfts"),
        }
    }
}

impl Serialize for CuratorStatus {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("CuratorStatus", 2)?;
        s.serialize_field("pubkey", &self.pubkey.to_string())?;
        s.serialize_field("verified", &self.verified)?;
        s.end()
    }
}

impl std::fmt::Debug for CuratorStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CuratorStatus")
            .field("pubkey", &self.pubkey)
            .field("verified", &self.verified)
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use itertools::Itertools;
    use serde_test::{assert_ser_tokens, Token};

    fn default_access() -> Access {
        Access {
            wallet: Default::default(),
            xnft: Default::default(),
            bump: 0,
            _reserved: [0; 32],
        }
    }

    fn default_install() -> Install {
        Install {
            authority: Default::default(),
            xnft: Default::default(),
            master_metadata: Default::default(),
            edition: 0,
            _reserved: [0; 64],
        }
    }

    fn default_review() -> Review {
        Review {
            author: Default::default(),
            xnft: Default::default(),
            rating: 0,
            uri: "sample".to_owned(),
            _reserved: [0; 32],
        }
    }

    fn default_xnft() -> Xnft {
        Xnft {
            publisher: Default::default(),
            install_vault: Default::default(),
            master_metadata: Default::default(),
            master_mint: Default::default(),
            install_authority: Default::default(),
            curator: Some(CuratorStatus {
                pubkey: Default::default(),
                verified: true,
            }),
            uri: "sample".to_owned(),
            name: "MyApp".to_owned(),
            kind: Kind::App,
            tag: Tag::None,
            supply: Some(1),
            total_installs: 0,
            install_price: 0,
            created_ts: 0,
            updated_ts: 0,
            total_rating: 0,
            num_ratings: 0,
            suspended: false,
            bump: [0],
            _reserved: [0; 64],
        }
    }

    #[test]
    fn access_debug() {
        let acc = default_access();
        let output = "Access {
            wallet: 11111111111111111111111111111111,
            xnft: 11111111111111111111111111111111,
            bump: 0
        }"
        .split_whitespace()
        .join(" ");

        assert_eq!(output, format!("{acc:?}"));
    }

    #[test]
    fn access_serialization() {
        let acc = default_access();
        assert_ser_tokens(
            &acc,
            &[
                Token::Struct {
                    name: "Access",
                    len: 3,
                },
                Token::Str("wallet"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("xnft"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("bump"),
                Token::U8(0),
                Token::StructEnd,
            ],
        );
    }

    #[test]
    fn install_debug() {
        let acc = default_install();
        let output = "Install {
            authority: 11111111111111111111111111111111,
            xnft: 11111111111111111111111111111111,
            master_metadata: 11111111111111111111111111111111,
            edition: 0
        }"
        .split_whitespace()
        .join(" ");

        assert_eq!(output, format!("{acc:?}"));
    }

    #[test]
    fn install_serialization() {
        let acc = default_install();
        assert_ser_tokens(
            &acc,
            &[
                Token::Struct {
                    name: "Install",
                    len: 4,
                },
                Token::Str("authority"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("xnft"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("masterMetadata"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("edition"),
                Token::U64(0),
                Token::StructEnd,
            ],
        );
    }

    #[test]
    fn review_debug() {
        let acc = default_review();
        let output = "Review {
            author: 11111111111111111111111111111111,
            xnft: 11111111111111111111111111111111,
            rating: 0,
            uri: \"sample\"
        }"
        .split_whitespace()
        .join(" ");

        assert_eq!(output, format!("{acc:?}"));
    }

    #[test]
    fn review_serialization() {
        let acc = default_review();
        assert_ser_tokens(
            &acc,
            &[
                Token::Struct {
                    name: "Review",
                    len: 4,
                },
                Token::Str("author"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("xnft"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("rating"),
                Token::U8(0),
                Token::Str("uri"),
                Token::Str("sample"),
                Token::StructEnd,
            ],
        );
    }

    #[test]
    fn xnft_debug() {
        let acc = default_xnft();
        let output = "Xnft {
            publisher: 11111111111111111111111111111111,
            install_vault: 11111111111111111111111111111111,
            master_metadata: 11111111111111111111111111111111,
            master_mint: 11111111111111111111111111111111,
            install_authority: None,
            curator: Some(CuratorStatus {
                pubkey: 11111111111111111111111111111111,
                verified: true
            }),
            uri: \"sample\",
            name: \"MyApp\",
            kind: App,
            tag: None,
            supply: Some(1),
            total_installs: 0,
            install_price: 0,
            created_ts: 0,
            updated_ts: 0,
            total_rating: 0,
            num_ratings: 0,
            suspended: false,
            bump: [0]
        }"
        .split_whitespace()
        .join(" ");

        assert_eq!(output, format!("{acc:?}"));
    }

    #[test]
    fn xnft_serialization() {
        let acc = default_xnft();
        assert_ser_tokens(
            &acc,
            &[
                Token::Struct {
                    name: "Xnft",
                    len: 19,
                },
                Token::Str("publisher"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("installVault"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("masterMetadata"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("masterMint"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("installAuthority"),
                Token::None,
                Token::Str("curator"),
                Token::Some,
                Token::Struct {
                    name: "CuratorStatus",
                    len: 2,
                },
                Token::Str("pubkey"),
                Token::Str("11111111111111111111111111111111"),
                Token::Str("verified"),
                Token::Bool(true),
                Token::StructEnd,
                Token::Str("uri"),
                Token::Str("sample"),
                Token::Str("name"),
                Token::Str("MyApp"),
                Token::Str("kind"),
                Token::UnitVariant {
                    name: "Kind",
                    variant: "App",
                },
                Token::Str("tag"),
                Token::UnitVariant {
                    name: "Tag",
                    variant: "None",
                },
                Token::Str("supply"),
                Token::Some,
                Token::U64(1),
                Token::Str("totalInstalls"),
                Token::U64(0),
                Token::Str("installPrice"),
                Token::U64(0),
                Token::Str("createdTimestamp"),
                Token::I64(0),
                Token::Str("updatedTimestamp"),
                Token::I64(0),
                Token::Str("totalRating"),
                Token::U64(0),
                Token::Str("numberOfRatings"),
                Token::U32(0),
                Token::Str("suspended"),
                Token::Bool(false),
                Token::Str("bump"),
                Token::U8(0),
                Token::StructEnd,
            ],
        );
    }
}
