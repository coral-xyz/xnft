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

use anchor_lang::prelude::*;

mod access;
mod install;
mod review;
mod xnft;

pub use self::xnft::*; // use `self::` prefix to remove crate vs module ambiguity during builds
pub use access::*;
pub use install::*;
pub use review::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum Kind {
    App,
    Collection { pubkey: Pubkey },
    Nft { pubkey: Pubkey },
}

impl Kind {
    pub fn as_pubkey(&self) -> Pubkey {
        match self {
            Kind::App => Pubkey::default(),
            Kind::Collection { pubkey } | Kind::Nft { pubkey } => *pubkey,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nfts,
}

#[cfg(test)]
mod tests {
    use anchor_lang::prelude::Pubkey;
    use std::str::FromStr;

    use super::Kind;

    #[test]
    fn kind_variant_as_bytes() {
        let pk = Pubkey::from_str("BaHSGaf883GA3u8qSC5wNigcXyaScJLSBJZbALWvPcjs").unwrap();
        let x = Kind::App.as_pubkey();
        assert_eq!(x.as_ref(), Pubkey::default().as_ref());

        let y = Kind::Collection { pubkey: pk }.as_pubkey();
        assert_eq!(y.as_ref(), pk.as_ref());

        let z = Kind::Nft { pubkey: pk }.as_pubkey();
        assert_eq!(z.as_ref(), pk.as_ref());
    }
}
