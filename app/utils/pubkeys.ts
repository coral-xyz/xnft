import { PROGRAM_ID as METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';
import { XNFT_PROGRAM_ID } from './constants';

/**
 * Derive the PDA for an Install program account.
 * @export
 * @param {PublicKey} authority
 * @param {PublicKey} xnft
 * @returns {Promise<PublicKey>}
 */
export async function deriveInstallAddress(
  authority: PublicKey,
  xnft: PublicKey
): Promise<PublicKey> {
  const [pk] = await PublicKey.findProgramAddress(
    [Buffer.from('install'), authority.toBytes(), xnft.toBytes()],
    XNFT_PROGRAM_ID
  );

  return pk;
}

/**
 * Derive the PDA of the master mint account.
 * @export
 * @param {string} name
 * @param {PublicKey} publisher
 * @returns {Promise<PublicKey>}
 */
export async function deriveMasterMintAddress(
  name: string,
  publisher: PublicKey
): Promise<PublicKey> {
  const [masterMint] = await PublicKey.findProgramAddress(
    [Buffer.from('mint'), publisher.toBytes(), Buffer.from(name)],
    XNFT_PROGRAM_ID
  );
  return masterMint;
}

/**
 * Derive the PDA of the associated xNFT program account.
 * @export
 * @param {PublicKey} masterMint
 * @returns {Promise<PublicKey>}
 */
export async function deriveXnftAddress(masterMint: PublicKey): Promise<PublicKey> {
  const [masterEditionPdaAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBytes(),
      masterMint.toBytes(),
      Buffer.from('edition')
    ],
    METADATA_PROGRAM_ID
  );

  // xnft PDA (needed to install)
  const [xnftPdaAddress] = await PublicKey.findProgramAddress(
    [Buffer.from('xnft'), masterEditionPdaAddress.toBytes()],
    XNFT_PROGRAM_ID
  );

  return xnftPdaAddress;
}
