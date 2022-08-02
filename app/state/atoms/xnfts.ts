import { atom, selector } from 'recoil';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';
import { wallet } from './solana';

export const installedXnfts = atom<XnftWithMetadata[]>({
  key: 'installedXnfts',
  default: selector({
    key: 'installedXnftsDefault',
    get: async ({ get }) => {
      const walletValue = get(wallet);
      return walletValue ? xNFT.getInstalled(walletValue.publicKey) : [];
    }
  })
});

export const ownedXnfts = atom<XnftWithMetadata[]>({
  key: 'ownedXnfts',
  default: selector({
    key: 'ownedXnftsDefault',
    get: async ({ get }) => {
      const walletValue = get(wallet);
      return walletValue ? xNFT.getOwned(walletValue.publicKey) : [];
    }
  })
});
