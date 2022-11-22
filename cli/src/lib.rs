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

use anchor_client::solana_client::rpc_config::RpcSendTransactionConfig;
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::Program;
use anyhow::Result;
use clap::{Parser, Subcommand, ValueEnum};

mod config;
mod util;

use config::{Config, GlobalArgs};
use util::{create_program_client, print_serializable};

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    #[clap(flatten)]
    args: GlobalArgs,
    #[command(subcommand)]
    command: Command,
}

#[derive(Clone, ValueEnum)]
enum AccountType {
    Access,
    Install,
    Review,
    // Xnft,
}

#[derive(Subcommand)]
enum Command {
    /// Read and parse the account data for a program account
    Account {
        /// The public key of the target xNFT
        address: Pubkey,
        /// The program account type
        #[arg(short = 't', long = "type", value_enum)]
        account_type: AccountType,
        /// Display the account data as JSON
        #[arg(long)]
        json: bool,
    },
    /// Uninstall an xNFT from your wallet
    Uninstall {
        /// The public key of the xNFT to uninstall
        address: Pubkey,
    },
    /// Verify a curator's assignment to an xNFT
    Verify {
        /// The public key of the xNFT being verified
        address: Pubkey,
    },
}

pub fn run(args: Cli) -> Result<()> {
    let cfg = Config::try_from(args.args)?;
    let (program, _) = create_program_client(&cfg);

    match args.command {
        Command::Account {
            address,
            account_type,
            json,
        } => process_get_account(program, account_type, address, json),
        Command::Uninstall { address } => process_uninstall(program, address),
        Command::Verify { address } => process_verify(program, address),
    }
}

fn process_get_account(
    program: Program,
    account_type: AccountType,
    address: Pubkey,
    json: bool,
) -> Result<()> {
    match account_type {
        AccountType::Access => {
            print_serializable!(program.account::<xnft::state::Access>(address)?, json)
        }
        AccountType::Install => {
            print_serializable!(program.account::<xnft::state::Install>(address)?, json)
        }
        AccountType::Review => {
            print_serializable!(program.account::<xnft::state::Review>(address)?, json)
        } // AccountType::Xnft => {
          //     print_serializable!(program.account::<xnft::state::Xnft>(address)?, json)
          // }
    };
    Ok(())
}

fn process_uninstall(program: Program, address: Pubkey) -> Result<()> {
    let authority = program.payer();
    let (install, _) = Pubkey::find_program_address(
        &["install".as_bytes(), authority.as_ref(), address.as_ref()],
        &program.id(),
    );

    let sig = program
        .request()
        .accounts(xnft::accounts::DeleteInstall {
            authority,
            install,
            receiver: authority,
        })
        .args(xnft::instruction::DeleteInstall {})
        .send_with_spinner_and_config(RpcSendTransactionConfig::default())?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_verify(program: Program, address: Pubkey) -> Result<()> {
    let sig = program
        .request()
        .accounts(xnft::accounts::VerifyCurator {
            curator: program.payer(),
            xnft: address,
        })
        .args(xnft::instruction::VerifyCurator {})
        .send_with_spinner_and_config(RpcSendTransactionConfig::default())?;

    println!("Signature: {}", sig);
    Ok(())
}
