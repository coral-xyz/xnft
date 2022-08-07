import { useEffect, useState } from 'react';
import { type SetterOrUpdater, useRecoilState } from 'recoil';
import { getCache } from '../../utils/localStorage';
import type { SerializedXnftWithMetadata } from '../../utils/xnft';
import { publishState, type PublishState } from '../atoms/publish';

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

export function usePublish(): [PublishState, SetterOrUpdater<PublishState>] {
  return useRecoilState(publishState);
}
