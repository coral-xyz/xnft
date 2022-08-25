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
import { IDL, type Xnft as IDLType } from '../programs/xnft';
import type { PublishState } from '../state/atoms/publish';
import type { Metadata } from './metadata';
import { getMetadataPath } from './api';
import { S3_BUCKET_URL, XNFT_KIND_OPTIONS, XNFT_PROGRAM_ID, XNFT_TAG_OPTIONS } from './constants';
import fetch from './fetch';

export type XnftAccount = IdlAccounts<IDLType>['xnft'];
export type InstallAccount = IdlAccounts<IDLType>['install'];
export type UpdateParams = IdlTypes<IDLType>['UpdateParams'];

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

const anonymousProgram: Program<IDLType> = new Program(
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
   * @param {Program<IDLType>} program
   * @param {PublishState} details
   * @param {boolean} [retry]
   * @returns {Promise<[string | null, PublicKey]>}
   * @memberof xNFT
   */
  static async create(
    program: Program<IDLType>,
    details: PublishState,
    retry?: boolean
  ): Promise<[string | null, PublicKey]> {
    const xnft = await deriveXnftAddress(details.title, new PublicKey(details.publisher));

    // If the xNFT account already exists, skip the instruction call. This is mainly
    // for the purpose of the retry publish flow in order to skip duplicate transactions
    // that could ultimately lead to cyclical failures.
    const exists = (await program.provider.connection.getAccountInfo(xnft)) !== null;
    if (exists) {
      if (retry) {
        return [null, xnft];
      }

      throw new Error(`You've already published an xNFT with the name '${details.title}'`);
    }

    const uri = `${S3_BUCKET_URL}/${getMetadataPath(xnft)}`;
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
        uri,
        sellerFeeBasis,
        price,
        vault,
        supply
      )
      .accounts({ metadataProgram: METADATA_PROGRAM_ID, xnft })
      .transaction();

    const sig = await program.provider.sendAndConfirm(tx);

    return [sig, xnft];
  }

  /**
   * Creates and sends the `delete_install` instruction on the program
   * to close an `Install` program account under the user's authority.
   * @static
   * @param {Program<IDLType>} program
   * @param {PublicKey} install
   * @param {PublicKey} [receiver]
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async delete(
    program: Program<IDLType>,
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
   * Fetches a single xNFT program account by public key and its metadata.
   * @static
   * @param {PublicKey} pubkey
   * @param {Program<IDLType>} [program=anonymousProgram]
   * @returns {Promise<XnftWithMetadata>}
   * @memberof xNFT
   */
  static async get(
    pubkey: PublicKey,
    program: Program<IDLType> = anonymousProgram
  ): Promise<XnftWithMetadata> {
    const account = await program.account.xnft.fetch(pubkey);
    return transformWithMetadata(program, pubkey, account as any);
  }

  /**
   * Fetches all xNFT program accounts with their metadata.
   * @static
   * @param {Program<IDLType>} [program=anonymousProgram]
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getAll(program: Program<IDLType> = anonymousProgram): Promise<XnftWithMetadata[]> {
    const xnfts = await program.account.xnft.all();
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
   * @param {Program<IDLType>} [program=anonymousProgram]
   * @returns {Promise<PublicKey[]>}
   * @memberof xNFT
   */
  static async getAllPublicKeys(
    program: Program<IDLType> = anonymousProgram
  ): Promise<PublicKey[]> {
    const accs = await program.account.xnft.all();
    return accs.map(a => a.publicKey);
  }

  /**
   * Gets all xNFT program accounts that are installed by the argued
   * public key wallet and their metadata.
   * @static
   * @param {Program<IDLType>} program
   * @param {PublicKey} pubkey
   * @returns {Promise<InstalledXnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getInstalled(
    program: Program<IDLType>,
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
   * @param {Program<IDLType>} program
   * @param {PublicKey} pubkey
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getOwned(program: Program<IDLType>, pubkey: PublicKey): Promise<XnftWithMetadata[]> {
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
   * Creates the `create_install` program instruction to create an xNFT
   * installation for the wallet assigned to the argued program's provider.
   * @static
   * @param {Program<IDLType>} program
   * @param {(XnftWithMetadata | SerializedXnftWithMetadata)} xnft
   * @returns {Promise<string>>}
   * @memberof xNFT
   */
  static async install(
    program: Program<IDLType>,
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
   * Creates the `set_suspended` contract instruction for the argued
   * xNFT public key and the provided value for the flag.
   * @static
   * @param {Program<IDLType>} program
   * @param {PublicKey} xnft
   * @param {boolean} flag
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async setSuspended(
    program: Program<IDLType>,
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
   * @param {Program<IDLType>} program
   * @param {PublicKey} xnft
   * @param {PublicKey} metadata
   * @param {UpdateParams} params
   * @returns {Promise<string>}
   * @memberof xNFT
   */
  static async update(
    program: Program<IDLType>,
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
 * @param {Program<IDLType>} program
 * @param {PublicKey} publicKey
 * @param {XnftAccount} xnft
 * @returns {Promise<XnftWithMetadata>}
 */
async function transformWithMetadata(
  program: Program<IDLType>,
  publicKey: PublicKey,
  xnft: XnftAccount
): Promise<XnftWithMetadata> {
  const metadataAccount = await MplMetadata.fromAccountAddress(
    program.provider.connection,
    xnft.masterMetadata
  );

  const res = await fetch(
    metadataAccount.data.uri,
    {
      headers: {
        'Cache-Control': 'public,max-age=30'
      }
    },
    5000
  );
  const metadata = await res.json();

  return {
    publicKey,
    account: xnft,
    metadataAccount,
    metadata
  };
}

/**
 * Derive the PDA of the associated xNFT program account.
 * @param {string} name
 * @param {PublicKey} publisher
 * @returns {Promise<PublicKey>}
 */
async function deriveXnftAddress(name: string, publisher: PublicKey): Promise<PublicKey> {
  // Mint PDA Address
  const [masterMint] = await PublicKey.findProgramAddress(
    [Buffer.from('mint'), publisher.toBytes(), Buffer.from(name)],
    XNFT_PROGRAM_ID
  );

  // Master Edition PDA
  const [masterEditionPdaAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBytes(),
      masterMint.toBytes(),
      Buffer.from('edition')
    ],
    METADATA_PROGRAM_ID
  );

  // xnft PDA (needed to install)
  const [xnftPdaAddress] = await PublicKey.findProgramAddress(
    [Buffer.from('xnft'), masterEditionPdaAddress.toBytes()],
    XNFT_PROGRAM_ID
  );

  return xnftPdaAddress;
}
