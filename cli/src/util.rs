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

use anchor_client::solana_sdk::commitment_config::CommitmentConfig;
use anchor_client::solana_sdk::signature::Keypair;
use anchor_client::{Client, Program};
use std::rc::Rc;

use crate::config::Config;

pub fn create_program_client(config: &Config) -> (Program<Rc<Keypair>>, Rc<Keypair>) {
    (
        Client::new_with_options(
            config.cluster.clone(),
            config.keypair.clone(),
            CommitmentConfig::confirmed(),
        )
        .program(xnft::ID)
        .unwrap(),
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
    ($program:ident, $signer:expr, $auto_approved:expr, $accs:expr, $args:expr) => {{
        let __req = $program
            .request()
            .accounts($accs)
            .args($args)
            .signer($signer.as_ref());

        println!("Transactions:");
        println!("[0] {}", $crate::util::type_name_of_value(&$args));
        println!();

        if !$auto_approved {
            let __approved = dialoguer::Confirm::new()
                .with_prompt("Do you approve this transaction?")
                .default(false)
                .interact()?;

            if !__approved {
                return Err(anyhow::anyhow!("Transaction aborted"));
            }
        }

        __req.send_with_spinner_and_config(
            anchor_client::solana_client::rpc_config::RpcSendTransactionConfig::default(),
        )
    }};
}
pub(crate) use send_with_approval;
