import { Metadata as MplMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { Program, Spl } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import type { Xnft } from '../programs/xnft';
import type { PublishState } from '../state/atoms/publish';
import fetch from './fetch';
import { deriveMasterTokenAddress, type XnftAccount, type XnftWithMetadata } from './xnft';

export interface Metadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  properties: MetadataProperties;
}

export interface MetadataProperties {
  bundle: string;
  files: PropertiesFile[];
}

export interface PropertiesFile {
  uri: string;
  type: string;
}

/**
 * Creates the xNFT metadata JSON object to be uploaded to storage.
 * @export
 * @param {PublishState} state
 * @param {string} imageUri
 * @param {string} bundleUri
 * @param {PropertiesFile[]} screenshots
 * @returns {Metadata}
 */
export const generateMetadata = (
  state: PublishState,
  imageUri: string,
  bundleUri: string,
  screenshots: PropertiesFile[]
): Metadata => ({
  name: state.title,
  symbol: '',
  description: state.description,
  image: imageUri,
  animation_url: '',
  external_url: state.website,
  properties: {
    bundle: bundleUri,
    files: screenshots
  }
});

/**
 * Fetches and appends the appropriate metadata objects to
 * the provided xNFT account and public key.
 * @export
 * @param {Program<Xnft>} program
 * @param {PublicKey} publicKey
 * @param {XnftAccount} xnft
 * @param {boolean} [staticRender]
 * @returns {Promise<XnftWithMetadata>}
 */
export async function transformWithMetadata(
  program: Program<Xnft>,
  publicKey: PublicKey,
  xnft: XnftAccount,
  staticRender?: boolean
): Promise<XnftWithMetadata> {
  const metadataAccount = await MplMetadata.fromAccountAddress(
    program.provider.connection,
    xnft.masterMetadata
  );

  let resp: Response;

  if (!staticRender && metadataAccount.data.uri.startsWith('ipfs://')) {
    const uri = metadataAccount.data.uri.replace('ipfs://', 'https://nftstorage.link/ipfs/');
    resp = await fetch(
      '/api/metadata',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uri
        })
      },
      10000
    );
  } else {
    resp = await fetch(
      metadataAccount.data.uri.replace('ipfs://', 'https://nftstorage.link/ipfs/'),
      {
        headers: {
          'Cache-Control': 'public,max-age=30'
        }
      },
      10000
    );
  }

  const metadata: Metadata = await resp.json();

  const masterToken = await deriveMasterTokenAddress(xnft.masterMint);
  const tokenAcc = await Spl.token(program.provider).account.token.fetch(masterToken);
  const tokenData = {
    owner: tokenAcc.authority,
    publicKey: masterToken
  };

  return {
    publicKey,
    account: xnft,
    metadataAccount,
    metadata,
    tokenData
  };
}
