use anchor_client::solana_client::rpc_filter::{Memcmp, MemcmpEncodedBytes, RpcFilterType};
use anchor_client::solana_sdk::commitment_config::CommitmentConfig;
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::solana_sdk::signature::Keypair;
use anchor_client::{Client, Cluster, Program};
use clap::{AppSettings, Parser};
use std::rc::Rc;
use xnft::state::{Install, Review, Xnft};

#[derive(Debug, Parser)]
#[clap(version)]
#[clap(propagate_version = true)]
#[clap(global_setting(AppSettings::DeriveDisplayOrder))]
pub struct Opts {
    #[clap(subcommand)]
    command: Command,
}

#[derive(Debug, Parser)]
enum Command {
    Account {
        #[clap(value_parser)]
        address: Pubkey,
    },
    Installs {
        #[clap(value_parser)]
        xnft: Pubkey,
    },
    Reviews {
        #[clap(value_parser)]
        xnft: Pubkey,
    },
}

fn main() -> anyhow::Result<()> {
    let client = Client::new_with_options(
        Cluster::Mainnet,
        Rc::new(Keypair::new()),
        CommitmentConfig::confirmed(),
    );

    let program = client.program(xnft::ID);

    match Opts::parse().command {
        Command::Account { address } => process_account(&program, address),
        Command::Installs { xnft } => process_installs(&program, xnft),
        Command::Reviews { xnft } => process_reviews(&program, xnft),
    }
}

fn process_account(program: &Program, address: Pubkey) -> anyhow::Result<()> {
    let acc: Xnft = program.account(address)?;
    println!("{:#?}", acc);
    Ok(())
}

fn process_installs(program: &Program, xnft: Pubkey) -> anyhow::Result<()> {
    let accs: Vec<(Pubkey, Install)> = program.accounts(vec![RpcFilterType::Memcmp(Memcmp {
        offset: 8 + 32,
        bytes: MemcmpEncodedBytes::Base58(xnft.to_string()),
        encoding: None,
    })])?;

    println!(
        "{:#?}",
        accs.iter()
            .map(|acc| acc.1.clone())
            .collect::<Vec<Install>>()
    );
    Ok(())
}

fn process_reviews(program: &Program, xnft: Pubkey) -> anyhow::Result<()> {
    let accs: Vec<(Pubkey, Review)> = program.accounts(vec![RpcFilterType::Memcmp(Memcmp {
        offset: 8 + 32,
        bytes: MemcmpEncodedBytes::Base58(xnft.to_string()),
        encoding: None,
    })])?;

    println!(
        "{:#?}",
        accs.iter()
            .map(|acc| acc.1.clone())
            .collect::<Vec<Review>>()
    );
    Ok(())
}
