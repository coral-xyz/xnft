import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, type IdlAccounts } from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import fetch from 'isomorphic-unfetch';
import { IDL, type Xnft as IDLType } from '../programs/xnft';

const connection = new Connection(process.env.NEXT_PUBLIC_CONNECTION);

const programId = process.env.NEXT_PUBLIC_XNFT_PROGRAMID;
const metadataProgram = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

export type Xnft = IdlAccounts<IDLType>['xnft2'];
export type XnftWithMetadata = {
  accounts: {
    account: Xnft;
    publicKey: PublicKey;
  };
  metadataAccount: Metadata;
  metadata: any;
};

/**
 * @export
 * @returns {Promise<XnftWithMetadata[]>}
 */
export async function getAllXNFTs(): Promise<XnftWithMetadata[]> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'confirmed' }
  );

  const program = new Program(IDL, programId, provider);

  const response: XnftWithMetadata[] = [];

  const data = await program.account.xnft2.all();

  for await (const item of data) {
    try {
      // Find metadata account data
      const metadataAccount = await Metadata.fromAccountAddress(
        program.provider.connection,
        item.account.masterMetadata
      );

      /**
       * Timeout in case there's a broken metadata link
       */

      const metadata = await fetch(metadataAccount.data.uri, { timeout: 3000 } as RequestInit).then(
        res => res.json()
      );

      const xnft = {
        accounts: item,
        metadataAccount,
        metadata
      };

      response.push(xnft as any);
    } catch (error) {
      console.error('Error requesting xnfts', error);
    }
  }

  return response;
}

/**
 * @export
 * @param {PublicKey} xnftPk
 * @returns {Promise<XnftWithMetadata>}
 */
export async function getXNFT(xnftPk: PublicKey): Promise<XnftWithMetadata> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'processed', skipPreflight: true }
  );
  const program = new Program(IDL, programId, provider);

  try {
    // Find xFNT account
    const account = await program.account.xnft2.fetch(xnftPk);

    // Find metadata account data
    const metadataAccount = await Metadata.fromAccountAddress(
      program.provider.connection,
      account.masterMetadata
    );

    // Find Metadata data
    const metadata = await fetch(metadataAccount.data.uri, { timeout: 3000 } as RequestInit).then(
      res => res.json()
    );

    const xnft = {
      accounts: {
        publicKey: xnftPk,
        account
      },
      metadataAccount,
      metadata
    };

    return xnft as any;
  } catch (error) {
    console.error('Error finding xNFT', error);
  }
}

/**
 * @export
 * @param {AnchorWallet} anchorWallet
 * @param {PublicKey} publisher
 * @param {string} name
 * @param {PublicKey} installVault
 */
export async function installXNFT(
  anchorWallet: AnchorWallet,
  publisher: PublicKey,
  name: string,
  installVault: PublicKey
) {
  const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' });
  const program = new Program(IDL, programId, provider);

  try {
    const xnftPK = await findXNFTMintPDA(publisher, name);

    const tx = program.methods.createInstall().accounts({
      xnft: xnftPK,
      installVault
    });

    await tx.rpc();
  } catch (error) {
    console.error('Error installing xNFT', error);
  }
}

/**
 * @export
 * @param {PublicKey} publisher
 * @param {string} name
 * @returns {Promise<PublicKey>}
 */
export async function findXNFTMintPDA(publisher: PublicKey, name: string): Promise<PublicKey> {
  // Mint PDA Address
  const [mintPdaAddress] = await PublicKey.findProgramAddress(
    [Buffer.from('mint'), new PublicKey(publisher).toBuffer(), Buffer.from(name)],
    new PublicKey(programId)
  );

  // Master Edition PDA
  const [masterEditionPdaAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      new PublicKey(metadataProgram).toBuffer(),
      mintPdaAddress.toBuffer(),
      Buffer.from('edition')
    ],
    new PublicKey(metadataProgram)
  );

  // xnft PDA (needed to install)
  const [xnftPdaAddress] = await PublicKey.findProgramAddress(
    [Buffer.from('xnft'), masterEditionPdaAddress.toBuffer()],
    new PublicKey(programId)
  );

  return xnftPdaAddress;
}

/**
 * @export
 * @param {PublicKey} publicKey
 * @returns {Promise<XnftWithMetadata[]>}
 */
export async function getInstalledXNFTs(publicKey: PublicKey): Promise<XnftWithMetadata[]> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'processed', skipPreflight: true }
  );
  const program = new Program(IDL, programId, provider);

  const response = await program.account.install.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: program.provider.publicKey.toBase58()
      }
    }
  ]);

  const installedxNFTs: XnftWithMetadata[] = [];
  for await (const item of response) {
    const data = await getXNFT(item.account.xnft);
    installedxNFTs.push(data);
  }

  return installedxNFTs;
}

/**
 * @export
 * @param {PublicKey} publicKey
 * @returns {Promise<XnftWithMetadata[]>}
 */
export async function getOwnedXNFTs(publicKey: PublicKey): Promise<XnftWithMetadata[]> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'processed', skipPreflight: true }
  );
  const program = new Program(IDL, programId, provider);

  const response = await program.account.xnft2.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: program.provider.publicKey.toBase58()
      }
    }
  ]);

  let ownedxNFTs: XnftWithMetadata[] = [];
  for await (const item of response) {
    const data = await getXNFT(item.publicKey);
    ownedxNFTs.push(data);
  }

  return ownedxNFTs;
}
