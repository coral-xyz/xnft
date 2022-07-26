import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getOwnedXNFTs } from '../utils/xnft';

export default function useOwnedXNFTs() {
  const { publicKey } = useWallet();
  const [ownedXNFTs, setOwnedXNFTs] = useState<any[]>();

  useEffect(() => {
    async function run() {
      const response = await getOwnedXNFTs(publicKey);
      setOwnedXNFTs(response);
    }
    if (publicKey) run();
  }, [publicKey]);

  return { ownedXNFTs };
}
