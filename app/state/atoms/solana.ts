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

export const wallet = atom<AnchorWallet>({
  key: 'anchorWallet',
  default: undefined
});

export const provider = atom<AnchorProvider>({
  key: 'anchorProvider',
  default: selector({
    key: 'anchorProviderDefault',
    get: ({ get }) =>
      new AnchorProvider(
        new Connection('https://api.devnet.solana.com', { commitment: 'processed' }),
        get(wallet) ?? defaultWallet,
        { commitment: 'processed' }
      ) // FIXME:
  })
});

export const program = atom<Program<Xnft>>({
  key: 'xnftProgram',
  default: selector({
    key: 'xnftProgramDefault',
    get: ({ get }) => new Program(IDL, XNFT_PROGRAM_ID, get(provider))
  })
});
