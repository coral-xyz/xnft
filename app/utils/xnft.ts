import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN, Program, type IdlAccounts } from '@project-serum/anchor';
import {
  Metadata as MplMetadata,
  PROGRAM_ID as METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import fetch from 'isomorphic-unfetch';
import { IDL, type Xnft as IDLType } from '../programs/xnft';
import type { Metadata } from './metadata';
import type { UploadState } from '../state/atoms/publish';

export type Xnft = IdlAccounts<IDLType>['xnft2'];

export type SerializedXnftWithMetadata = {
  account: { [K in keyof Xnft]: Xnft[K] extends PublicKey | BN ? string : Xnft[K] };
  publicKey: string;
  metadataAccount: {
    [K in keyof MplMetadata]: MplMetadata[K] extends PublicKey ? string : MplMetadata[K];
  };
  metadata: Metadata;
};

export type XnftWithMetadata = {
  account: Xnft;
  publicKey: PublicKey;
  metadataAccount: MplMetadata;
  metadata: Metadata;
};

export const XNFT_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_XNFT_PROGRAMID);

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
  static async create(program: Program<IDLType>, details: UploadState) {
    await program.methods
      .createXnft(
        details.title,
        details.title.slice(0, 3).toUpperCase(),
        '',
        1,
        new BN(details.price),
        program.provider.publicKey!
      )
      .accounts({ metadataProgram: METADATA_PROGRAM_ID })
      .rpc();
  }

  static async get(pubkey: PublicKey): Promise<XnftWithMetadata> {
    const account = await anonymousProgram.account.xnft2.fetch(pubkey);

    const metadataAccount = await MplMetadata.fromAccountAddress(
      anonymousProgram.provider.connection,
      account.masterMetadata
    );

    const res = await fetch(metadataAccount.data.uri, { timeout: 3000 } as RequestInit);
    const metadata = await res.json();

    return {
      account: account as any,
      publicKey: pubkey,
      metadataAccount,
      metadata
    };
  }

  static async getAll(): Promise<XnftWithMetadata[]> {
    const xnfts = await anonymousProgram.account.xnft2.all();

    const response: XnftWithMetadata[] = [];
    for await (const x of xnfts) {
      try {
        const metadataAccount = await MplMetadata.fromAccountAddress(
          anonymousProgram.provider.connection,
          x.account.masterMetadata
        );

        const res = await fetch(metadataAccount.data.uri, { timeout: 3000 } as RequestInit);
        const metadata = await res.json();

        response.push({
          account: x.account as any,
          publicKey: x.publicKey,
          metadataAccount,
          metadata
        });
      } catch (error) {
        console.error(`failed to fetch metadata for ${x.publicKey.toBase58()}`, error);
      }
    }

    return response;
  }

  static async getInstalled(pubkey: PublicKey): Promise<XnftWithMetadata[]> {
    const response = await anonymousProgram.account.install.all([
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

  static async getOwned(pubkey: PublicKey): Promise<XnftWithMetadata[]> {
    const response = await anonymousProgram.account.xnft2.all([
      {
        memcmp: {
          offset: 8,
          bytes: pubkey.toBase58()
        }
      }
    ]);

    const owned: XnftWithMetadata[] = [];

    for await (const item of response) {
      const data = await xNFT.get(item.publicKey);
      owned.push(data);
    }

    return owned;
  }

  static async install(
    program: Program<IDLType>,
    name: string,
    publisher: PublicKey,
    installVault: PublicKey
  ) {
    const xnft = await findXNFTMintPDA(name, publisher);
    await program.methods
      .createInstall()
      .accounts({
        xnft,
        installVault
      })
      .rpc();
  }
}

/**
 * @param {string} name
 * @param {PublicKey} publisher
 * @returns {Promise<PublicKey>}
 */
async function findXNFTMintPDA(name: string, publisher: PublicKey): Promise<PublicKey> {
  // Mint PDA Address
  const [mintPdaAddress] = await PublicKey.findProgramAddress(
    [Buffer.from('mint'), publisher.toBytes(), Buffer.from(name)],
    XNFT_PROGRAM_ID
  );

  // Master Edition PDA
  const [masterEditionPdaAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBytes(),
      mintPdaAddress.toBytes(),
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
