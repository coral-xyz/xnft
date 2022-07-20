use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_instruction};

use crate::state::{Install, Xnft2};
use crate::CustomError;

#[derive(Accounts)]
pub struct CreateInstall<'info> {
    #[account(
        mut,
        has_one = install_vault,
        constraint = xnft.install_authority == None,
        constraint = !xnft.suspended @ CustomError::SuspendedInstallation,
    )]
    pub xnft: Account<'info, Xnft2>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
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

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: xnft has_one constraint.
    pub install_vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_install_handler(ctx: Context<CreateInstall>) -> Result<()> {
    let xnft = &mut ctx.accounts.xnft;
    let install = &mut ctx.accounts.install;

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
    install.id = xnft.total_installs;
    install.authority = ctx.accounts.authority.key();
    install.master_metadata = xnft.master_metadata;

    //
    // Track aggregate xnft metrics.
    //
    xnft.total_installs += 1;

    Ok(())
}
