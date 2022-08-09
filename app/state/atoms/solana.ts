import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { atom, type SetterOrUpdater, useRecoilState } from 'recoil';

/**
 * RPC connection URL state.
 * @export
 */
export const connectionUrlState = atom<string>({
  key: 'connectionUrl',
  default: process.env.NEXT_PUBLIC_CONNECTION
});

/**
 * Custom hook to access and mutate the connection URL recoil atom.
 * @export
 * @returns {[string, SetterOrUpdater<string>]}
 */
export function useConnectionUrl(): [string, SetterOrUpdater<string>] {
  return useRecoilState(connectionUrlState);
}

/**
 * Connected `AnchorWallet` state.
 * @export
 */
export const anchorWalletState = atom<AnchorWallet>({
  key: 'anchorWallet',
  default: undefined
});
