import type { UploadState } from '../state/atoms/publish';
import { generateMetadata } from './metadata';

const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

const getBucketUrl = (publisherPubkey: string, title: string): string =>
  `${BUCKET_URL}/${publisherPubkey}/${title}`;

export const getBundleUrl = (publisherPubkey: string, title: string, name: string): string =>
  `${getBucketUrl(publisherPubkey, title)}/bundle/${name}`;

export const getIconUrl = (publisherPubkey: string, title: string, name: string): string =>
  `${getBucketUrl(publisherPubkey, title)}/icon/${name}`;

export const getScreenshotUrl = (publisherPubkey: string, title: string, name: string): string =>
  `${getBucketUrl(publisherPubkey, title)}/screenshots/${name}`;

/**
 * Uploads the xNFT files to the appropriate S3 bucket and path.
 * Includes bundle source, icon image, and submitted screenshots.
 * @exports
 * @param {string} publisherPubkey
 * @param {UploadState} state
 */
export async function uploadFiles(publisherPubkey: string, state: UploadState) {
  const files = [state.bundle, state.icon, ...state.screenshots];
  await Promise.all(
    files.map(async (f, idx) => {
      const resp = await fetch('/api/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name:
            idx === 0
              ? getBundleUrl(publisherPubkey, state.title, f.name)
              : idx === 1
              ? getIconUrl(publisherPubkey, state.title, f.name)
              : getScreenshotUrl(publisherPubkey, state.title, f.name),
          type: f.type
        })
      });

      const { url } = await resp.json();

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-type': f.type,
          'Access-Control-Allow-Origin': '*'
        },
        body: f
      });
    })
  );
}

/**
 * Uploads the metadata JSON file to S3 for the argued xNFT public key.
 * @exports
 * @param {string} publisherPubkey
 * @param {UploadState} state
 * @returns {Promise<string>}
 */
export async function uploadMetadata(publisherPubkey: string, state: UploadState): Promise<string> {
  const metadata = generateMetadata(publisherPubkey, state);
  const fileName = `${publisherPubkey}/${state.title}/metadata.json`;

  const resp = await fetch('/api/s3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: fileName,
      type: 'application/json'
    })
  });

  const { url } = await resp.json();

  await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(metadata)
  });

  return `${BUCKET_URL}${fileName}`;
}
