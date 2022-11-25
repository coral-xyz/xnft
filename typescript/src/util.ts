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

import { Program, AnchorProvider } from "@project-serum/anchor";
import { AccountLayout, ACCOUNT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from ".";
import { type Xnft, IDL } from "./xnft";

export function buildAnonymousProgram(connection: Connection): Program<Xnft> {
  const provider = new AnchorProvider(
    connection,
    /* eslint @typescript-eslint/ban-ts-comment: 0 */
    // @ts-ignore
    { publicKey: PublicKey.default },
    {}
  );
  return new Program(IDL, PROGRAM_ID, provider);
}

export function gatewayUri(uri: string): string {
  return uri.replace("ipfs://", "https://nftstorage.link/ipfs/");
}

export async function getTokenAccountForMint(
  connection: Connection,
  mint: PublicKey
): Promise<{ address: PublicKey; owner: PublicKey }> {
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
    address: tokenAccounts[0].pubkey,
    owner: ata.owner,
  };
}
