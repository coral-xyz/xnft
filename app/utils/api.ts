import { PublicKey } from '@solana/web3.js';
import fetch from 'isomorphic-unfetch';
import { S3_BUCKET_URL } from './constants';
import type { Metadata } from './metadata';

export const getMetadataPath = (xnft: PublicKey): string => `${xnft.toBase58()}/metadata.json`;

export const getBundlePath = (xnft: PublicKey, name: string): string =>
  `${xnft.toBase58()}/bundle/${name}`;

export const getIconPath = (xnft: PublicKey, name: string): string =>
  `${xnft.toBase58()}/icon/${name}`;

export const getScreenshotPath = (xnft: PublicKey, name: string): string =>
  `${xnft.toBase58()}/screenshots/${name}`;

/**
 * Revalidate the static rendered path for the argued xNFT public key.
 * @export
 * @param {PublicKey} [xnft]
 */
export async function revalidate(xnft?: PublicKey) {
  let uri = '/api/revalidate';

  if (xnft) {
    uri += `?xnft=${xnft.toBase58()}`;
  }

  await fetch(uri, {
    method: 'POST',
    headers: {
      Authorization: process.env.NEXT_PUBLIC_MY_SECRET_TOKEN
    }
  });
}

/**
 * Uploads the xNFT files to the appropriate S3 bucket and path.
 * Includes bundle source, icon image, and submitted screenshots.
 * @export
 * @param {PublicKey} xnft
 * @param {File} [bundle]
 * @param {File} [icon]
 * @param {File[]} [screenshots]
 */
export async function uploadFiles(
  xnft: PublicKey,
  bundle?: File,
  icon?: File,
  screenshots?: File[]
) {
  const files: File[] = [bundle, icon, ...(screenshots ?? [undefined])];

  await Promise.all(
    files.map(async (f, idx) => {
      if (!f) return;

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
 * @export
 * @param {PublicKey} xnft
 * @param {Metadata} data
 * @returns {Promise<string>}
 */
export async function uploadMetadata(xnft: PublicKey, data: Metadata): Promise<string> {
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
    body: JSON.stringify(data)
  });

  return `${S3_BUCKET_URL}/${fileName}`;
}
