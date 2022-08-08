import { PublicKey } from '@solana/web3.js';
import type { PublishState } from '../state/atoms/publish';
import { BUCKET_URL, getBundlePath, getIconPath, getScreenshotPath } from './s3';

export type Metadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  properties: MetadataProperties;
};

export type MetadataProperties = {
  bundle: string;
  icon: string;
  screenshots: string[];
  twitter: string;
  discord: string;
};

/**
 * Creates the xNFT metadata JSON object to be uploaded to storage.
 * @exports
 * @param {PublicKey} xnft
 * @param {PublishState} state
 * @returns {Metadata}
 */
export const generateMetadata = (xnft: PublicKey, state: PublishState): Metadata => ({
  name: state.title,
  symbol: state.title.slice(0, 3).toUpperCase(),
  description: state.description,
  image: `${BUCKET_URL}/${getIconPath(xnft, state.icon.name)}`,
  external_url: state.website,
  properties: {
    bundle: `${BUCKET_URL}/${getBundlePath(xnft, state.bundle.name)}`,
    icon: `${BUCKET_URL}/${getIconPath(xnft, state.icon.name)}`,
    screenshots: state.screenshots.map(s => `${BUCKET_URL}/${getScreenshotPath(xnft, s.name)}`),
    twitter: '', // TODO:
    discord: '' // TODO:
  }
});
