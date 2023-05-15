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

import { BN, parseIdlErrors, Program, translateError, type ProgramAccount, type Provider } from "@coral-xyz/anchor";
import { Metaplex, type JsonMetadata, type Metadata } from "@metaplex-foundation/js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, Connection, type GetProgramAccountsFilter, Transaction } from "@solana/web3.js";
import { deriveInstallAddress, deriveXnftAddress, PROGRAM_ID } from "./addresses";
import {
  createCreateAppXnftTransaction,
  createCreateCollectibleXnftTransaction,
  createCreateInstallTransaction,
  createCreateReviewTransaction,
  createDeleteInstallTransaction,
  createDeleteReviewTransaction,
  createDeleteXnftTransaction,
  createDonateTransaction,
  createGrantAccessTransaction,
  createRevokeAccessTransaction,
  createSetCuratorTransaction,
  createSetCuratorVerificationTransaction,
  createSetSuspendedTransaction,
  createTransferTransaction,
  createUpdateXnftTransaction,
} from "./instructions";
import { getNftTokenAccountForMint } from "./tokens";
import type {
  CreateXnftAppOptions,
  CreateXnftCollectibleOptions,
  CustomJsonMetadata,
  IdlInstallAccount,
  IdlReviewAccount,
  IdlXnftAccount,
  UpdateXnftOptions,
  XnftAccount,
} from "./types";
import type { Kind } from "./schema";
import { buildAnonymousProvider, enumsEqual, gatewayUri } from "./util";
import { IDL, type Xnft } from "./xnft";

const idlErrors = parseIdlErrors(IDL);

export type ClientOptions = {
  gatewayReplacements?: Record<string, string>;
};

export class xNFT {
  #mpl: Metaplex;
  #program: Program<Xnft>;
  #provider: Provider;
  #gatewayReplacements: Record<string, string>;

  /**
   * Creates an instance of xNFT.
   * @param {Provider} provider
   * @param {ClientOptions} [options]
   * @memberof xNFT
   */
  constructor(provider: Provider, options?: ClientOptions) {
    if (!provider.publicKey) {
      throw new Error("no public key found on the argued provider");
    } else if (!provider.sendAndConfirm) {
      throw new Error("no sendAndConfirm function found on the argued provider");
    }

    const defaultReplacements = {
      "ar://": "https://arweave.net/",
      "ipfs://": "https://nftstorage.link/ipfs/",
    };

    this.#mpl = Metaplex.make(provider.connection);
    this.#program = new Program(IDL, PROGRAM_ID, provider);
    this.#provider = provider;
    this.#gatewayReplacements = {
      ...defaultReplacements,
      ...(options?.gatewayReplacements ?? {}),
    };
  }

  /**
   * Create an instance of the client without a full provider.
   * @static
   * @param {Connection} connection
   * @param {ClientOptions} [options]
   * @returns {xNFT}
   * @memberof xNFT
   */
  static anonymous(connection: Connection, options?: ClientOptions): xNFT {
    return new xNFT(buildAnonymousProvider(connection), options);
  }

  /**
   * Readonly accessor for the internal Metaplex SDK instance.
   * @readonly
   * @type {Metaplex}
   * @memberof xNFT
   */
  get metaplex(): Metaplex {
    return this.#mpl;
  }

  /**
   * Readonly access for the internal program instance.
   * @readonly
   * @type {Program<Xnft>}
   * @memberof xNFT
   */
  get program(): Program<Xnft> {
    return this.#program;
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
   * Create a standalone application xNFT.
   * @param {CreateXnftAppOptions} opts
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async createAppXnft(opts: CreateXnftAppOptions): Promise<string> {
    const tx = await createCreateAppXnftTransaction(this.#program, opts.name, {
      creators: opts.creators,
      curator: opts.curator ?? null,
      installAuthority: opts.installAuthority ?? null,
      installPrice: opts.installPrice ?? new BN(0),
      installVault: opts.installVault ?? this.#provider.publicKey!,
      sellerFeeBasisPoints: opts.sellerFeeBasisPoints ?? 0,
      supply: opts.supply ?? null,
      symbol: "",
      tag: { [opts.tag]: {} } as never,
      uri: opts.uri,
    });
    return this._withParsedTransactionError(tx);
  }

  /**
   * Create a digital collectible associated xNFT.
   * @param {CreateXnftCollectibleOptions} opts
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async createCollectibleXnft(opts: CreateXnftCollectibleOptions): Promise<string> {
    const tx = await createCreateCollectibleXnftTransaction(this.#program, opts.metadata, opts.mint, {
      creators: [],
      curator: null,
      installAuthority: null,
      installPrice: new BN(0),
      installVault: this.#provider.publicKey!,
      sellerFeeBasisPoints: 0,
      supply: null,
      symbol: "",
      tag: { [opts.tag]: {} } as never,
      uri: opts.uri,
    });
    return this._withParsedTransactionError(tx);
  }

  /**
   * Delete a review for an xNFT that the provider wallet had created.
   * @param {PublicKey} review
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async deleteReview(review: PublicKey, receiver?: PublicKey): Promise<string> {
    const tx = await createDeleteReviewTransaction(this.#program, review, receiver);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Delete an xNFT program account and burn the underlying SPL token or NFT, if it was an app.
   * @param {PublicKey} xnft
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async deleteXnft(xnft: PublicKey, receiver?: PublicKey): Promise<string> {
    const acc = await this.#program.account.xnft.fetchNullable(xnft);
    if (!acc) {
      throw new Error(`no xnft account found for ${xnft}`);
    }

    const masterToken = getAssociatedTokenAddressSync(acc.masterMint, this.#provider.publicKey!);
    const tx = await createDeleteXnftTransaction(
      this.#program,
      xnft,
      acc.masterMetadata,
      masterToken,
      acc.masterMint,
      receiver
    );
    return this._withParsedTransactionError(tx);
  }

  /**
   * Donate lamports to be shared by the creators of the argued xNFT.
   * @param {PublicKey} xnft
   * @param {BN} amount
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async donate(xnft: PublicKey, amount: BN): Promise<string> {
    const acc = await this.#program.account.xnft.fetchNullable(xnft);
    if (!acc) {
      throw new Error(`no xnft account found for ${xnft}`);
    }

    const metadata = await this.#mpl.nfts().findByMetadata({ metadata: acc.masterMetadata, loadJsonMetadata: false });
    const tx = await createDonateTransaction(this.#program, xnft, acc.masterMetadata, metadata.creators, amount);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Get the data for the argued xNFT public key and its peripheral accounts.
   * @param {PublicKey} publicKey
   * @returns {Promise<XnftAccount>}
   * @memberof xNFT
   */
  async getAccount(publicKey: PublicKey): Promise<XnftAccount> {
    const account = (await this.#program.account.xnft.fetch(publicKey)) as IdlXnftAccount;

    const [tokenAccount, xnftBlob, metadatas] = await Promise.all([
      getNftTokenAccountForMint(this.#provider.connection, account.masterMint),
      this.#mpl
        .storage()
        .downloadJson(gatewayUri(this.#gatewayReplacements, account.uri)) as Promise<CustomJsonMetadata>,
      this.#mpl.nfts().findAllByMintList({ mints: [account.masterMint] }) as Promise<Metadata[]>,
    ]);

    const md = metadatas[0];
    let mplBlob: JsonMetadata<string> = {};

    if (!enumsEqual(account.kind, "app")) {
      mplBlob = await this.#mpl.storage().downloadJson(gatewayUri(this.#gatewayReplacements, md.uri));
    }

    return {
      data: account,
      metadata: {
        ...md,
        json: {
          ...xnftBlob,
          ...mplBlob,
        },
      },
      publicKey,
      token: {
        address: tokenAccount.publicKey,
        owner: tokenAccount.account.owner,
      },
    };
  }

  /**
   * Gets all of the xNFT accounts and their data for the argued owner public key.
   * @param {PublicKey} owner
   * @returns {Promise<XnftAccount[]>}
   * @memberof xNFT
   */
  async getAccountsByOwner(owner: PublicKey): Promise<XnftAccount[]> {
    const metadatas = (await this.#mpl.nfts().findAllByOwner({ owner })) as Metadata[];

    // Early empty return if no metadata accounts were found for the owner
    if (metadatas.length === 0) {
      return [];
    }

    const possibleXnftPdas = metadatas.map(m => deriveXnftAddress(m.mintAddress));
    const possibleXnftAddresses = possibleXnftPdas.map(a => a[0]);
    const results = (await this.#program.account.xnft.fetchMultiple(
      possibleXnftAddresses
    )) as (IdlXnftAccount | null)[];

    // Early empty return if all possible xNFT addresses fetched were null
    if (results.every(r => !r)) {
      return [];
    }

    const validXnfts = results.reduce<{ account: IdlXnftAccount; metadata: Metadata; publicKey: PublicKey }[]>(
      (acc, curr, idx) => {
        if (curr) {
          return [...acc, { account: curr, metadata: metadatas[idx], publicKey: possibleXnftAddresses[idx] }];
        }
        return acc;
      },
      []
    );

    const xnftBlobs = await Promise.all(
      validXnfts.map(
        x =>
          this.#mpl
            .storage()
            .downloadJson(gatewayUri(this.#gatewayReplacements, x.account.uri)) as Promise<CustomJsonMetadata>
      )
    );

    const mplBlobs = await Promise.all(
      validXnfts.map(x =>
        enumsEqual(x.account.kind, "app")
          ? Promise.resolve({})
          : (this.#mpl.storage().downloadJson(gatewayUri(this.#gatewayReplacements, x.metadata.uri)) as Promise<
              JsonMetadata<string>
            >)
      )
    );

    const tokenAccounts = validXnfts.map(x => getAssociatedTokenAddressSync(x.account.masterMint, owner));

    const owned: XnftAccount[] = [];
    validXnfts.forEach((x, idx) => {
      owned.push({
        data: x.account,
        metadata: {
          ...x.metadata,
          json: {
            ...xnftBlobs[idx],
            ...mplBlobs[idx],
          },
        },
        publicKey: x.publicKey,
        token: {
          address: tokenAccounts[idx],
          owner,
        },
      });
    });

    return owned;
  }

  /**
   * Get the installed xNFTs for the argued wallet public key.
   * @param {PublicKey} wallet
   * @returns {Promise<{ install: IdlInstallAccount; xnft: XnftAccount }[]>}
   * @memberof xNFT
   */
  async getInstallations(wallet: PublicKey): Promise<{ install: IdlInstallAccount; xnft: XnftAccount }[]> {
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
   * @param {Kind | null} [kind]
   * @param {GetProgramAccountsFilter[]} [filters]
   * @returns {Promise<XnftAccount[]>}
   * @memberof xNFT
   */
  async getMultipleAccountsByFilter(kind?: Kind | null, filters?: GetProgramAccountsFilter[]): Promise<XnftAccount[]> {
    const xnfts = (await this.#program.account.xnft.all(filters)) as ProgramAccount<IdlXnftAccount>[];
    const filteredXnfts = kind ? xnfts.filter(x => enumsEqual(x.account.kind, kind)) : xnfts;
    const metadatas = (await this.#mpl
      .nfts()
      .findAllByMintList({ mints: filteredXnfts.map(x => x.account.masterMint) })) as Metadata[];

    const xnftBlobs = await Promise.all(
      filteredXnfts.map(
        x =>
          this.#mpl
            .storage()
            .downloadJson(gatewayUri(this.#gatewayReplacements, x.account.uri)) as Promise<CustomJsonMetadata>
      )
    );

    const mplBlobs = await Promise.all(
      filteredXnfts.map((acc, idx) =>
        enumsEqual(acc.account.kind, "app")
          ? Promise.resolve({})
          : (this.#mpl.storage().downloadJson(gatewayUri(this.#gatewayReplacements, metadatas[idx].uri)) as Promise<
              JsonMetadata<string>
            >)
      )
    );

    const tokenAccounts = await Promise.all(
      metadatas.map(m => getNftTokenAccountForMint(this.#provider.connection, m.mintAddress))
    );

    const response: XnftAccount[] = [];
    filteredXnfts.forEach((acc, idx) => {
      response.push({
        data: acc.account,
        metadata: {
          ...metadatas[idx],
          json: {
            ...xnftBlobs[idx],
            ...mplBlobs[idx],
          },
        },
        publicKey: acc.publicKey,
        token: {
          address: tokenAccounts[idx].publicKey,
          owner: tokenAccounts[idx].account.owner,
        },
      });
    });

    return response;
  }

  /**
   * Get multiple xNFT program accounts and peripheral data by a public keys list.
   * @param {PublicKey[]} pubkeys
   * @returns {Promise<XnftAccount[]>}
   * @memberof xNFT
   */
  async getMultipleAccountsByPublicKeys(pubkeys: PublicKey[]): Promise<XnftAccount[]> {
    const xnfts = await this.#program.account.xnft.fetchMultiple(pubkeys);
    const filteredXnfts = xnfts
      .map((x, i) => (x ? { publicKey: pubkeys[i], account: x } : null))
      .filter(x => x) as ProgramAccount<IdlXnftAccount>[];

    const metadatas = (await this.#mpl
      .nfts()
      .findAllByMintList({ mints: filteredXnfts.map(x => x.account.masterMint) })) as Metadata[];

    const xnftBlobs = await Promise.all(
      filteredXnfts.map(
        x =>
          this.#mpl
            .storage()
            .downloadJson(gatewayUri(this.#gatewayReplacements, x.account.uri)) as Promise<CustomJsonMetadata>
      )
    );

    const mplBlobs = await Promise.all(
      filteredXnfts.map((acc, idx) =>
        enumsEqual(acc.account.kind, "app")
          ? Promise.resolve({})
          : (this.#mpl.storage().downloadJson(gatewayUri(this.#gatewayReplacements, metadatas[idx].uri)) as Promise<
              JsonMetadata<string>
            >)
      )
    );

    const tokenAccounts = await Promise.all(
      metadatas.map(m => getNftTokenAccountForMint(this.#provider.connection, m.mintAddress))
    );

    const response: XnftAccount[] = [];
    filteredXnfts.forEach((acc, idx) => {
      response.push({
        data: acc.account,
        metadata: {
          ...metadatas[idx],
          json: {
            ...xnftBlobs[idx],
            ...mplBlobs[idx],
          },
        },
        publicKey: acc.publicKey,
        token: {
          address: tokenAccounts[idx].publicKey,
          owner: tokenAccounts[idx].account.owner,
        },
      });
    });

    return response;
  }

  /**
   * Get all Review program accounts associated with the argued xNFT.
   * @param {PublicKey} xnft
   * @returns {Promise<ProgramAccount<IdlReviewAccount>[]>}
   * @memberof xNFT
   */
  async getReviews(xnft: PublicKey): Promise<ProgramAccount<IdlReviewAccount>[]> {
    return this.#program.account.review.all([
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
    return this._withParsedTransactionError(tx);
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
    const tx = await createCreateInstallTransaction(this.#program, xnft, installVault, permissioned);
    return this._withParsedTransactionError(tx);
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
  async review(uri: string, rating: number, xnft: PublicKey, masterToken: PublicKey): Promise<string> {
    const [install] = deriveInstallAddress(this.#provider.publicKey!, xnft);
    const tx = await createCreateReviewTransaction(this.#program, uri, rating, install, masterToken, xnft);
    return this._withParsedTransactionError(tx);
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
    return this._withParsedTransactionError(tx);
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
    return this._withParsedTransactionError(tx);
  }

  /**
   * Toggles the suspended field of the xNFT to the argued flag value.
   * @param {PublicKey} xnft
   * @param {PublicKey} masterMint
   * @param {boolean} value
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async setSuspended(xnft: PublicKey, masterMint: PublicKey, value: boolean): Promise<string> {
    const masterToken = getAssociatedTokenAddressSync(masterMint, this.#provider.publicKey!);
    const tx = await createSetSuspendedTransaction(this.#program, xnft, masterToken, value);
    return this._withParsedTransactionError(tx);
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
    return this._withParsedTransactionError(tx);
  }

  /**
   * Attempts to update the xNFT's metadata with option signing requirements
   * from a curation entity. All values provided to the options parameter are
   * binding and should be populated with the previous values to be unchanged.
   * @param {PublicKey} masterMint
   * @param {UpdateXnftOptions} opts
   * @param {PublicKey} [curator]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async update(masterMint: PublicKey, opts: UpdateXnftOptions, curator?: PublicKey): Promise<string> {
    const [xnft] = deriveXnftAddress(masterMint);
    const masterToken = getAssociatedTokenAddressSync(masterMint, this.#provider.publicKey!);

    const tx = await createUpdateXnftTransaction(
      this.#program,
      {
        installAuthority: opts.installAuthority ?? null,
        installPrice: opts.installPrice ?? null,
        installVault: opts.installVault ?? null,
        name: opts.name ?? null,
        supply: opts.supply ?? null,
        tag: opts.tag ? ({ [opts.tag]: {} } as never) : null,
        uri: opts.uri ?? null,
      },
      xnft,
      masterToken,
      curator
    );

    return this._withParsedTransactionError(tx);
  }

  /**
   * Delete and remove an installed xNFT from the provider wallet and return
   * the rent lamports to the wallet, or to the argued receiver public key
   * if one is provided.
   * @param {PublicKey} xnft
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async uninstall(xnft: PublicKey, receiver?: PublicKey): Promise<string> {
    const tx = await createDeleteInstallTransaction(this.#program, xnft, receiver);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Allows a curation authority to verify their assignment on an xNFT.
   * @param {PublicKey} xnft
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async unverify(xnft: PublicKey): Promise<string> {
    const tx = await createSetCuratorVerificationTransaction(this.#program, xnft, false);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Allows a curation authority to verify their assignment on an xNFT.
   * @param {PublicKey} xnft
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  async verify(xnft: PublicKey): Promise<string> {
    const tx = await createSetCuratorVerificationTransaction(this.#program, xnft, true);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Utility function to wrap a transaction execution and parse
   * the resulting logs for any errors.
   * @private
   * @param {Transaction} tx
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  private async _withParsedTransactionError(tx: Transaction): Promise<string> {
    try {
      return await this.#provider.sendAndConfirm!(tx);
    } catch (err) {
      throw translateError(err, idlErrors);
    }
  }
}
