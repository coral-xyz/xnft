import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { fetchOwnedXNFTs } from '../utils/xnft-client';

export default function useOwnedXNFTs() {
  const { publicKey } = useWallet();
  const [ownedXNFTs, setOwnedXNFTs] = useState<any[]>();

  useEffect(() => {
    async function run() {
      const response = await fetchOwnedXNFTs(publicKey);
      setOwnedXNFTs(response);
    }
    if (publicKey) run();
  }, [publicKey]);

  return { ownedXNFTs };
}
