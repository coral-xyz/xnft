// Copyright (C) 2022 Blue Coral, Inc.

use anchor_lang::prelude::AccountInfo;
use anchor_lang::solana_program::{self, system_instruction};

pub fn send_payment<'info>(
    price: u64,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    program: AccountInfo<'info>,
) -> anchor_lang::Result<()> {
    solana_program::program::invoke(
        &system_instruction::transfer(from.key, to.key, price),
        &[from, to, program],
    )
    .map_err(Into::into)
}
