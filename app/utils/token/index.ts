import { type RawAccount, TOKEN_PROGRAM_ID, ACCOUNT_SIZE, AccountLayout } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

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
