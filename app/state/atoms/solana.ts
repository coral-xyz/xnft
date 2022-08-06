import { AnchorProvider, Program } from '@project-serum/anchor';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { atom, selector } from 'recoil';
import { IDL, type Xnft } from '../../programs/xnft';
import { XNFT_PROGRAM_ID } from '../../utils/xnft';

export const connectionUrl = atom<string>({
  key: 'connectionUrl',
  default: process.env.NEXT_PUBLIC_CONNECTION
});

export const anchorWalletState = atom<AnchorWallet>({
  key: 'anchorWallet',
  default: undefined
});

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
