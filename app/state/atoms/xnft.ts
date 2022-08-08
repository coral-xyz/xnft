import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getCache } from '../../utils/localStorage';
import xNFT, { type XnftWithMetadata, type SerializedXnftWithMetadata } from '../../utils/xnft';

export function useInstalledXnfts(): XnftWithMetadata[] {
  const { connected, publicKey } = useWallet();
  const [installed, setInstalled] = useState<XnftWithMetadata[]>([]);

  useEffect(() => {
    if (connected) {
      xNFT.getInstalled(publicKey).then(setInstalled).catch(console.error);
    } else {
      setInstalled([]);
    }
  }, [connected, publicKey]);

  return installed;
}

export function useOwnedXnfts(): XnftWithMetadata[] {
  const { connected, publicKey } = useWallet();
  const [owned, setOwned] = useState<XnftWithMetadata[]>([]);

  useEffect(() => {
    if (connected) {
      xNFT.getOwned(publicKey).then(setOwned).catch(console.error);
    } else {
      setOwned([]);
    }
  }, [connected, publicKey]);

  return owned;
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
