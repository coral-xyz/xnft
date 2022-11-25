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

import { Metaplex, toMetadataAccount } from "@metaplex-foundation/js";
import { Program, type ProgramAccount, type Provider } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { deriveInstallAddress, deriveXnftAddress, PROGRAM_ID } from "./addresses";
import {
  createCreateAssociatedXnftTransaction,
  createCreateInstallTransaction,
  createCreateReviewTransaction,
  createCreateXnftTransaction,
  createDeleteInstallTransaction,
  createDeleteReviewTransaction,
  createGrantAccessTransaction,
  createRevokeAccessTransaction,
  createSetCuratorTransaction,
  createSetSuspendedTransaction,
  createTransferTransaction,
  createUpdateXnftTransaction,
  createVerifyCuratorTransaction,
} from "./instructions";
import type {
  CreateAssociatedXnftOptions,
  CreateXnftAppOptions,
  IdlInstallAccount,
  IdlReviewAccount,
  IdlXnftAccount,
  UpdateXnftOptions,
  XnftAccount,
} from "./types";
import { getTokenAccountForMint } from "./util";
import { IDL, type Xnft } from "./xnft";

export class xNFT {
  #mpl: Metaplex;
  #program: Program<Xnft>;
  #provider: Provider;

  /**
   * Creates an instance of xNFT.
   * @param {Provider} provider
   * @memberof xNFT
   */
  constructor(provider: Provider) {
    if (!provider.publicKey || provider.publicKey.equals(PublicKey.default)) {
      throw new Error("no public key found on the argued provider");
    } else if (!provider.sendAndConfirm) {
      throw new Error("no sendAndConfirm function found on the argued provider");
    }

    this.#mpl = Metaplex.make(provider.connection);
    this.#program = new Program(IDL, PROGRAM_ID, provider);
    this.#provider = provider;
  }

  /**
   * Readonly accessor for the internal provider instance.
   * @readonly
   * @type {Provider}
   * @memberof xNFT
   */
  get provider(): Provider {
    return this.#provider;
  }

  /**
   * Create a digital collectible associated xNFT.
   * @param {PublicKey} metadata
   * @param {PublicKey} mint
   * @param {CreateAssociatedXnftOptions} opts
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async createAssociatedXnft(
    metadata: PublicKey,
    mint: PublicKey,
    opts: CreateAssociatedXnftOptions
  ): Promise<string> {
    const kindVariant = { [opts.kind]: {} } as never;
    const tx = await createCreateAssociatedXnftTransaction(
      this.#program,
      kindVariant,
      metadata,
      mint,
      {
        creators: opts.creators,
        curator: opts.curator ?? null,
        installAuthority: opts.installAuthority ?? null,
        installPrice: opts.installPrice,
        installVault: opts.installVault ?? this.#provider.publicKey!,
        sellerFeeBasisPoints: opts.sellerFeeBasisPoints ?? 0,
        supply: opts.supply ?? null,
        symbol: "",
        tag: { [opts.tag]: {} } as never,
        uri: opts.uri,
      }
    );
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Install an xNFT for the wallet on the provider.
   * @param {PublicKey} xnft
   * @param {PublicKey} installVault
   * @param {boolean} [permissioned]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async install(xnft: PublicKey, installVault: PublicKey, permissioned?: boolean): Promise<string> {
    const tx = await createCreateInstallTransaction(
      this.#program,
      xnft,
      installVault,
      permissioned
    );
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Create a standalone application xNFT.
   * @param {CreateXnftAppOptions} opts
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async createXnft(opts: CreateXnftAppOptions): Promise<string> {
    const tx = await createCreateXnftTransaction(this.#program, opts.name, {
      creators: opts.creators,
      curator: opts.curator ?? null,
      installAuthority: opts.installAuthority ?? null,
      installPrice: opts.installPrice,
      installVault: opts.installVault ?? this.#provider.publicKey!,
      sellerFeeBasisPoints: opts.sellerFeeBasisPoints ?? 0,
      supply: opts.supply ?? null,
      symbol: "",
      tag: { [opts.tag]: {} } as never,
      uri: opts.uri,
    });
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Delete a review for an xNFT that the provider wallet had created.
   * @param {PublicKey} review
   * @param {PublicKey} xnft
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async deleteReview(review: PublicKey, xnft: PublicKey, receiver?: PublicKey): Promise<string> {
    const tx = await createDeleteReviewTransaction(this.#program, review, xnft, receiver);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Get the data for the argued xNFT public key and its peripheral accounts.
   * @param {PublicKey} pubkey
   * @returns {Promise<XnftAccount>}
   * @memberof xNFT
   */
  async getAccount(pubkey: PublicKey): Promise<XnftAccount> {
    const account = (await this.#program.account.xnft.fetch(pubkey)) as unknown as IdlXnftAccount;
    const nft = await this.#mpl
      .nfts()
      .findByMint({ mintAddress: account.masterMint, loadJsonMetadata: true });

    const tokenAccount = await getTokenAccountForMint(
      this.#provider.connection,
      account.masterMint
    );

    return {
      data: account,
      json: nft.json,
      publicKey: pubkey,
      token: tokenAccount,
    };
  }

  /**
   * Get the installed xNFTs for the argued wallet public key.
   * @param {PublicKey} wallet
   * @returns {Promise<{ install: IdlInstallAccount; xnft: XnftAccount }[]>}
   * @memberof xNFT
   */
  async getInstallations(
    wallet: PublicKey
  ): Promise<{ install: IdlInstallAccount; xnft: XnftAccount }[]> {
    const installations = await this.#program.account.install.all([
      {
        memcmp: {
          offset: 8,
          bytes: wallet.toBase58(),
        },
      },
    ]);

    const items: { install: IdlInstallAccount; xnft: XnftAccount }[] = [];

    for await (const i of installations) {
      const xnft = await this.getAccount(i.account.xnft);
      items.push({
        install: i.account,
        xnft,
      });
    }

    return items;
  }

  /**
   * Get multiple xNFT program accounts and peripheral data based on the optionally
   * provided program account filters.
   * @param {GetProgramAccountsFilter[]} [filters]
   * @returns {Promise<XnftAccount[]>}
   * @memberof xNFT
   */
  async getMultipleAccounts(filters?: GetProgramAccountsFilter[]): Promise<XnftAccount[]> {
    const xnfts = (await this.#program.account.xnft.all(
      filters
    )) as unknown as ProgramAccount<IdlXnftAccount>[];

    const metadatas = (
      await this.#mpl.rpc().getMultipleAccounts(xnfts.map(x => x.account.masterMetadata))
    ).map(m => toMetadataAccount(m));

    const jsonBlobs = await Promise.all(
      metadatas.map(m => this.#mpl.storage().downloadJson(m.data.data.uri))
    );

    const tokenAccounts = await Promise.all(
      metadatas.map(m => getTokenAccountForMint(this.#provider.connection, m.data.mint))
    );

    const response: XnftAccount[] = [];
    for (let i = 0; i < xnfts.length; i++) {
      response.push({
        data: xnfts[i].account,
        json: jsonBlobs[i],
        publicKey: xnfts[i].publicKey,
        token: tokenAccounts[i],
      });
    }

    return response;
  }

  /**
   * Get all Review program accounts associated with the argued xNFT.
   * @param {PublicKey} xnft
   * @returns {Promise<ProgramAccount<IdlReviewAccount>[]>}
   * @memberof xNFT
   */
  async getReviews(xnft: PublicKey): Promise<ProgramAccount<IdlReviewAccount>[]> {
    return await this.#program.account.review.all([
      {
        memcmp: {
          offset: 40,
          bytes: xnft.toBase58(),
        },
      },
    ]);
  }

  /**
   * Grant access to the argued wallet for the xNFT that should be private
   * and being signed by the install authority.
   * @param {PublicKey} xnft
   * @param {PublicKey} wallet
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async grantAccess(xnft: PublicKey, wallet: PublicKey): Promise<string> {
    const tx = await createGrantAccessTransaction(this.#program, xnft, wallet);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Allows a wallet with an active installation of the argued xNFT
   * publish their review content to a program account and leave a
   * 0-5 rating.
   * @param {string} uri
   * @param {number} rating
   * @param {PublicKey} xnft
   * @param {PublicKey} masterToken
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async review(
    uri: string,
    rating: number,
    xnft: PublicKey,
    masterToken: PublicKey
  ): Promise<string> {
    const install = await deriveInstallAddress(this.#provider.publicKey!, xnft);
    const tx = await createCreateReviewTransaction(
      this.#program,
      uri,
      rating,
      install,
      masterToken,
      xnft
    );

    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Remove access from the private xNFT for the argued wallet. Signer of the
   * transaction must be the install authority.
   * @param {PublicKey} xnft
   * @param {PublicKey} wallet
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async revokeAccess(xnft: PublicKey, wallet: PublicKey): Promise<string> {
    const tx = await createRevokeAccessTransaction(this.#program, xnft, wallet);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Allows the authority of an xNFT to begin the curation assignment process.
   * @param {PublicKey} xnft
   * @param {PublicKey} masterToken
   * @param {PublicKey} curator
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async setCurator(xnft: PublicKey, masterToken: PublicKey, curator: PublicKey): Promise<string> {
    const tx = await createSetCuratorTransaction(this.#program, xnft, masterToken, curator);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Toggles the suspended field of the xNFT to the argued flag value.
   * @param {PublicKey} xnft
   * @param {PublicKey} masterToken
   * @param {boolean} value
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async setSuspended(xnft: PublicKey, masterToken: PublicKey, value: boolean): Promise<string> {
    const tx = await createSetSuspendedTransaction(this.#program, xnft, masterToken, value);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Transfers ownership and authority of the xNFT to the argued recipient.
   * @param {PublicKey} xnft
   * @param {PublicKey} masterMint
   * @param {PublicKey} recipient
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async transfer(xnft: PublicKey, masterMint: PublicKey, recipient: PublicKey): Promise<string> {
    const tx = await createTransferTransaction(this.#program, xnft, masterMint, recipient);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Attempts to update the xNFT's metadata with option signing requirements
   * from a curation entity. All values provided to the options parameter are
   * binding and should be populated with the previous values to be unchanged.
   * @param {PublicKey} masterMetadata
   * @param {PublicKey} masterMint
   * @param {UpdateXnftOptions} opts
   * @param {PublicKey} [curator]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async update(
    masterMetadata: PublicKey,
    masterMint: PublicKey,
    opts: UpdateXnftOptions,
    curator?: PublicKey
  ): Promise<string> {
    const xnft = await deriveXnftAddress(masterMint);
    const masterToken = await getAssociatedTokenAddress(masterMint, this.#provider.publicKey!);

    const tx = await createUpdateXnftTransaction(
      this.#program,
      {
        installAuthority: opts.installAuthority ?? null,
        installPrice: opts.installPrice,
        installVault: opts.installVault,
        supply: opts.supply ?? null,
        tag: { [opts.tag]: {} } as never,
        uri: opts.uri ?? null,
      },
      xnft,
      masterMetadata,
      masterToken,
      curator
    );

    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Delete and remove an installed xNFT from the provider wallet and return
   * the rent lamports to the wallet, or to the argued receiver public key
   * if one is provided.
   * @param {PublicKey} install
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async uninstall(install: PublicKey, receiver?: PublicKey): Promise<string> {
    const tx = await createDeleteInstallTransaction(this.#program, install, receiver);
    return await this.#provider.sendAndConfirm!(tx);
  }

  /**
   * Allows a curation authority to verify their assignment on an xNFT.
   * @param {PublicKey} xnft
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async verify(xnft: PublicKey): Promise<string> {
    const tx = await createVerifyCuratorTransaction(this.#program, xnft);
    return await this.#provider.sendAndConfirm!(tx);
  }
}
