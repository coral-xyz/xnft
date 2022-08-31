import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  AnchorProvider,
  BN,
  Program,
  type ProgramAccount,
  type IdlAccounts,
  type IdlTypes
} from '@project-serum/anchor';
import {
  Metadata as MplMetadata,
  PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { IDL, type Xnft } from '../programs/xnft';
import type { PublishState } from '../state/atoms/publish';
import type { Metadata } from './metadata';
import { XNFT_KIND_OPTIONS, XNFT_PROGRAM_ID, XNFT_TAG_OPTIONS } from './constants';
import fetch from './fetch';
import type { StorageBackend } from './storage';
import { deriveInstallAddress } from './pubkeys';

export type XnftAccount = IdlAccounts<Xnft>['xnft'];
export type InstallAccount = IdlAccounts<Xnft>['install'];
export type ReviewAccount = IdlAccounts<Xnft>['review'];
export type UpdateParams = IdlTypes<Xnft>['UpdateParams'];

export interface SerializedXnftWithMetadata {
  account: {
    [K in keyof XnftAccount]: XnftAccount[K] extends never
      ? never
      : XnftAccount[K] extends PublicKey | BN
      ? string
      : XnftAccount[K];
  };
  publicKey: string;
  metadataAccount: {
    [K in keyof MplMetadata]: MplMetadata[K] extends PublicKey ? string : MplMetadata[K];
  };
  metadata: Metadata;
}

export interface XnftWithMetadata {
  account: XnftAccount;
  publicKey: PublicKey;
  metadataAccount: MplMetadata;
  metadata: Metadata;
}

export interface InstalledXnftWithMetadata {
  install: ProgramAccount<InstallAccount>;
  xnft: XnftWithMetadata;
}

const anonymousProgram: Program<Xnft> = new Program(
  IDL,
  XNFT_PROGRAM_ID,
  new AnchorProvider(
    new Connection(process.env.NEXT_PUBLIC_CONNECTION, 'confirmed'),
    { publicKey: PublicKey.default, signTransaction: undefined, signAllTransactions: undefined },
    { commitment: 'confirmed', skipPreflight: true }
  )
);

export default abstract class xNFT {
  /**
   * Creates the `create_xnft` instruction on the program to mint.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} xnft
   * @param {string} metadataUri
   * @param {PublishState} details
   * @param {boolean} [retry]
   * @returns {Promise<string | null>}
   * @memberof xNFT
   */
  static async create(
    program: Program<Xnft>,
    xnft: PublicKey,
    metadataUri: string,
    details: PublishState,
    retry?: boolean
  ): Promise<string | null> {
    // If the xNFT account already exists, skip the instruction call. This is mainly
    // for the purpose of the retry publish flow in order to skip duplicate transactions
    // that could ultimately lead to cyclical failures.
    const exists = (await program.provider.connection.getAccountInfo(xnft)) !== null;
    if (exists) {
      if (retry) {
        return null;
      }

      throw new Error(`You've already published an xNFT with the name '${details.title}'`);
    }

    const sellerFeeBasis = details.royalties === '' ? 0 : parseFloat(details.royalties) * 100;
    const price = new BN(details.price === '' ? 0 : parseFloat(details.price) * LAMPORTS_PER_SOL);
    const vault = details.vault === '' ? program.provider.publicKey! : new PublicKey(details.vault);
    const supply = details.supply === 'inf' ? null : new BN(parseInt(details.supply));

    const tx = await program.methods
      .createXnft(
        details.title,
        '',
        { [details.tag.toLowerCase()]: {} },
        { [details.kind.toLowerCase()]: {} },
        metadataUri,
        sellerFeeBasis,
        price,
        vault,
        supply
      )
      .accounts({ metadataProgram: METADATA_PROGRAM_ID, xnft })
      .transaction();

    return await program.provider.sendAndConfirm(tx);
  }

  /**
   * Creates and sends the `delete_install` instruction on the program
   * to close an `Install` program account under the user's authority.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} install
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async delete(
    program: Program<Xnft>,
    install: PublicKey,
    receiver?: PublicKey
  ): Promise<string> {
    const tx = await program.methods
      .deleteInstall()
      .accounts({ install, receiver: receiver ?? program.provider.publicKey })
      .transaction();
    return await program.provider.sendAndConfirm(tx);
  }

  /**
   * Closes the argued Review program account for an xNFT.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} review
   * @param {PublicKey} xnft
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async deleteReview(
    program: Program<Xnft>,
    review: PublicKey,
    xnft: PublicKey,
    receiver?: PublicKey
  ): Promise<string> {
    // TODO: remove JSON file from backend storage
    const tx = await program.methods
      .deleteReview()
      .accounts({
        review,
        xnft,
        receiver: receiver ?? program.provider.publicKey
      })
      .transaction();
    return await program.provider.sendAndConfirm(tx);
  }

  /**
   * Fetches a single xNFT program account by public key and its metadata.
   * @static
   * @param {PublicKey} pubkey
   * @param {Program<Xnft>} [program=anonymousProgram]
   * @returns {Promise<XnftWithMetadata>}
   * @memberof xNFT
   */
  static async get(
    pubkey: PublicKey,
    program: Program<Xnft> = anonymousProgram
  ): Promise<XnftWithMetadata> {
    const account = await program.account.xnft.fetch(pubkey);
    return transformWithMetadata(program, pubkey, account as any);
  }

  /**
   * Fetches all xNFT program accounts with their metadata.
   * @static
   * @param {Program<Xnft>} [program=anonymousProgram]
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getAll(program: Program<Xnft> = anonymousProgram): Promise<XnftWithMetadata[]> {
    const xnfts = (await program.account.xnft.all()).filter(
      x => x.publicKey.toBase58() !== 'DLQ3eC9rB837Qk4ZYhApQ8og1Zz3rQP3rfZRtz3i9uUa'
    ); // FIXME:
    const response: XnftWithMetadata[] = [];

    for await (const x of xnfts) {
      try {
        const data = await transformWithMetadata(program, x.publicKey, x.account as any);
        response.push(data);
      } catch (error) {
        console.error(`failed to fetch metadata for ${x.publicKey.toBase58()}`, error);
      }
    }

    return response;
  }

  /**
   * Gets the list of all xNFT program account public keys on the network.
   * @static
   * @param {Program<Xnft>} [program=anonymousProgram]
   * @returns {Promise<PublicKey[]>}
   * @memberof xNFT
   */
  static async getAllPublicKeys(program: Program<Xnft> = anonymousProgram): Promise<PublicKey[]> {
    const accs = (await program.account.xnft.all()).filter(
      x => x.publicKey.toBase58() !== 'DLQ3eC9rB837Qk4ZYhApQ8og1Zz3rQP3rfZRtz3i9uUa'
    ); // FIXME:
    return accs.map(a => a.publicKey);
  }

  /**
   * Gets all xNFT program accounts that are installed by the argued
   * public key wallet and their metadata.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} pubkey
   * @returns {Promise<InstalledXnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getInstalled(
    program: Program<Xnft>,
    pubkey: PublicKey
  ): Promise<InstalledXnftWithMetadata[]> {
    const response: ProgramAccount<InstallAccount>[] = await program.account.install.all([
      {
        memcmp: {
          offset: 8,
          bytes: pubkey.toBase58()
        }
      }
    ]);

    const installed: InstalledXnftWithMetadata[] = [];

    for await (const item of response) {
      const data = await xNFT.get(item.account.xnft, program);
      installed.push({ install: item, xnft: data });
    }

    return installed;
  }

  /**
   * Gets all xNFT program accounts that are owned or published by the
   * argued public key and their metadata.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} pubkey
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getOwned(program: Program<Xnft>, pubkey: PublicKey): Promise<XnftWithMetadata[]> {
    const response: ProgramAccount<XnftAccount>[] = (await program.account.xnft.all([
      {
        memcmp: {
          offset: 8,
          bytes: pubkey.toBase58()
        }
      }
    ])) as any;

    const owned: XnftWithMetadata[] = [];

    for await (const item of response) {
      const data = await transformWithMetadata(program, item.publicKey, item.account as any);
      owned.push(data);
    }

    return owned;
  }

  /**
   * Fetch all Review program accounts for a given xNFT public key.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} pubkey
   * @returns {Promise<ProgramAccount<ReviewAccount>[]>}
   * @memberof xNFT
   */
  static async getReviews(
    program: Program<Xnft>,
    pubkey: PublicKey
  ): Promise<ProgramAccount<ReviewAccount>[]> {
    return await program.account.review.all([
      {
        memcmp: {
          offset: 8 + 32,
          bytes: pubkey.toBase58()
        }
      }
    ]);
  }

  /**
   * Creates the `create_install` program instruction to create an xNFT
   * installation for the wallet assigned to the argued program's provider.
   * @static
   * @param {Program<Xnft>} program
   * @param {(XnftWithMetadata | SerializedXnftWithMetadata)} xnft
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async install(
    program: Program<Xnft>,
    xnft: XnftWithMetadata | SerializedXnftWithMetadata
  ): Promise<string> {
    const tx = await program.methods
      .createInstall()
      .accounts({
        xnft: new PublicKey(xnft.publicKey),
        installVault: new PublicKey(xnft.account.installVault)
      })
      .transaction();

    return await program.provider.sendAndConfirm(tx);
  }

  /**
   * Returns the selection option valid name for the argued kind enum variant.
   * @static
   * @param {Partial<{ [K: string]: {} }>} t
   * @returns {string}
   * @memberof xNFT
   */
  static kindName(t: Partial<{ [K: string]: {} }>): string {
    for (const o of XNFT_KIND_OPTIONS) {
      if (Object.hasOwn(t, o.toLowerCase())) {
        return o;
      }
    }
  }

  /**
   * Finds the user's active installation of the argued xNFT, throwing an error
   * if one cannot be found, and creates a `Review` program account with the
   * argued rating value and comment URI.
   * @static
   * @param {Program<Xnft>} program
   * @param {StorageBackend} storage
   * @param {PublicKey} xnft
   * @param {string} comment
   * @param {number} rating
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async review(
    program: Program<Xnft>,
    storage: StorageBackend,
    xnft: PublicKey,
    comment: string,
    rating: number
  ): Promise<string> {
    const install = await deriveInstallAddress(program.provider.publicKey, xnft);
    const exists = (await program.provider.connection.getAccountInfo(install)) !== null;
    if (!exists) {
      throw new Error('Must have an active installation to review an xNFT');
    }

    const uri = await storage.uploadComment(program.provider.publicKey, comment);

    const tx = await program.methods
      .createReview(uri, rating)
      .accounts({
        install,
        xnft
      })
      .transaction();

    return await program.provider.sendAndConfirm(tx);
  }

  /**
   * Creates the `set_suspended` contract instruction for the argued
   * xNFT public key and the provided value for the flag.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} xnft
   * @param {boolean} flag
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async setSuspended(
    program: Program<Xnft>,
    xnft: PublicKey,
    flag: boolean
  ): Promise<string> {
    const tx = await program.methods.setSuspended(flag).accounts({ xnft }).transaction();
    return await program.provider.sendAndConfirm(tx);
  }

  /**
   * Returns the select option valid name for the argued tag enum variant.
   * @static
   * @param {Partial<{ [T: string]: {} }>} t
   * @returns {string}
   * @memberof xNFT
   */
  static tagName(t: Partial<{ [T: string]: {} }>): string {
    for (const o of XNFT_TAG_OPTIONS) {
      if (Object.hasOwn(t, o.toLowerCase())) {
        return o;
      }
    }
  }

  /**
   * Creates the `update_xnft` program instruction to allow users to mutate
   * the properties and metadata of their xNFTs.
   * @static
   * @param {Program<Xnft>} program
   * @param {PublicKey} xnft
   * @param {PublicKey} metadata
   * @param {UpdateParams} params
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async update(
    program: Program<Xnft>,
    xnft: PublicKey,
    metadata: PublicKey,
    params: UpdateParams
  ): Promise<string> {
    const tx = await program.methods
      .updateXnft(params)
      .accounts({ xnft, masterMetadata: metadata, metadataProgram: METADATA_PROGRAM_ID })
      .transaction();

    return await program.provider.sendAndConfirm(tx);
  }
}

/**
 * Fetches and appends the appropriate metadata objects to
 * the provided xNFT account and public key.
 * @param {Program<Xnft>} program
 * @param {PublicKey} publicKey
 * @param {XnftAccount} xnft
 * @returns {Promise<XnftWithMetadata>}
 */
async function transformWithMetadata(
  program: Program<Xnft>,
  publicKey: PublicKey,
  xnft: XnftAccount
): Promise<XnftWithMetadata> {
  const metadataAccount = await MplMetadata.fromAccountAddress(
    program.provider.connection,
    xnft.masterMetadata
  );

  const res = await fetch(
    metadataAccount.data.uri.replace('ipfs://', 'https://nftstorage.link/ipfs/'),
    {
      headers: {
        'Cache-Control': 'public,max-age=30'
      }
    },
    5000
  );
  const metadata: Metadata = await res.json();

  return {
    publicKey,
    account: xnft,
    metadataAccount,
    metadata
  };
}
