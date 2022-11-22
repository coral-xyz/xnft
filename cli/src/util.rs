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

use anchor_client::solana_sdk::commitment_config::CommitmentConfig;
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::solana_sdk::signature::Keypair;
use anchor_client::{Client, Program};
use clap::ValueEnum;
use std::rc::Rc;

use crate::config::Config;

#[derive(Clone, Debug, ValueEnum)]
pub enum AccountType {
    Access,
    Install,
    Review,
    Xnft,
}

pub fn create_program_client(config: &Config) -> (Program, Rc<Keypair>) {
    (
        Client::new_with_options(
            config.cluster.clone(),
            config.keypair.clone(),
            CommitmentConfig::confirmed(),
        )
        .program(Pubkey::new(
            "xnft5aaToUM4UFETUQfj7NUDUBdvYHTVhNFThEYTm55".as_bytes(),
        )),
        config.keypair.clone(),
    )
}
