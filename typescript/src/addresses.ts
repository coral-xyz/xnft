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

import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("xnft5aaToUM4UFETUQfj7NUDUBdvYHTVhNFThEYTm55");

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/**
 * Derive the PDA for an Access program account.
 * @export
 * @param {PublicKey} wallet
 * @param {PublicKey} xnft
 * @returns {[PublicKey, number]}
 */
export function deriveAccessAddress(wallet: PublicKey, xnft: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("access"), wallet.toBytes(), xnft.toBytes()], PROGRAM_ID);
}

/**
 * Derive the PDA for an Install program account.
 * @export
 * @param {PublicKey} authority
 * @param {PublicKey} xnft
 * @returns {[PublicKey, number]}
 */
export function deriveInstallAddress(authority: PublicKey, xnft: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("install"), authority.toBytes(), xnft.toBytes()], PROGRAM_ID);
}

/**
 * Derive the PDA of the master mint account.
 * @export
 * @param {string} name
 * @param {PublicKey} publisher
 * @returns {[PublicKey, number]}
 */
export function deriveMasterMintAddress(name: string, publisher: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("mint"), publisher.toBytes(), Buffer.from(name)], PROGRAM_ID);
}

/**
 * Derive the PDA of a Review program account.
 * @export
 * @param {PublicKey} xnft
 * @param {PublicKey} author
 * @returns {[PublicKey, number]}
 */
export function deriveReviewAddress(xnft: PublicKey, author: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("review"), xnft.toBytes(), author.toBytes()], PROGRAM_ID);
}

/**
 * Derive the PDA of the associated xNFT program account.
 * @export
 * @param {PublicKey} masterMint
 * @returns {[PublicKey, number]}
 */
export function deriveXnftAddress(masterMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("xnft"), masterMint.toBytes()], PROGRAM_ID);
}
