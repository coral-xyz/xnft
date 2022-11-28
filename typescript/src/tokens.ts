/*
 * Copyright (C) 2022 Blue Coral, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { ProgramAccount } from "@project-serum/anchor";
import { AccountLayout, ACCOUNT_SIZE, TOKEN_PROGRAM_ID, type RawAccount as TokenAccount } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Get the active NFT associated token account for the argued master mint public key
 * that has the token current in the balance.
 * @export
 * @param {Connection} connection
 * @param {PublicKey} mint
 * @returns {Promise<ProgramAccount<TokenAccount>>}
 */
export async function getNftTokenAccountForMint(
  connection: Connection,
  mint: PublicKey
): Promise<ProgramAccount<TokenAccount>> {
  const tokenAccounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: ACCOUNT_SIZE },
      {
        memcmp: {
          offset: 0,
          bytes: mint.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 64,
          bytes: "2", // base-58 encoding of Buffer.from([1]) for a balance of 1
        },
      },
    ],
  });

  if (tokenAccounts.length === 0) {
    throw new Error(`no token accounts found for mint ${mint.toBase58()}`);
  }

  const ata = AccountLayout.decode(tokenAccounts[0].account.data);
  return {
    account: ata,
    publicKey: tokenAccounts[0].pubkey,
  };
}
