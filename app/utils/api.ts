import { PublicKey } from '@solana/web3.js';
import fetch from './fetch';

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

  await fetch(
    uri,
    {
      method: 'POST',
      headers: {
        Authorization: process.env.NEXT_PUBLIC_MY_SECRET_TOKEN
      }
    },
    10000
  );
}
