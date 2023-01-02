// Copyright (C) 2023 Blue Coral, Inc.
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

use super::Tag;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreatorsParam {
    pub address: Pubkey,
    pub share: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateXnftParams {
    pub creators: Vec<CreatorsParam>,
    pub curator: Option<Pubkey>,
    pub install_authority: Option<Pubkey>,
    pub install_price: u64,
    pub install_vault: Pubkey,
    pub seller_fee_basis_points: u16,
    pub supply: Option<u64>,
    pub symbol: String,
    pub tag: Tag,
    pub uri: String,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateParams {
    pub install_authority: Option<Pubkey>,
    pub install_price: u64,
    pub install_vault: Pubkey,
    pub name: Option<String>,
    pub supply: Option<u64>,
    pub tag: Tag,
    pub uri: Option<String>,
}
