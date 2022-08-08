// import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { selector, useRecoilValueLoadable } from 'recoil';
import { getCache } from '../../utils/localStorage';
import xNFT, { type XnftWithMetadata, type SerializedXnftWithMetadata } from '../../utils/xnft';
import { anchorWalletState } from './solana';

/**
 * State of the connected wallet's installed xNFTs found on-chain.
 * @export
 */
export const installedXnftsState = selector<XnftWithMetadata[]>({
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
 *   installed: XnftWithMetadata[];
 *   loading: boolean;
 *   err?: Error;
 * }}
 */
export function useInstalledXnftsLoadable(): {
  installed: XnftWithMetadata[];
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

/**
 * Custom hook to get the xNFTs that are cached in local storage.
 * @export
 * @returns {{ isLoading: boolean; cachedXNFTs: SerializedXnftWithMetadata[] }}
 */
export function useCachedXNFTs(): {
  isLoading: boolean;
  cachedXNFTs: SerializedXnftWithMetadata[];
} {
  const [cachedXNFTs, setCachedXNFTs] = useState<SerializedXnftWithMetadata[]>([]);

  useEffect(() => {
    if (cachedXNFTs.length === 0) {
      setCachedXNFTs(getCache('xnfts'));
    }
  }, []);

  return {
    isLoading: cachedXNFTs.length === 0,
    cachedXNFTs: cachedXNFTs
  };
}
