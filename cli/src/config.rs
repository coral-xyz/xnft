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

use anchor_client::solana_sdk::signature::Keypair;
use anchor_client::Cluster;
use anyhow::{anyhow, Result};
use clap::{Args, ValueHint};
use solana_cli_config::Config as SolanaConfig;
use std::fs::read_to_string;
use std::path::PathBuf;
use std::rc::Rc;

#[derive(Args)]
pub struct GlobalArgs {
    /// Auto approve transactions sent through the tool
    #[arg(global = true, long)]
    auto_approve: bool,
    /// Path to the keypair to be used as signer
    #[clap(global = true, long, value_parser, value_hint = ValueHint::FilePath)]
    keypair: Option<String>,
    /// Cluster or RPC URL to use (or their first letter) ["mainnet-beta", "devnet", "testnet", "localnet"]
    #[arg(global = true, long, value_parser)]
    url: Option<Cluster>,
}

pub struct Config {
    pub auto_approved: bool,
    pub cluster: Cluster,
    pub keypair: Rc<Keypair>,
}

impl TryFrom<GlobalArgs> for Config {
    type Error = anyhow::Error;

    fn try_from(value: GlobalArgs) -> Result<Self, Self::Error> {
        let sol_cfg = SolanaConfig::load(solana_cli_config::CONFIG_FILE.as_ref().unwrap())?;

        let n_keypair = normalize_path_arg(
            "--keypair",
            value.keypair.as_ref().unwrap_or(&sol_cfg.keypair_path),
        )?;

        let keypair = {
            let data = read_to_string(&n_keypair)?;
            let bytes: Vec<u8> = serde_json::from_str(&data)?;
            Keypair::from_bytes(&bytes)
        }?;

        let cluster = value
            .url
            .as_ref()
            .unwrap_or(&Cluster::Custom(
                sol_cfg.json_rpc_url,
                sol_cfg.websocket_url,
            ))
            .to_owned();

        Ok(Self {
            auto_approved: value.auto_approve,
            cluster,
            keypair: Rc::new(keypair),
        })
    }
}

fn normalize_path_arg(name: &str, val: &str) -> Result<PathBuf> {
    let normalized = if val.starts_with('~') {
        PathBuf::from(shellexpand::tilde(&val).to_string())
    } else {
        PathBuf::from(&val)
    };

    if !normalized.exists() {
        return Err(anyhow!("provided file path for `{}` was invalid", name));
    }

    Ok(normalized)
}
