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
use std::rc::Rc;

use crate::config::Config;

pub fn create_program_client(config: &Config) -> (Program, Rc<Keypair>) {
    (
        Client::new_with_options(
            config.cluster.clone(),
            config.keypair.clone(),
            CommitmentConfig::confirmed(),
        )
        .program(Pubkey::new(&[
            157, 27, 158, 173, 41, 154, 191, 73, 36, 1, 30, 183, 61, 240, 32, 120, 43, 111, 171,
            57, 66, 118, 214, 8, 115, 206, 129, 138, 58, 41, 87, 194,
        ])),
        config.keypair.clone(),
    )
}

pub fn type_name_of_value<T>(_: &T) -> String {
    std::any::type_name::<T>().to_owned()
}

macro_rules! print_serializable {
    ($acc:expr,$json:expr) => {
        if $json {
            println!("{}", serde_json::to_string(&$acc)?);
        } else {
            println!("{:#?}", $acc);
        }
    };
}
pub(crate) use print_serializable;

macro_rules! send_with_approval {
    ($program:ident, $signer:expr, $accs:expr, $args:expr) => {{
        let __req = $program
            .request()
            .accounts($accs)
            .args($args)
            .signer($signer.as_ref());

        println!("Transactions:");
        println!("[0] {}", $crate::util::type_name_of_value(&$args));
        println!();

        let approved = dialoguer::Confirm::new()
            .with_prompt("Do you approve this transaction?")
            .default(false)
            .interact()?;

        if !approved {
            return Err(anyhow::anyhow!("Transaction aborted"));
        }

        __req.send_with_spinner_and_config(
            anchor_client::solana_client::rpc_config::RpcSendTransactionConfig::default(),
        )
    }};
}
pub(crate) use send_with_approval;
