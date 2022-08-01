import type { UploadState } from '../state/atoms/publish';
import { getBundleUrl, getIconUrl, getScreenshotUrl } from './s3';

export type Metadata = {
  name: string;
  description: string;
  website: string;
  properties: MetadataProperties;
};

export type MetadataProperties = {
  bundle: string;
  icon: string;
  screenshots: string[];
};

/**
 * @param {string} publicKey
 * @param {UploadState} state
 * @returns {Metadata}
 */
export const generateMetadata = (publicKey: string, state: UploadState): Metadata => ({
  name: state.title,
  description: state.description,
  website: state.website,
  properties: {
    icon: getIconUrl(publicKey, state.title, state.icon.name),
    bundle: getBundleUrl(publicKey, state.title, state.bundle.name),
    screenshots: [...state.screenshots].map(s => getScreenshotUrl(publicKey, state.title, s.name))
  }
});
