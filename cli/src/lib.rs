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

use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::Program;
use anyhow::Result;
use clap::{Parser, Subcommand};

mod config;
mod util;

use config::{Config, GlobalArgs};
use util::{create_program_client, AccountType};

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    #[clap(flatten)]
    args: GlobalArgs,
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Read and parse account data from on-chain
    Account {
        /// The public key of the account to fetch and serialize
        address: Pubkey,
        /// The type of program account for the read data
        #[arg(short = 't', long = "type", value_enum)]
        account_type: AccountType,
    },
}

pub fn run(args: Cli) -> Result<()> {
    let cfg = Config::try_from(args.args)?;
    let (program, _) = create_program_client(&cfg);

    match args.command {
        Command::Account {
            address,
            account_type,
        } => process_account_read(program, account_type, address),
    }
}

fn process_account_read(
    program: Program,
    account_type: AccountType,
    address: Pubkey,
) -> Result<()> {
    println!("{:?}", account_type);
    println!("{:?}", address);
    Ok(())
}
