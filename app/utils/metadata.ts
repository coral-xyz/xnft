import { Metadata as MplMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { Program } from '@project-serum/anchor';
import type { Xnft } from '../programs/xnft';
import type { PublishState } from '../state/atoms/publish';
import fetch from './fetch';
import type { XnftAccount } from './xnft';

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
 * @param {XnftAccount} xnft
 * @param {boolean} [staticRender]
 * @returns {Promise<{ metadata: Metadata, metadataAccount: MplMetadata }>}
 */
export async function getMetadata(
  program: Program<Xnft>,
  xnft: XnftAccount,
  staticRender?: boolean
): Promise<{ metadata: Metadata; metadataAccount: MplMetadata }> {
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

  return { metadata, metadataAccount };
}
