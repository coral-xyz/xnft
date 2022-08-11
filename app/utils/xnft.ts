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
import fetch from 'isomorphic-unfetch';
import { IDL, type Xnft as IDLType } from '../programs/xnft';
import type { PublishState } from '../state/atoms/publish';
import type { Metadata } from './metadata';
import { BUCKET_URL, getMetadataPath } from './s3';

export const XNFT_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_XNFT_PROGRAMID);

export const XNFT_KIND_OPTIONS = IDL.types[1].type.variants.map(v => v.name);
export const XNFT_TAG_OPTIONS = IDL.types[2].type.variants.map(v => v.name);

export type XnftAccount = IdlAccounts<IDLType>['xnft2'];
export type InstallAccount = IdlAccounts<IDLType>['install'];

export type SerializedXnftWithMetadata = {
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
};

export type XnftWithMetadata = {
  account: XnftAccount;
  publicKey: PublicKey;
  metadataAccount: MplMetadata;
  metadata: Metadata;
};

export type UpdateParams = IdlTypes<IDLType>['UpdateParams'];

const anonymousProgram: Program<IDLType> = new Program(
  IDL,
  XNFT_PROGRAM_ID,
  new AnchorProvider(
    new Connection(process.env.NEXT_PUBLIC_CONNECTION),
    { publicKey: PublicKey.default, signTransaction: undefined, signAllTransactions: undefined },
    { commitment: 'confirmed', skipPreflight: true }
  )
);

export default abstract class xNFT {
  /**
   * Call the `create_xnft` instruction on the program to mint.
   * @static
   * @param {Program<IDLType>} program
   * @param {PublishState} details
   * @returns {Promise<PublicKey>}
   * @memberof xNFT
   */
  static async create(program: Program<IDLType>, details: PublishState): Promise<PublicKey> {
    const xnft = await deriveXnftAddress(details.title, new PublicKey(details.publisher));

    const uri = `${BUCKET_URL}/${getMetadataPath(xnft)}`;
    const sellerFeeBasis = parseFloat(details.royalties) * 100;
    const price = new BN(parseFloat(details.price) * LAMPORTS_PER_SOL);

    await program.methods
      .createXnft(
        details.title,
        '',
        { [details.tag.toLowerCase()]: {} },
        { [details.kind.toLowerCase()]: {} },
        uri,
        sellerFeeBasis,
        price,
        program.provider.publicKey!
      )
      .accounts({ metadataProgram: METADATA_PROGRAM_ID, xnft })
      .rpc();
    return xnft;
  }

  /**
   * Fetches a single xNFT program account by public key and its metadata.
   * @static
   * @param {PublicKey} pubkey
   * @returns {Promise<XnftWithMetadata>}
   * @memberof xNFT
   */
  static async get(pubkey: PublicKey): Promise<XnftWithMetadata> {
    const account = await anonymousProgram.account.xnft2.fetch(pubkey);
    return transformWithMetadata(pubkey, account as any);
  }

  /**
   * Fetches all xNFT program accounts with their metadata.
   * @static
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getAll(): Promise<XnftWithMetadata[]> {
    const xnfts = await anonymousProgram.account.xnft2.all();
    const response: XnftWithMetadata[] = [];

    for await (const x of xnfts) {
      try {
        const data = await transformWithMetadata(x.publicKey, x.account as any);
        response.push(data);
      } catch (error) {
        console.error(`failed to fetch metadata for ${x.publicKey.toBase58()}`, error);
      }
    }

    return response;
  }

  /**
   * Gets all xNFT program accounts that are installed by the argued
   * public key wallet and their metadata.
   * @static
   * @param {PublicKey} pubkey
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getInstalled(pubkey: PublicKey): Promise<XnftWithMetadata[]> {
    const response: ProgramAccount<InstallAccount>[] = await anonymousProgram.account.install.all([
      {
        memcmp: {
          offset: 8,
          bytes: pubkey.toBase58()
        }
      }
    ]);

    const installed: XnftWithMetadata[] = [];

    for await (const item of response) {
      const data = await xNFT.get(item.account.xnft);
      installed.push(data);
    }

    return installed;
  }

  /**
   * Gets all xNFT program accounts that are owned or published by the
   * argued public key and their metadata.
   * @static
   * @param {PublicKey} pubkey
   * @returns {Promise<XnftWithMetadata[]>}
   * @memberof xNFT
   */
  static async getOwned(pubkey: PublicKey): Promise<XnftWithMetadata[]> {
    const response: ProgramAccount<XnftAccount>[] = (await anonymousProgram.account.xnft2.all([
      {
        memcmp: {
          offset: 8,
          bytes: pubkey.toBase58()
        }
      }
    ])) as any;

    const owned: XnftWithMetadata[] = [];

    for await (const item of response) {
      const data = await transformWithMetadata(item.publicKey, item.account as any);
      owned.push(data);
    }

    return owned;
  }

  /**
   * Calls the `create_install` program instruction to create an xNFT
   * installation for the wallet assigned to the argued program's provider.
   * @static
   * @param {Program<IDLType>} program
   * @param {(XnftWithMetadata | SerializedXnftWithMetadata)} xnft
   * @memberof xNFT
   */
  static async install(
    program: Program<IDLType>,
    xnft: XnftWithMetadata | SerializedXnftWithMetadata
  ) {
    await program.methods
      .createInstall()
      .accounts({
        xnft: new PublicKey(xnft.publicKey),
        installVault: new PublicKey(xnft.account.installVault)
      })
      .rpc();
  }

  /**
   * Returns the select option valid name for the argued tag enum object.
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
   * Calls the `update_xnft` program instruction to allow users to mutate
   * the properties and metadata of their xNFTs.
   * @static
   * @param {Program<IDLType>} program
   * @param {PublicKey} xnft
   * @param {PublicKey} metadata
   * @param {UpdateParams} params
   * @memberof xNFT
   */
  static async update(
    program: Program<IDLType>,
    xnft: PublicKey,
    metadata: PublicKey,
    params: UpdateParams
  ) {
    await program.methods
      .updateXnft(params)
      .accounts({ xnft, masterMetadata: metadata, metadataProgram: METADATA_PROGRAM_ID })
      .rpc();
  }
}

async function transformWithMetadata(
  publicKey: PublicKey,
  xnft: XnftAccount
): Promise<XnftWithMetadata> {
  const metadataAccount = await MplMetadata.fromAccountAddress(
    anonymousProgram.provider.connection,
    xnft.masterMetadata
  );

  const res = await fetch(metadataAccount.data.uri, {
    timeout: 3000
  } as RequestInit);
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
