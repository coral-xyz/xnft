import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import fetch from 'isomorphic-unfetch';
import { IDL, Xnft } from '../programs/xnft';

const connection = new Connection(process.env.NEXT_PUBLIC_CONNECTION);

// xNFT Program ID
const programID = process.env.NEXT_PUBLIC_XNFT_PROGRAMID;

const metadataProgram = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

/**
 * @param {{ title: string }} data
 * @param {AnchorWallet} anchorWallet
 * @param {PublicKey} publicKey
 * @param {string} metadataUrl
 * @returns {string}
 */
export async function xNFTMint(
  data: { title: string },
  anchorWallet: AnchorWallet,
  publicKey: PublicKey,
  metadataUrl: string
): Promise<string> {
  const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' });
  const program = new Program<Xnft>(IDL, programID, provider);

  const installPrice = new BN(0); // TODO:
  const seller_fee_basis_points = 1; // TODO:
  const name = data.title;
  const symbol = data.title.slice(0, 3);
  try {
    const ix = program.methods
      .createXnft(name, symbol, metadataUrl, seller_fee_basis_points, installPrice, publicKey)
      .accounts({
        metadataProgram: new PublicKey(metadataProgram)
      });

    await ix.rpc();

    const pks = await ix.pubkeys();
    return pks.xnft.toBase58();
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * @returns {Promise<any[]>}
 */
export async function getAllXNFTs(): Promise<any[]> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'confirmed' }
  );

  const program = new Program<Xnft>(IDL, programID, provider);

  const response = [];

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

      response.push(xnft);
    } catch (error) {
      console.error('Error requesting xnfts', error);
    }
  }

  return response;
}

/**
 * @param {PublicKey} xnftPk
 * @returns {Promise<any>}
 */
export async function getXNFT(xnftPk: PublicKey): Promise<any> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'processed', skipPreflight: true }
  );
  const program = new Program<Xnft>(IDL, programID, provider);

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

    return xnft;
  } catch (error) {
    console.error('Error finding xNFT', error);
  }
}

/**
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
  const program = new Program<Xnft>(IDL, programID, provider);

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
 * @param {PublicKey} publisher
 * @param {string} name
 * @returns {Promise<PublicKey>}
 */
export async function findXNFTMintPDA(publisher: PublicKey, name: string): Promise<PublicKey> {
  // Mint PDA Address
  const [mintPdaAddress] = await PublicKey.findProgramAddress(
    [Buffer.from('mint'), new PublicKey(publisher).toBuffer(), Buffer.from(name)],
    new PublicKey(programID)
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
    new PublicKey(programID)
  );

  return xnftPdaAddress;
}

/**
 * @param {PublicKey} publicKey
 * @returns {Promise<any>}
 */
export async function fetchInstalledXNFTs(publicKey: PublicKey): Promise<any> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'processed', skipPreflight: true }
  );
  const program = new Program<Xnft>(IDL, programID, provider);

  const response = await program.account.install.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: program.provider.publicKey.toBase58()
      }
    }
  ]);

  let installedxNFTs = [];
  for await (const item of response) {
    const data = await getXNFT(item.account.xnft);
    installedxNFTs.push(data);
  }

  return installedxNFTs;
}

/**
 * @param {PublicKey} publicKey
 * @returns {Promise<any>}
 */
export async function fetchOwnedXNFTs(publicKey: PublicKey): Promise<any> {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey,
      signAllTransactions: undefined,
      signTransaction: undefined
    },
    { commitment: 'processed', skipPreflight: true }
  );
  const program = new Program<Xnft>(IDL, programID, provider);

  const response = await program.account.xnft2.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: program.provider.publicKey.toBase58()
      }
    }
  ]);

  let ownedxNFTs = [];
  for await (const item of response) {
    const data = await getXNFT(item.publicKey);
    ownedxNFTs.push(data);
  }

  return ownedxNFTs;
}
