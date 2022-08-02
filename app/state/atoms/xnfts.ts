import { selector } from 'recoil';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';
import { connectedWallet } from './solana';

export const installedXnfts = selector<XnftWithMetadata[]>({
  key: 'installedXnfts',
  get: ({ get }) => {
    const walletValue = get(connectedWallet);
    return walletValue ? xNFT.getInstalled(walletValue.publicKey) : [];
  }
});

export const ownedXnfts = selector<XnftWithMetadata[]>({
  key: 'ownedXnfts',
  get: ({ get }) => {
    const walletValue = get(connectedWallet);
    return walletValue ? xNFT.getOwned(walletValue.publicKey) : [];
  }
});
