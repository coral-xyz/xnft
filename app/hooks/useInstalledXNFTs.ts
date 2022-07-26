import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getInstalledXNFTs } from '../utils/xnft';

export default function useInstalledXNFTs() {
  const { publicKey } = useWallet();
  const [installedXNFTs, setInstalledXNFTs] = useState<any[]>();

  useEffect(() => {
    async function run() {
      const response = await getInstalledXNFTs(publicKey);
      setInstalledXNFTs(response);
    }
    if (publicKey) run();
  }, [publicKey]);

  return { installedXNFTs };
}
