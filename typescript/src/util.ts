/*
 * Copyright (C) 2023 Blue Coral, Inc.
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

import { Program, AnchorProvider, type Provider } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from ".";
import { type Xnft, IDL } from "./xnft";

export function buildAnonymousProvider(connection: Connection): Provider {
  return new AnchorProvider(
    connection,
    /* eslint @typescript-eslint/ban-ts-comment: 0 */
    // @ts-ignore
    { publicKey: PublicKey.default },
    {}
  );
}

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

export function enumsEqual<T extends string>(variant: { [t in T]?: unknown }, other: T): boolean {
  return Object.keys(variant)[0] === other;
}

export function gatewayUri(uri: string): string {
  return uri.replace("ipfs://", "https://nftstorage.link/ipfs/");
}
