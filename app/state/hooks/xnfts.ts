import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getCache } from '../../utils/localStorage';
import {
  getInstalledXNFTs,
  getOwnedXNFTs,
  type SerializedXnftWithMetadata,
  type XnftWithMetadata
} from '../../utils/xnft';

export function useCachedXNFTs() {
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

export function useInstalledXNFTs() {
  const { publicKey } = useWallet();
  const [installedXNFTs, setInstalledXNFTs] = useState<XnftWithMetadata[]>([]);

  useEffect(() => {
    async function run() {
      try {
        const response = await getInstalledXNFTs(publicKey);
        setInstalledXNFTs(response);
      } catch (err) {
        console.error(`useInstalledXNFTs: ${err}`);
      }
    }
    if (publicKey) run();
  }, [publicKey]);

  return { installedXNFTs };
}

export function useOwnedXNFTs() {
  const { publicKey } = useWallet();
  const [ownedXNFTs, setOwnedXNFTs] = useState<XnftWithMetadata[]>([]);

  useEffect(() => {
    async function run() {
      try {
        const response = await getOwnedXNFTs(publicKey);
        setOwnedXNFTs(response);
      } catch (err) {
        console.error(`useOwnedXNFTs: ${err}`);
      }
    }
    if (publicKey) run();
  }, [publicKey]);

  return { ownedXNFTs };
}
