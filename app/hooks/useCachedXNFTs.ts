import { useEffect, useState } from 'react';
import { getCache } from '../utils/localStorage';

export default function useCachedXNFTs() {
  const [cachedXNFTs, setCachedXNFTs] = useState<any[]>([]);

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
