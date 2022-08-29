import { PublicKey } from '@solana/web3.js';
import type { PublishState } from '../state/atoms/publish';
import { S3_BUCKET_URL } from './constants';
import { S3Uploader } from './uploaders';

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
 * @param {PublicKey} xnft
 * @param {PublishState} state
 * @returns {Metadata}
 */
export const generateMetadata = (xnft: PublicKey, state: PublishState): Metadata => {
  const uploader = new S3Uploader(xnft); // TODO:
  return {
    name: state.title,
    symbol: '',
    description: state.description,
    image: `${S3_BUCKET_URL}/${uploader.getIconPath(state.icon.name)}`,
    animation_url: '',
    external_url: state.website,
    properties: {
      bundle: `${S3_BUCKET_URL}/${uploader.getBundlePath(state.bundle.name)}`,
      files: state.screenshots.map(s => ({
        uri: `${S3_BUCKET_URL}/${uploader.getScreenshotPath(s.name)}`,
        type: s.type
      }))
    }
  };
};
