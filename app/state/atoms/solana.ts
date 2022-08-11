import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { atom, type SetterOrUpdater, useRecoilState } from 'recoil';

/**
 * RPC connection object state.
 * @export
 */
export const connectionState = atom<Connection>({
  key: 'connection',
  dangerouslyAllowMutability: true,
  default: new Connection(process.env.NEXT_PUBLIC_CONNECTION, 'confirmed')
});

/**
 * Custom hook to access and mutate the connection URL recoil atom.
 * @export
 * @returns {[Connection, SetterOrUpdater<Connection>]}
 */
export function useConnection(): [Connection, SetterOrUpdater<Connection>] {
  return useRecoilState(connectionState);
}

/**
 * Connected `AnchorWallet` state.
 * @export
 */
export const anchorWalletState = atom<AnchorWallet>({
  key: 'anchorWallet',
  default: undefined
});
