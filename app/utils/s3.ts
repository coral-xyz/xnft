import type { Dispatch } from 'react';
import type { UploadDispatchAction, UploadState } from '../state/reducers/upload';
import generateMetadata from './metadata';

const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

/**
 * Input Files S3 Uploader
 * @param {UploadState} state
 * @param {string} publicKey
 */
export async function filesS3Uploader(state: UploadState, publicKey: string) {
  const files = [].concat(
    state.bundle,
    state.icon
    // ...state.screenshots
  );

  let count = 0;
  for await (const file of files) {
    let filePath = `${publicKey}/${state.title}`;

    if (count === 0) {
      filePath = `${filePath}/bundle/${file.name}`;
      count++;
    } else if (count === 1) {
      filePath = `${filePath}/icon/${file.name}`;
      count++;
    } else {
      filePath = `${filePath}/screenshots/${file.name}`;
      count++;
    }

    try {
      const resp = await fetch('/api/s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: filePath,
          type: file.type
        })
      });

      let { url } = await resp.json();

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-type': file.type,
          'Access-Control-Allow-Origin': '*'
        },
        body: file
      });
    } catch (err) {
      console.log('Error saving file in S3', err);
    }
  }
}

/**
 * @param {UploadState} state
 * @param {Dispatch<UploadDispatchAction<'s3UrlMetadata'>>} dispatch
 * @param {string} publicKey
 * @returns {Promise<string>}
 */
export async function metadataS3Uploader(
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
    console.log('Error saving file in S3', err);
  }
}
