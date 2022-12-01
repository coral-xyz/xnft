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
use anyhow::Result;
use clap::{Parser, Subcommand, ValueEnum};

mod config;
mod util;

use config::{Config, GlobalArgs};
use spl_associated_token_account::get_associated_token_address;
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
    Xnft,
}

#[derive(Subcommand)]
enum Command {
    /// Read and parse the account data for a program account
    Account {
        /// The public key of the target xNFT
        #[arg(value_parser)]
        address: Pubkey,
        /// The program account type
        #[arg(short = 't', long = "type", value_enum)]
        account_type: AccountType,
        /// Display the account data as JSON
        #[arg(long)]
        json: bool,
    },
    /// Assign a curation account to the xNFT
    SetCurator {
        /// The public key of the target xNFT
        #[arg(value_parser)]
        address: Pubkey,
        /// The public key of the curator to assign
        #[arg(short, long, value_parser)]
        curator: Pubkey,
    },
    /// Toggle the target xNFT's suspended state
    ToggleSuspended {
        /// The public key of the target xNFT
        #[arg(value_parser)]
        address: Pubkey,
    },
    /// Uninstall an xNFT from your wallet
    Uninstall {
        /// The public key of the xNFT to uninstall
        #[arg(value_parser)]
        address: Pubkey,
    },
    /// Verify a curator's assignment to an xNFT
    Verify {
        /// The public key of the xNFT being verified
        #[arg(value_parser)]
        address: Pubkey,
    },
}

pub fn run(args: Cli) -> Result<()> {
    let cfg = Config::try_from(args.args)?;

    match args.command {
        Command::Account {
            address,
            account_type,
            json,
        } => process_get_account(cfg, account_type, address, json),
        Command::SetCurator { address, curator } => process_set_curator(cfg, address, curator),
        Command::ToggleSuspended { address } => process_toggle_suspend(cfg, address),
        Command::Uninstall { address } => process_uninstall(cfg, address),
        Command::Verify { address } => process_verify(cfg, address),
    }
}

fn process_get_account(
    cfg: Config,
    account_type: AccountType,
    address: Pubkey,
    json: bool,
) -> Result<()> {
    let (program, _) = create_program_client(&cfg);
    match account_type {
        AccountType::Access => {
            print_serializable!(program.account::<xnft::state::Access>(address)?, json)
        }
        AccountType::Install => {
            print_serializable!(program.account::<xnft::state::Install>(address)?, json)
        }
        AccountType::Review => {
            print_serializable!(program.account::<xnft::state::Review>(address)?, json)
        }
        AccountType::Xnft => {
            print_serializable!(program.account::<xnft::state::Xnft>(address)?, json)
        }
    };
    Ok(())
}

fn process_set_curator(cfg: Config, address: Pubkey, curator: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let account: xnft::state::Xnft = program.account(address)?;
    let master_token = get_associated_token_address(&program.payer(), &account.master_mint);

    let sig = program
        .request()
        .accounts(xnft::accounts::SetCurator {
            authority: program.payer(),
            curator,
            master_token,
            xnft: address,
        })
        .args(xnft::instruction::SetCurator {})
        .signer(signer.as_ref())
        .send_with_spinner_and_config(RpcSendTransactionConfig::default())?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_toggle_suspend(cfg: Config, address: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let account: xnft::state::Xnft = program.account(address)?;
    let master_token = get_associated_token_address(&program.payer(), &account.master_mint);

    let sig = program
        .request()
        .accounts(xnft::accounts::SetSuspended {
            authority: program.payer(),
            master_token,
            xnft: address,
        })
        .args(xnft::instruction::SetSuspended {
            flag: !account.suspended,
        })
        .signer(signer.as_ref())
        .send_with_spinner_and_config(RpcSendTransactionConfig::default())?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_uninstall(cfg: Config, address: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
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
        .signer(signer.as_ref())
        .send_with_spinner_and_config(RpcSendTransactionConfig::default())?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_verify(cfg: Config, address: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let sig = program
        .request()
        .accounts(xnft::accounts::VerifyCurator {
            curator: program.payer(),
            xnft: address,
        })
        .args(xnft::instruction::VerifyCurator {})
        .signer(signer.as_ref())
        .send_with_spinner_and_config(RpcSendTransactionConfig::default())?;

    println!("Signature: {}", sig);
    Ok(())
}
