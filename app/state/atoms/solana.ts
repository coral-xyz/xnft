import { AnchorProvider, Program } from '@project-serum/anchor';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { atom, selector } from 'recoil';
import { IDL, type Xnft } from '../../programs/xnft';
import { XNFT_PROGRAM_ID } from '../../utils/xnft';

const defaultWallet = {
  publicKey: PublicKey.default,
  signAllTransactions: undefined,
  signTransaction: undefined
};

export const connectedWallet = atom<AnchorWallet>({
  key: 'connectedWallet',
  default: undefined
});

export const provider = selector<AnchorProvider>({
  key: 'anchorProviderDefault',
  get: ({ get }) =>
    new AnchorProvider(
      new Connection('https://api.devnet.solana.com', { commitment: 'processed' }),
      get(connectedWallet) ?? defaultWallet,
      { commitment: 'processed' }
    ) // FIXME:
});

export const program = selector<Program<Xnft>>({
  key: 'xnftProgramDefault',
  get: ({ get }) => new Program(IDL, XNFT_PROGRAM_ID, get(provider))
});
