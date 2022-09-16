import { type RawAccount, TOKEN_PROGRAM_ID, ACCOUNT_SIZE, AccountLayout } from '@solana/spl-token';
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
 * @param {Connection} connection
 * @param {PublicKey} masterMint
 * @returns {Promise<XnftTokenData>}
 */
export async function getTokenData(
  connection: Connection,
  masterMint: PublicKey
): Promise<XnftTokenData> {
  const tokenAccs = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: ACCOUNT_SIZE
      },
      {
        memcmp: {
          offset: 0,
          bytes: masterMint.toBase58()
        }
      }
    ]
  });

  if (tokenAccs.length === 0) {
    throw new Error(`no token accounts found for mint ${masterMint.toBase58()}`);
  }

  const data = AccountLayout.decode(tokenAccs[0].account.data);

  return {
    owner: data.owner,
    publicKey: tokenAccs[0].pubkey
  };
}
