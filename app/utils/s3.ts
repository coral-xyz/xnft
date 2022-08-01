import type { UploadState } from '../state/atoms/publish';
import { generateMetadata } from './metadata';

const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

const getBucketUrl = (publicKey: string, title: string): string =>
  `${BUCKET_URL}/${publicKey}/${title}`;

export const getBundleUrl = (pubkey: string, title: string, name: string): string =>
  `${getBucketUrl(pubkey, title)}/bundle/${name}`;

export const getIconUrl = (pubkey: string, title: string, name: string): string =>
  `${getBucketUrl(pubkey, title)}/icon/${name}`;

export const getScreenshotUrl = (pubkey: string, title: string, name: string): string =>
  `${getBucketUrl(pubkey, title)}/screenshots/${name}`;

/**
 * @exports
 * @param {string} publicKey
 * @param {UploadState} state
 */
export async function uploadFiles(publicKey: string, state: UploadState) {
  const files = [state.bundle, state.icon, ...state.screenshots];
  await Promise.all(
    files.map(async (f, idx) => {
      try {
        const resp = await fetch('/api/s3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name:
              idx === 0
                ? getBundleUrl(publicKey, state.title, f.name)
                : idx === 1
                ? getIconUrl(publicKey, state.title, f.name)
                : getScreenshotUrl(publicKey, state.title, f.name),
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
      } catch (err) {
        console.error('Error saving file to S3', err);
      }
    })
  );
}

/**
 * @exports
 * @param {string} publicKey
 * @param {UploadState} state
 * @returns {Promise<string>}
 */
export async function uploadMetadata(publicKey: string, state: UploadState): Promise<string> {
  try {
    const metadata = generateMetadata(publicKey, state);
    const fileName = `${publicKey}/${state.title}/metadata.json`;

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
  } catch (err) {
    console.error('Error saving file to S3', err);
  }
}
