import { PublicKey } from '@solana/web3.js';
import type { UploadState } from '../pages/publish';
import { getBundleUrl, getIconUrl, getScreenshotUrl } from './s3';

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
 * @param {UploadState} state
 * @returns {Metadata}
 */
export const generateMetadata = (xnft: PublicKey, state: UploadState): Metadata => ({
  name: state.title,
  symbol: state.title.slice(0, 3).toUpperCase(),
  description: state.description,
  image: getIconUrl(xnft, state.icon.name),
  external_url: state.website,
  properties: {
    bundle: getBundleUrl(xnft, state.bundle.name),
    icon: getIconUrl(xnft, state.icon.name),
    screenshots: [...state.screenshots].map(s => getScreenshotUrl(xnft, s.name)),
    twitter: '', // TODO:
    discord: '' // TODO:
  }
});
