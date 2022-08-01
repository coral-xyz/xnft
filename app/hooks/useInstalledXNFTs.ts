import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getInstalledXNFTs, type XnftWithMetadata } from '../utils/xnft';

export default function useInstalledXNFTs() {
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
