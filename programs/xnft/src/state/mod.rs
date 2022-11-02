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

pub use access::*;
pub use install::*;
pub use review::*;
pub use xnft::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum Kind {
    App,
    Collection,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum L1 {
    Solana,
    Ethereum,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum Tag {
    None,
    Defi,
    Game,
    Nft,
}
