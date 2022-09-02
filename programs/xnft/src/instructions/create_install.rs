use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_instruction};
use anchor_spl::metadata::MetadataAccount;
use mpl_token_metadata::state::CollectionDetails;

use crate::state::{Install, Xnft};
use crate::CustomError;

#[derive(Accounts)]
pub struct CreateInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        has_one = master_metadata,
        constraint = xnft.install_authority == None,
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft>,

    #[account(
        init,
        payer = authority,
        space = Install::LEN,
        seeds = [
            "install".as_bytes(),
            authority.key().as_ref(),
            xnft.key().as_ref(),
        ],
        bump,
    )]
    pub install: Account<'info, Install>,

    /// CHECK: xnft has_one constraint.
    #[account(mut)]
    pub install_vault: UncheckedAccount<'info>,

    pub master_metadata: Account<'info, MetadataAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_install_handler(ctx: Context<CreateInstall>) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let install = &mut ctx.accounts.install;
    let metadata = &ctx.accounts.master_metadata;

    if let Some(CollectionDetails::V1 { size }) = metadata.collection_details {
        if size > 0 && xnft.total_installs >= size {
            return Err(error!(CustomError::InstallExceedsSupply));
        }
    }

    //
    // Pay to install the xNFT, if needed.
    //
    if xnft.install_price > 0 {
        solana_program::program::invoke(
            &system_instruction::transfer(
                &ctx.accounts.authority.key(),
                &ctx.accounts.install_vault.key(),
                xnft.install_price,
            ),
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.install_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
    }

    //
    // Initialize the install data.
    //
    install.xnft = xnft.key();
    install.authority = ctx.accounts.authority.key();
    install.master_metadata = metadata.key();
    install.edition = xnft.total_installs;

    //
    // Track aggregate xnft metrics.
    //
    xnft.total_installs = xnft.total_installs.checked_add(1).unwrap();

    Ok(())
}
