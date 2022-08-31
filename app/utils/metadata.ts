import type { PublishState } from '../state/atoms/publish';

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
