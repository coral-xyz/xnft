import { AnchorProvider, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { atom, selector, useRecoilValue } from 'recoil';
import { IDL, type Xnft } from '../../programs/xnft';
import { getCache } from '../../utils/localStorage';
import { type SerializedXnftWithMetadata, XNFT_PROGRAM_ID } from '../../utils/xnft';
import { anchorWalletState, connectionUrl } from './solana';

/**
 * Program instance to be derived by the calculated connection URL
 * and the connected wallet.
 */
export const programState = atom<Program<Xnft>>({
  key: 'program',
  dangerouslyAllowMutability: true,
  default: selector({
    key: 'programDefault',
    dangerouslyAllowMutability: true,
    get: ({ get }) => {
      const wallet = get(anchorWalletState);
      const provider = new AnchorProvider(
        new Connection(get(connectionUrl), { commitment: 'confirmed' }),
        wallet ?? {
          publicKey: PublicKey.default,
          signTransaction: undefined,
          signAllTransactions: undefined
        },
        {}
      );

      return new Program(IDL, XNFT_PROGRAM_ID, provider);
    }
  })
});

/**
 * Custom hook to use the `programState` recoil atom.
 * @export
 * @returns {Program<Xnft>}
 */
export function useProgram(): Program<Xnft> {
  return useRecoilValue(programState);
}

/**
 * Custom hook to get the xNFTs that are cached in local storage.
 * @export
 * @returns {{ isLoading: boolean; cachedXNFTs: SerializedXnftWithMetadata[] }}
 */
export function useCachedXNFTs(): {
  isLoading: boolean;
  cachedXNFTs: SerializedXnftWithMetadata[];
} {
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
