import type { Provider } from '@project-serum/anchor';
import {
  type RawAccount,
  TOKEN_PROGRAM_ID,
  ACCOUNT_SIZE,
  AccountLayout,
  getAssociatedTokenAddress,
  getAccount
} from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

export interface XnftTokenData {
  owner: PublicKey;
  publicKey: PublicKey;
}

/**
 * Get all decoded token accounts owned by the argued wallet public key.
 * @export
 * @param {Connection} connection
 * @param {PublicKey} owner
 * @returns {Promise<{ publicKey: PublicKey; account: RawAccount }[]>}
 */
export async function getTokenAccounts(
  connection: Connection,
  owner: PublicKey
): Promise<{ publicKey: PublicKey; account: RawAccount }[]> {
  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: ACCOUNT_SIZE
      },
      {
        memcmp: {
          offset: 32,
          bytes: owner.toBase58()
        }
      }
    ]
  });

  return accounts.map(acc => ({
    publicKey: acc.pubkey,
    account: AccountLayout.decode(acc.account.data)
  }));
}

/**
 * Fetches the xNFT token account public key and owner for the argued master mint.
 * @export
 * @param {Provider} provider
 * @param {PublicKey} masterMint
 * @returns {Promise<XnftTokenData>}
 */
export async function getTokenData(
  provider: Provider,
  masterMint: PublicKey
): Promise<XnftTokenData> {
  const masterToken = await getAssociatedTokenAddress(masterMint, provider.publicKey);
  const tokenAcc = await getAccount(provider.connection, masterToken);
  return {
    owner: tokenAcc.owner,
    publicKey: masterToken
  };
}
