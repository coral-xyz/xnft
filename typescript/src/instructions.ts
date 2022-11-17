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

import { Program } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { deriveMasterMintAddress, METADATA_PROGRAM_ID } from "./addresses";
import type { CreateXnftParameters, UpdateXnftParameters } from "./types";
import type { Xnft } from "./xnft";

/**
 * Create a full transaction for `delete_install`.
 * @export
 * @param {...Parameters<typeof createDeleteInstallInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createDeleteInstallTransaction(
  ...args: Parameters<typeof createDeleteInstallInstruction>
): Promise<Transaction> {
  const ix = await createDeleteInstallInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `delete_install` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} install
 * @param {PublicKey} [receiver]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createDeleteInstallInstruction(
  program: Program<Xnft>,
  install: PublicKey,
  receiver?: PublicKey
): Promise<TransactionInstruction> {
  return await program.methods
    .deleteInstall()
    .accounts({
      install,
      receiver: receiver ?? program.provider.publicKey,
    })
    .instruction();
}

/**
 * Create a full transaction for `grant_access`.
 * @export
 * @param {...Parameters<typeof createGrantAccessInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createGrantAccessTransaction(
  ...args: Parameters<typeof createGrantAccessInstruction>
): Promise<Transaction> {
  const ix = await createGrantAccessInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `grant_access` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} wallet
 * @returns {Promise<TransactionInstruction>}
 */
export async function createGrantAccessInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  wallet: PublicKey
): Promise<TransactionInstruction> {
  return await program.methods
    .grantAccess()
    .accounts({ xnft, wallet })
    .instruction();
}

/**
 * Create a full transaction for `create_install` or `create_permissioned_install`
 * based on the value of the `permissioned` argument.
 * @export
 * @param {...Parameters<typeof createCreateInstallInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createCreateInstallTransaction(
  ...args: Parameters<typeof createCreateInstallInstruction>
): Promise<Transaction> {
  const ix = await createCreateInstallInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `create_install` or `create_permissioned_install`
 * instructions based on the value provided in the `permissioned` argument.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} installVault
 * @returns {Promise<TransactionInstruction>}
 */
export async function createCreateInstallInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  installVault: PublicKey,
  permissioned: boolean
): Promise<TransactionInstruction> {
  return permissioned
    ? await program.methods
        .createPermissionedInstall()
        .accounts({ xnft, installVault })
        .instruction()
    : await program.methods
        .createInstall()
        .accounts({ xnft, installVault })
        .instruction();
}

/**
 * Create a full transaction for `create_install`.
 * @export
 * @param {...Parameters<typeof createCreateXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createCreateXnftTransaction(
  ...args: Parameters<typeof createCreateXnftInstruction>
): Promise<Transaction> {
  const ix = await createCreateXnftInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `create_xnft` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {string} name
 * @param {CreateXnftParams} params
 * @returns {Promise<TransactionInstruction>}
 */
export async function createCreateXnftInstruction(
  program: Program<Xnft>,
  name: string,
  params: CreateXnftParameters
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }

  const kindVariantKey = Object.keys(params.kind)[0];

  const masterMint = await deriveMasterMintAddress(
    name,
    program.provider.publicKey,
    kindVariantKey === "app"
      ? undefined
      : (params.kind[kindVariantKey] as { pubkey: PublicKey }).pubkey
  );

  const masterToken = await getAssociatedTokenAddress(
    masterMint,
    program.provider.publicKey
  );

  return await program.methods
    .createXnft(name, params)
    .accounts({
      masterToken,
      metadataProgram: METADATA_PROGRAM_ID,
    })
    .instruction();
}

/**
 * Create a full transaction for `revoke_access`.
 * @export
 * @param {...Parameters<typeof createRevokeAccessInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createRevokeAccessTransaction(
  ...args: Parameters<typeof createRevokeAccessInstruction>
): Promise<Transaction> {
  const ix = await createRevokeAccessInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `revoke_access` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} wallet
 * @returns {Promise<TransactionInstruction>}
 */
export async function createRevokeAccessInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  wallet: PublicKey
): Promise<TransactionInstruction> {
  return await program.methods
    .revokeAccess()
    .accounts({ xnft, wallet })
    .instruction();
}

/**
 * Create a full transaction for `set_curator`.
 * @export
 * @param {...Parameters<typeof createSetCuratorInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createSetCuratorTransaction(
  ...args: Parameters<typeof createSetCuratorInstruction>
): Promise<Transaction> {
  const ix = await createSetCuratorInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `set_curator` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} masterToken
 * @param {PublicKey} curator
 * @returns {Promise<TransactionInstruction>}
 */
export async function createSetCuratorInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  masterToken: PublicKey,
  curator: PublicKey
): Promise<TransactionInstruction> {
  return await program.methods
    .setCurator()
    .accounts({
      xnft,
      masterToken,
      curator,
    })
    .instruction();
}

/**
 * Create a full transaction for `set_suspended`.
 * @export
 * @param {...Parameters<typeof createSetSuspendedInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createSetSuspendedTransaction(
  ...args: Parameters<typeof createSetSuspendedInstruction>
): Promise<Transaction> {
  const ix = await createSetSuspendedInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `set_suspended` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} masterToken
 * @param {boolean} value
 * @returns {Promise<TransactionInstruction>}
 */
export async function createSetSuspendedInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  masterToken: PublicKey,
  value: boolean
): Promise<TransactionInstruction> {
  return await program.methods
    .setSuspended(value)
    .accounts({ masterToken, xnft })
    .instruction();
}

/**
 * Create a full transaction for `transfer`.
 * @export
 * @param {...Parameters<typeof createTransferInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createTransferTransaction(
  ...args: Parameters<typeof createTransferInstruction>
): Promise<Transaction> {
  const ix = await createTransferInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `transfer` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} masterMint
 * @param {PublicKey} recipient
 * @returns {Promise<TransactionInstruction>}
 */
export async function createTransferInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  masterMint: PublicKey,
  recipient: PublicKey
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }

  const destination = await getAssociatedTokenAddress(masterMint, recipient);
  const source = await getAssociatedTokenAddress(
    masterMint,
    program.provider.publicKey
  );

  return await program.methods
    .transfer()
    .accounts({
      xnft,
      masterMint,
      source,
      destination,
      recipient,
    })
    .instruction();
}

/**
 * Create a full transaction for `update_xnft`.
 * @export
 * @param {...Parameters<typeof createUpdateXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createUpdateXnftTransaction(
  ...args: Parameters<typeof createUpdateXnftInstruction>
): Promise<Transaction> {
  const ix = await createUpdateXnftInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `update_xnft` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {UpdateXnftParameters} params
 * @param {PublicKey} xnft
 * @param {PublicKey} masterMetadata
 * @param {PublicKey} masterToken
 * @param {PublicKey} [curator]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createUpdateXnftInstruction(
  program: Program<Xnft>,
  params: UpdateXnftParameters,
  xnft: PublicKey,
  masterMetadata: PublicKey,
  masterToken: PublicKey,
  curator?: PublicKey
): Promise<TransactionInstruction> {
  return await program.methods
    .updateXnft(params)
    .accounts({
      masterMetadata,
      masterToken,
      updateAuthority: curator ?? program.provider.publicKey,
      xnft,
      metadataProgram: METADATA_PROGRAM_ID,
    })
    .instruction();
}
