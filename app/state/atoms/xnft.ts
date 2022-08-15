import { selector, useRecoilValueLoadable } from 'recoil';
import xNFT, { type InstalledXnftWithMetadata, type XnftWithMetadata } from '../../utils/xnft';
import { anchorWalletState } from './solana';

/**
 * State of the connected wallet's installed xNFTs found on-chain.
 * @export
 */
export const installedXnftsState = selector<InstalledXnftWithMetadata[]>({
  key: 'installedXnfts',
  get: async ({ get }) => {
    const wallet = get(anchorWalletState);
    return wallet ? await xNFT.getInstalled(wallet.publicKey) : [];
  }
});

/**
 * Custom hook to access the installed xNFTs from the loadable recoil state.
 * @export
 * @returns {{
 *   installed: InstalledXnftWithMetadata[];
 *   loading: boolean;
 *   err?: Error;
 * }}
 */
export function useInstalledXnftsLoadable(): {
  installed: InstalledXnftWithMetadata[];
  loading: boolean;
  err?: Error;
} {
  const installed = useRecoilValueLoadable(installedXnftsState);

  return {
    installed: installed.state === 'hasValue' ? installed.contents : [],
    loading: installed.state === 'loading',
    err: installed.state === 'hasError' ? installed.contents : undefined
  };
}

/**
 * State of the connected wallet's owned/published xNFTs found on-chain.
 * @export
 */
export const ownedXnftsState = selector<XnftWithMetadata[]>({
  key: 'ownedXnfts',
  get: async ({ get }) => {
    const wallet = get(anchorWalletState);
    return wallet ? await xNFT.getOwned(wallet.publicKey) : [];
  }
});

/**
 * Custom hook to access the owned xNFTs from the loadable recoil state.
 * @export
 * @returns {{
 *   owned: XnftWithMetadata[];
 *   loading: boolean;
 *   err?: Error;
 * }}
 */
export function useOwnedXnftsLoadable(): {
  owned: XnftWithMetadata[];
  loading: boolean;
  err?: Error;
} {
  const owned = useRecoilValueLoadable(ownedXnftsState);

  return {
    owned: owned.state === 'hasValue' ? owned.contents : [],
    loading: owned.state === 'loading',
    err: owned.state === 'hasError' ? owned.contents : undefined
  };
}
