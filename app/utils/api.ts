import { PublicKey } from '@solana/web3.js';
import fetch from './fetch';

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
