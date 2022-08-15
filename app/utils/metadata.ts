import { PublicKey } from '@solana/web3.js';
import type { PublishState } from '../state/atoms/publish';
import { S3_BUCKET_URL } from './constants';
import { getBundlePath, getIconPath, getScreenshotPath } from './s3';

export type Metadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  properties: MetadataProperties;
};

export type MetadataProperties = {
  bundle: string;
  files: PropertiesFile[];
};

export type PropertiesFile = {
  uri: string;
  type: string;
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
  image: `${S3_BUCKET_URL}/${getIconPath(xnft, state.icon.name)}`,
  animation_url: '',
  external_url: state.website,
  properties: {
    bundle: `${S3_BUCKET_URL}/${getBundlePath(xnft, state.bundle.name)}`,
    files: state.screenshots.map(s => ({
      uri: `${S3_BUCKET_URL}/${getScreenshotPath(xnft, s.name)}`,
      type: s.type
    }))
  }
});
