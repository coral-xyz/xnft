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

// export function useInstalledXNFTs() {
//   const { publicKey } = useWallet();
//   const [installedXNFTs, setInstalledXNFTs] = useState<XnftWithMetadata[]>([]);

//   useEffect(() => {
//     async function run() {
//       try {
//         const response = await getInstalledXnfts(publicKey);
//         setInstalledXNFTs(response);
//       } catch (err) {
//         console.error(`useInstalledXNFTs: ${err}`);
//       }
//     }
//     if (publicKey) run();
//   }, [publicKey]);

//   return { installedXNFTs };
// }

// export function useOwnedXNFTs() {
//   const { publicKey } = useWallet();
//   const [ownedXNFTs, setOwnedXNFTs] = useState<XnftWithMetadata[]>([]);

//   useEffect(() => {
//     async function run() {
//       try {
//         const response = await getOwnedXnfts(publicKey);
//         setOwnedXNFTs(response);
//       } catch (err) {
//         console.error(`useOwnedXNFTs: ${err}`);
//       }
//     }
//     if (publicKey) run();
//   }, [publicKey]);

//   return { ownedXNFTs };
// }
