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

import { Connection, PublicKey } from "@solana/web3.js";
import type { Access, Install, Review, xNFT } from "./types";
import { buildAnonymousProgram } from "./util";

export async function getAccessAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<Access> {
  return await buildAnonymousProgram(connection).account.access.fetch(
    publicKey
  );
}

export async function getInstallAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<Install> {
  return buildAnonymousProgram(connection).account.install.fetch(publicKey);
}

export async function getReviewAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<Review> {
  return await buildAnonymousProgram(connection).account.review.fetch(
    publicKey
  );
}

export async function getXnftAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<xNFT> {
  return (await buildAnonymousProgram(connection).account.xnft.fetch(
    publicKey
  )) as any;
}
