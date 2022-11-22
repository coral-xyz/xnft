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
import {
  deriveMasterMintAddress,
  TOKEN_METADATA_PROGRAM_ID,
} from "./addresses";
import type { CreateXnftParameters, Kind, UpdateXnftParameters } from "./types";
import type { Xnft } from "./xnft";

/**
 * Create a full transaction for `create_associated_xnft`.
 * @export
 * @param {...Parameters<typeof createXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createAssociatedXnftTransaction(
  ...args: Parameters<typeof createAssociatedXnftInstruction>
): Promise<Transaction> {
  const ix = await createAssociatedXnftInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `create_associated_xnft` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {Kind} kind
 * @param {CreateXnftParameters} params
 * @param {PublicKey} metadata
 * @param {PublicKey} mint
 * @returns {Promise<TransactionInstruction>}
 */
export async function createAssociatedXnftInstruction(
  program: Program<Xnft>,
  kind: Kind,
  metadata: PublicKey,
  mint: PublicKey,
  params: CreateXnftParameters
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }

  const masterToken = await getAssociatedTokenAddress(
    mint,
    program.provider.publicKey
  );

  return await program.methods
    .createAssociatedXnft({ [kind.toLowerCase()]: {} }, params)
    .accounts({
      masterMint: mint,
      masterToken,
      masterMetadata: metadata,
    })
    .instruction();
}

/**
 * Create a full transaction for `create_install` or `create_permissioned_install`
 * based on the value of the `permissioned` argument.
 * @export
 * @param {...Parameters<typeof createInstallInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createInstallTransaction(
  ...args: Parameters<typeof createInstallInstruction>
): Promise<Transaction> {
  const ix = await createInstallInstruction(...args);
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
export async function createInstallInstruction(
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
 * Create a full transaction for `create_xnft`.
 * @export
 * @param {...Parameters<typeof createXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createXnftTransaction(
  ...args: Parameters<typeof createXnftInstruction>
): Promise<Transaction> {
  const ix = await createXnftInstruction(...args);
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
export async function createXnftInstruction(
  program: Program<Xnft>,
  name: string,
  params: CreateXnftParameters
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }

  const masterMint = await deriveMasterMintAddress(
    name,
    program.provider.publicKey
  );

  const masterToken = await getAssociatedTokenAddress(
    masterMint,
    program.provider.publicKey
  );

  return await program.methods
    .createXnft(name, params)
    .accounts({
      masterToken,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
}

/**
 * Create a full transaction for `delete_install`.
 * @export
 * @param {...Parameters<typeof deleteInstallInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function deleteInstallTransaction(
  ...args: Parameters<typeof deleteInstallInstruction>
): Promise<Transaction> {
  const ix = await deleteInstallInstruction(...args);
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
export async function deleteInstallInstruction(
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
 * @param {...Parameters<typeof grantAccessInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function grantAccessTransaction(
  ...args: Parameters<typeof grantAccessInstruction>
): Promise<Transaction> {
  const ix = await grantAccessInstruction(...args);
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
export async function grantAccessInstruction(
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
 * Create a full transaction for `revoke_access`.
 * @export
 * @param {...Parameters<typeof revokeAccessInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function revokeAccessTransaction(
  ...args: Parameters<typeof revokeAccessInstruction>
): Promise<Transaction> {
  const ix = await revokeAccessInstruction(...args);
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
export async function revokeAccessInstruction(
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
 * @param {...Parameters<typeof setCuratorInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function setCuratorTransaction(
  ...args: Parameters<typeof setCuratorInstruction>
): Promise<Transaction> {
  const ix = await setCuratorInstruction(...args);
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
export async function setCuratorInstruction(
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
 * @param {...Parameters<typeof setSuspendedInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function setSuspendedTransaction(
  ...args: Parameters<typeof setSuspendedInstruction>
): Promise<Transaction> {
  const ix = await setSuspendedInstruction(...args);
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
export async function setSuspendedInstruction(
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
 * @param {...Parameters<typeof transferInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function transferTransaction(
  ...args: Parameters<typeof transferInstruction>
): Promise<Transaction> {
  const ix = await transferInstruction(...args);
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
export async function transferInstruction(
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
 * @param {...Parameters<typeof updateXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function updateXnftTransaction(
  ...args: Parameters<typeof updateXnftInstruction>
): Promise<Transaction> {
  const ix = await updateXnftInstruction(...args);
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
export async function updateXnftInstruction(
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
      curationAuthority: curator ?? program.provider.publicKey,
      xnft,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
}
