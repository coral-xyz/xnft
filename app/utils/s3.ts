import S3 from 'aws-sdk/clients/s3';
import type { Dispatch } from 'react';
import type { UploadDispatchAction, UploadState } from '../state/reducers/upload';
import generateMetadata from './metadata';

export const s3Client = new S3({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: 'v4'
});

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
 * @param {UploadState} state
 * @param {string} publicKey
 */
export async function uploadFiles(state: UploadState, publicKey: string) {
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
 * @param {UploadState} state
 * @param {Dispatch<UploadDispatchAction<'s3UrlMetadata'>>} dispatch
 * @param {string} publicKey
 * @returns {Promise<string>}
 */
export async function uploadMetadata(
  state: UploadState,
  dispatch: Dispatch<UploadDispatchAction<'s3UrlMetadata'>>,
  publicKey: string
): Promise<string> {
  try {
    const metadata = generateMetadata(
      state,
      dispatch as Dispatch<UploadDispatchAction<any>>,
      publicKey
    );

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
      body: metadata
    });

    dispatch({
      type: 'field',
      field: 's3UrlMetadata',
      value: `${BUCKET_URL}${fileName}`
    });

    return `${BUCKET_URL}${fileName}`;
  } catch (err) {
    console.error('Error saving file to S3', err);
  }
}
