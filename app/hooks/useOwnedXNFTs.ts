import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getOwnedXNFTs, type XnftWithMetadata } from '../utils/xnft';

export default function useOwnedXNFTs() {
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
