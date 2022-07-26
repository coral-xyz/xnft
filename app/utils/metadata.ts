import type { Dispatch } from 'react';
import type { UploadDispatchAction, UploadState } from '../state/reducers/upload';

const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

/**
 * Creates NFT metadata
 * @param {UploadState} state
 * @param {Dispatch<UploadDispatchAction<'s3UrlBundle' | 's3UrlIcon' | 's3UrlScreenshots'>>} dispatch
 * @param {string} publicKey
 */
export default function generateMetadata(
  state: UploadState,
  dispatch: Dispatch<UploadDispatchAction<'s3UrlBundle' | 's3UrlIcon' | 's3UrlScreenshots'>>,
  publicKey: string
): string {
  const metadata = {
    name: state.title,
    description: state.description,
    external_url: state.website,
    image: '',
    properties: {
      icon: '',
      bundle: '',
      screenshots: [],
      twitter: state.twitter,
      discord: state.discord,
      website: state.website
    }
  };

  const files = [].concat(
    state.bundle,
    state.icon
    // ...state.screenshots TODO:fix
  );

  const uri = `${BUCKET_URL}/${publicKey}/${state.title}`;
  for (let i = 0; i < files.length; i++) {
    if (i === 0) {
      const url = `${uri}/bundle/${files[i].name}`;

      metadata.properties.bundle = url;
      dispatch({
        type: 'field',
        field: 's3UrlBundle',
        value: url
      });
    } else if (i === 1) {
      const url = `${uri}/icon/${files[i].name}`;

      metadata.image = url;
      metadata.properties.icon = url;

      dispatch({
        type: 'field',
        field: 's3UrlIcon',
        value: url
      });
    } else {
      const url = `${uri}/bundle/${files[i].name}`;

      metadata.properties.screenshots.push(url);

      // TODO: fix
      dispatch({
        type: 'field',
        field: 's3UrlScreenshots',
        value: url
      });
    }
  }

  return JSON.stringify(metadata);
}
