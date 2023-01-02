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

use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::solana_sdk::system_program;
use anyhow::Result;
use clap::{Parser, Subcommand, ValueEnum};
use spl_associated_token_account::get_associated_token_address;

mod config;
mod util;

use config::{Config, GlobalArgs};
use util::{create_program_client, print_serializable, send_with_approval};

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

#[derive(Clone, ValueEnum)]
enum AccessManagementOperation {
    Grant,
    Revoke,
}

#[derive(Subcommand)]
enum Command {
    /// Read and parse the account data for a program account
    Account {
        /// The public key of the target program account
        #[arg(value_parser)]
        address: Pubkey,
        /// The program account type
        #[arg(short = 't', long = "type", value_enum)]
        account_type: AccountType,
        /// Display the account data as JSON
        #[arg(long)]
        json: bool,
    },
    /// Grant or revoke access to a wallet for a private xNFT
    ManageAccess {
        /// The public key of the target wallet
        #[arg(value_parser)]
        wallet: Pubkey,
        /// Either grant or revoke for what action is desired
        #[arg(short, long, value_enum)]
        operation: AccessManagementOperation,
        /// The public key of the private xNFT
        #[arg(short, long, value_parser)]
        xnft: Pubkey,
    },
    /// Assign a curation account to the xNFT
    SetCurator {
        /// The public key of the target xNFT
        #[arg(value_parser)]
        xnft: Pubkey,
        /// The public key of the curator to assign
        #[arg(short, long, value_parser)]
        curator: Pubkey,
    },
    /// Toggle the target xNFT's suspended state
    ToggleSuspended {
        /// The public key of the target xNFT
        #[arg(value_parser)]
        xnft: Pubkey,
    },
    /// Transfer ownership of an xNFT to another wallet
    Transfer {
        /// The public key of the xNFT being transferred
        #[arg(value_parser)]
        xnft: Pubkey,
        /// The public key receiving the xNFT
        #[arg(short, long, value_parser)]
        recipient: Pubkey,
    },
    /// Uninstall an xNFT from your wallet
    Uninstall {
        /// The public key of the xNFT to uninstall
        #[arg(value_parser)]
        xnft: Pubkey,
    },
    /// Verify a curator's assignment to an xNFT
    Verify {
        /// The public key of the xNFT being verified
        #[arg(value_parser)]
        xnft: Pubkey,
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
        Command::ManageAccess {
            wallet,
            operation,
            xnft,
        } => process_grant_access(cfg, wallet, operation, xnft),
        Command::SetCurator { xnft, curator } => process_set_curator(cfg, xnft, curator),
        Command::ToggleSuspended { xnft } => process_toggle_suspend(cfg, xnft),
        Command::Transfer { xnft, recipient } => process_transfer(cfg, xnft, recipient),
        Command::Uninstall { xnft } => process_uninstall(cfg, xnft),
        Command::Verify { xnft } => process_verify(cfg, xnft),
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

fn process_grant_access(
    cfg: Config,
    wallet: Pubkey,
    operation: AccessManagementOperation,
    xnft: Pubkey,
) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let (access, _) = Pubkey::find_program_address(
        &["access".as_bytes(), wallet.as_ref(), xnft.as_ref()],
        &program.id(),
    );

    let sig = match operation {
        AccessManagementOperation::Grant => send_with_approval!(
            program,
            signer,
            cfg.auto_approved,
            xnft::accounts::GrantAccess {
                access,
                authority: program.payer(),
                system_program: system_program::ID,
                wallet,
                xnft,
            },
            xnft::instruction::GrantAccess {}
        )?,
        AccessManagementOperation::Revoke => send_with_approval!(
            program,
            signer,
            cfg.auto_approved,
            xnft::accounts::RevokeAccess {
                access,
                authority: program.payer(),
                wallet,
                xnft,
            },
            xnft::instruction::RevokeAccess {}
        )?,
    };

    println!("Signature: {}", sig);
    Ok(())
}

fn process_set_curator(cfg: Config, address: Pubkey, curator: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let account: xnft::state::Xnft = program.account(address)?;
    let master_token = get_associated_token_address(&program.payer(), &account.master_mint);

    let sig = send_with_approval!(
        program,
        signer,
        cfg.auto_approved,
        xnft::accounts::SetCurator {
            authority: program.payer(),
            curator,
            master_token,
            xnft: address,
        },
        xnft::instruction::SetCurator {}
    )?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_toggle_suspend(cfg: Config, address: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let account: xnft::state::Xnft = program.account(address)?;
    let master_token = get_associated_token_address(&program.payer(), &account.master_mint);

    let sig = send_with_approval!(
        program,
        signer,
        cfg.auto_approved,
        xnft::accounts::SetSuspended {
            authority: program.payer(),
            master_token,
            xnft: address,
        },
        xnft::instruction::SetSuspended {
            flag: !account.suspended,
        }
    )?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_transfer(cfg: Config, xnft: Pubkey, recipient: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let account: xnft::state::Xnft = program.account(xnft)?;

    let destination = get_associated_token_address(&recipient, &account.master_mint);
    let source = get_associated_token_address(&program.payer(), &account.master_mint);

    let sig = send_with_approval!(
        program,
        signer,
        cfg.auto_approved,
        xnft::accounts::Transfer {
            associated_token_program: spl_associated_token_account::ID,
            authority: program.payer(),
            destination,
            master_mint: account.master_mint,
            recipient,
            source,
            system_program: system_program::ID,
            token_program: spl_token::ID,
            xnft,
        },
        xnft::instruction::Transfer {}
    )?;

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

    let sig = send_with_approval!(
        program,
        signer,
        cfg.auto_approved,
        xnft::accounts::DeleteInstall {
            authority,
            install,
            receiver: authority,
        },
        xnft::instruction::DeleteInstall {}
    )?;

    println!("Signature: {}", sig);
    Ok(())
}

fn process_verify(cfg: Config, address: Pubkey) -> Result<()> {
    let (program, signer) = create_program_client(&cfg);
    let sig = send_with_approval!(
        program,
        signer,
        cfg.auto_approved,
        xnft::accounts::VerifyCurator {
            curator: program.payer(),
            xnft: address,
        },
        xnft::instruction::VerifyCurator {}
    )?;

    println!("Signature: {}", sig);
    Ok(())
}
