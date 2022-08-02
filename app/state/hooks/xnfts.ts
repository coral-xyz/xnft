import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { getCache } from '../../utils/localStorage';
import type { SerializedXnftWithMetadata, XnftWithMetadata } from '../../utils/xnft';
import { installedXnfts, ownedXnfts } from '../atoms/xnfts';

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

export function useInstalledXnfts(): XnftWithMetadata[] {
  return useRecoilValue(installedXnfts);
}

export function useOwnedXnfts(): XnftWithMetadata[] {
  return useRecoilValue(ownedXnfts);
}

// export function useInstalledXnfts() {
//   const { publicKey } = useWallet();
//   const [installed, setInstalled] = useState<XnftWithMetadata[]>([]);

//   useEffect(() => {
//     async function run() {
//       try {
//         const response = await xNFT.getInstalled(publicKey);
//         setInstalled(response);
//       } catch (err) {
//         console.error(`useInstalledXnfts: ${err}`);
//       }
//     }
//     if (publicKey) run();
//   }, [publicKey]);

//   return installed;
// }

// export function useOwnedXnfts() {
//   const { publicKey } = useWallet();
//   const [owned, setOwned] = useState<XnftWithMetadata[]>([]);

//   useEffect(() => {
//     async function run() {
//       try {
//         const response = await xNFT.getOwned(publicKey);
//         setOwned(response);
//       } catch (err) {
//         console.error(`useOwnedXnfts: ${err}`);
//       }
//     }
//     if (publicKey) run();
//   }, [publicKey]);

//   return owned;
// }
