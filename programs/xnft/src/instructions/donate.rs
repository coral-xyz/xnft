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
use anchor_lang::system_program;
use anchor_spl::metadata::MetadataAccount;
use std::collections::BTreeSet;

use crate::state::{Kind, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(
        has_one = master_metadata,
        constraint = xnft.kind == Kind::App @ CustomError::MustBeApp,
    )]
    pub xnft: Account<'info, Xnft>,

    pub master_metadata: Account<'info, MetadataAccount>,

    #[account(mut)]
    pub donator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn donate_handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Donate<'info>>,
    amount: u64,
) -> Result<()> {
    let metadata = &ctx.accounts.master_metadata;

    require!(
        metadata.data.creators.is_some(),
        CustomError::UnknownCreator,
    );

    let creators = metadata.data.creators.as_ref().unwrap();
    require_eq!(creators.len(), ctx.remaining_accounts.len());

    let mut processed = BTreeSet::<Pubkey>::new();

    for info in ctx.remaining_accounts {
        match creators.iter().find(|c| c.address == *info.key) {
            Some(c) => {
                if processed.contains(info.key) {
                    continue;
                }

                let partition = amount * (c.share as u64) / 100u64;

                system_program::transfer(
                    CpiContext::new(
                        ctx.accounts.system_program.to_account_info(),
                        system_program::Transfer {
                            from: ctx.accounts.donator.to_account_info(),
                            to: info.clone(),
                        },
                    ),
                    partition,
                )?;

                processed.insert(info.key());
            }
            None => return Err(error!(CustomError::UnknownCreator)),
        }
    }

    require_eq!(creators.len(), processed.len());

    Ok(())
}
