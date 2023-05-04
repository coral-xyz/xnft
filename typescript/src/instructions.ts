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

import { BN, Program } from "@coral-xyz/anchor";
import type { Creator } from "@metaplex-foundation/js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { type AccountMeta, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { deriveInstallAddress, deriveMasterMintAddress, TOKEN_METADATA_PROGRAM_ID } from "./addresses";
import type { IdlCreateXnftParameters, IdlUpdateXnftParameters } from "./types";
import type { Xnft } from "./xnft";

/**
 * Create a full transaction for `create_app_xnft`.
 * @export
 * @param {...Parameters<typeof createCreateAppXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createCreateAppXnftTransaction(
  ...args: Parameters<typeof createCreateAppXnftInstruction>
): Promise<Transaction> {
  const ix = await createCreateAppXnftInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `create_app_xnft` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {string} name
 * @param {IdlCreateXnftParameters} params
 * @returns {Promise<TransactionInstruction>}
 */
export async function createCreateAppXnftInstruction(
  program: Program<Xnft>,
  name: string,
  params: IdlCreateXnftParameters
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }

  const [masterMint] = deriveMasterMintAddress(name, program.provider.publicKey);
  const masterToken = getAssociatedTokenAddressSync(masterMint, program.provider.publicKey);

  return program.methods
    .createAppXnft(name, params)
    .accounts({
      masterMint,
      masterToken,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
}

/**
 * Create a full transaction for `create_collectible_xnft`.
 * @export
 * @param {...Parameters<typeof createCreateCollectibleXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createCreateCollectibleXnftTransaction(
  ...args: Parameters<typeof createCreateCollectibleXnftInstruction>
): Promise<Transaction> {
  const ix = await createCreateCollectibleXnftInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `create_collectible_xnft` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {IdlCreateXnftParameters} params
 * @param {PublicKey} metadata
 * @param {PublicKey} mint
 * @returns {Promise<TransactionInstruction>}
 */
export async function createCreateCollectibleXnftInstruction(
  program: Program<Xnft>,
  metadata: PublicKey,
  mint: PublicKey,
  params: IdlCreateXnftParameters
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }

  const masterToken = getAssociatedTokenAddressSync(mint, program.provider.publicKey);

  return program.methods
    .createCollectibleXnft(params)
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
 * @param {boolean} [permissioned]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createCreateInstallInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  installVault: PublicKey,
  permissioned?: boolean
): Promise<TransactionInstruction> {
  return permissioned
    ? await program.methods.createPermissionedInstall().accounts({ xnft, installVault }).instruction()
    : await program.methods.createInstall().accounts({ xnft, installVault }).instruction();
}

/**
 * Create a full transaction for `create_review`.
 * @export
 * @param {...Parameters<typeof createCreateReviewInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createCreateReviewTransaction(
  ...args: Parameters<typeof createCreateReviewInstruction>
): Promise<Transaction> {
  const ix = await createCreateReviewInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `create_review` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {string} uri
 * @param {number} rating
 * @param {PublicKey} install
 * @param {PublicKey} masterToken
 * @param {PublicKey} xnft
 * @returns {Promise<TransactionInstruction>}
 */
export async function createCreateReviewInstruction(
  program: Program<Xnft>,
  uri: string,
  rating: number,
  install: PublicKey,
  masterToken: PublicKey,
  xnft: PublicKey
): Promise<TransactionInstruction> {
  return program.methods
    .createReview(uri, rating)
    .accounts({
      install,
      masterToken,
      xnft,
    })
    .instruction();
}

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
 * @param {PublicKey} xnft
 * @param {PublicKey} [receiver]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createDeleteInstallInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  receiver?: PublicKey
): Promise<TransactionInstruction> {
  const [install] = deriveInstallAddress(program.provider.publicKey!, xnft);
  return program.methods
    .deleteInstall()
    .accounts({
      install,
      receiver: receiver ?? program.provider.publicKey,
    })
    .instruction();
}

/**
 * Create a full transaction for `delete_review`.
 * @export
 * @param {...Parameters<typeof createDeleteReviewInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createDeleteReviewTransaction(
  ...args: Parameters<typeof createDeleteReviewInstruction>
): Promise<Transaction> {
  const ix = await createDeleteReviewInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `delete_review` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} review
 * @param {PublicKey} [receiver]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createDeleteReviewInstruction(
  program: Program<Xnft>,
  review: PublicKey,
  receiver?: PublicKey
): Promise<TransactionInstruction> {
  return program.methods
    .deleteReview()
    .accounts({
      review,
      receiver: receiver ?? program.provider.publicKey,
    })
    .instruction();
}

/**
 * Create a full transaction for `delete_xnft`.
 * @export
 * @param {...Parameters<typeof createDeleteXnftInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createDeleteXnftTransaction(
  ...args: Parameters<typeof createDeleteXnftInstruction>
): Promise<Transaction> {
  const ix = await createDeleteXnftInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `delete_xnft` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} masterMetadata
 * @param {PublicKey} masterToken
 * @param {PublicKey} masterMint
 * @param {boolean} [burn]
 * @param {PublicKey} [receiver]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createDeleteXnftInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  masterMetadata: PublicKey,
  masterToken: PublicKey,
  masterMint: PublicKey,
  burn?: boolean,
  receiver?: PublicKey
): Promise<TransactionInstruction> {
  return program.methods
    .deleteXnft(burn ?? false)
    .accounts({
      xnft,
      masterMetadata,
      masterToken,
      masterMint,
      receiver: receiver ?? program.provider.publicKey,
    })
    .instruction();
}

/**
 * Create a full transaction for `donate`.
 * @export
 * @param {...Parameters<typeof createDonateInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createDonateTransaction(
  ...args: Parameters<typeof createDonateInstruction>
): Promise<Transaction> {
  const ix = await createDonateInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `donate` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {PublicKey} masterMetadata
 * @param {Creator[]} creators
 * @param {BN} amount
 * @returns {Promise<TransactionInstruction>}
 */
export async function createDonateInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  masterMetadata: PublicKey,
  creators: Creator[],
  amount: BN
): Promise<TransactionInstruction> {
  const remainingAccounts: AccountMeta[] = creators.map(c => ({
    pubkey: c.address,
    isSigner: false,
    isWritable: true,
  }));

  return program.methods
    .donate(amount)
    .accounts({
      xnft,
      masterMetadata,
    })
    .remainingAccounts(remainingAccounts)
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
  return program.methods.grantAccess().accounts({ xnft, wallet }).instruction();
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
  return program.methods.revokeAccess().accounts({ xnft, wallet }).instruction();
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
  return program.methods
    .setCurator()
    .accounts({
      xnft,
      masterToken,
      curator,
    })
    .instruction();
}

/**
 * Creates a full transaction for `set_curator_verification`.
 * @export
 * @param {...Parameters<typeof createSetCuratorVerificationInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createSetCuratorVerificationTransaction(
  ...args: Parameters<typeof createSetCuratorVerificationInstruction>
): Promise<Transaction> {
  const ix = await createSetCuratorVerificationInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create an ix instance for the `set_curator_verification` instruction.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} xnft
 * @param {boolean} value
 * @returns {Promise<TransactionInstruction>}
 */
export async function createSetCuratorVerificationInstruction(
  program: Program<Xnft>,
  xnft: PublicKey,
  value: boolean
): Promise<TransactionInstruction> {
  return program.methods.setCuratorVerification(value).accounts({ xnft }).instruction();
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
  return program.methods.setSuspended(value).accounts({ masterToken, xnft }).instruction();
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

  const destination = getAssociatedTokenAddressSync(masterMint, recipient);
  const source = getAssociatedTokenAddressSync(masterMint, program.provider.publicKey);

  return program.methods
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
 * @param {IdlUpdateXnftParameters} params
 * @param {PublicKey} xnft
 * @param {PublicKey} masterToken
 * @param {PublicKey} [curator]
 * @returns {Promise<TransactionInstruction>}
 */
export async function createUpdateXnftInstruction(
  program: Program<Xnft>,
  params: IdlUpdateXnftParameters,
  xnft: PublicKey,
  masterToken: PublicKey,
  curator?: PublicKey
): Promise<TransactionInstruction> {
  return program.methods
    .updateXnft(params)
    .accounts({
      masterToken,
      curationAuthority: curator ?? program.provider.publicKey,
      xnft,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
}
