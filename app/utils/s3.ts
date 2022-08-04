import { PublicKey } from '@solana/web3.js';
import type { UploadState } from '../pages/publish';
import { generateMetadata } from './metadata';

export const BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export const getMetadataPath = (xnft: PublicKey): string => `${xnft.toBase58()}/metadata.json`;

export const getBundlePath = (xnft: PublicKey, name: string): string =>
  `${xnft.toBase58()}/bundle/${name}`;

export const getIconPath = (xnft: PublicKey, name: string): string =>
  `${xnft.toBase58()}/icon/${name}`;

export const getScreenshotPath = (xnft: PublicKey, name: string): string =>
  `${xnft.toBase58()}/screenshots/${name}`;

/**
 * Uploads the xNFT files to the appropriate S3 bucket and path.
 * Includes bundle source, icon image, and submitted screenshots.
 * @exports
 * @param {PublicKey} xnft
 * @param {UploadState} state
 */
export async function uploadFiles(xnft: PublicKey, state: UploadState) {
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
              ? getBundlePath(xnft, f.name)
              : idx === 1
              ? getIconPath(xnft, f.name)
              : getScreenshotPath(xnft, f.name),
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
 * @param {PublicKey} xnft
 * @param {UploadState} state
 * @returns {Promise<string>}
 */
export async function uploadMetadata(xnft: PublicKey, state: UploadState): Promise<string> {
  const metadata = generateMetadata(xnft, state);
  const fileName = getMetadataPath(xnft);

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

  return `${BUCKET_URL}/${fileName}`;
}
