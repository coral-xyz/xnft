import type { Dispatch } from 'react';
import type { UploadDispatchAction, UploadState } from '../state/reducers/upload';
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
 * @param {UploadState} state
 * @param {Dispatch<UploadDispatchAction<'s3UrlBundle' | 's3UrlIcon' | 's3UrlScreenshots'>>} dispatch
 * @param {string} publicKey
 * @returns {string}
 */
export default function generateMetadata(
  state: UploadState,
  dispatch: Dispatch<UploadDispatchAction<'s3UrlBundle' | 's3UrlIcon' | 's3UrlScreenshots'>>,
  publicKey: string
): string {
  const metadata: Metadata = {
    name: state.title,
    description: state.description,
    website: state.website,
    properties: {
      icon: getIconUrl(publicKey, state.title, state.icon.name),
      bundle: getBundleUrl(publicKey, state.title, state.bundle.name),
      screenshots: [...state.screenshots].map(s => getScreenshotUrl(publicKey, state.title, s.name))
    }
  };

  dispatch({
    type: 'field',
    field: 's3UrlBundle',
    value: metadata.properties.bundle
  });

  dispatch({
    type: 'field',
    field: 's3UrlIcon',
    value: metadata.properties.icon
  });

  dispatch({
    type: 'field',
    field: 's3UrlScreenshots',
    value: metadata.properties.screenshots
  });

  return JSON.stringify(metadata);
}
