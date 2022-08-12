import { AnchorProvider, Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { atom, selector, useRecoilValue } from 'recoil';
import { IDL, type Xnft } from '../../programs/xnft';
import { XNFT_PROGRAM_ID } from '../../utils/constants';
import { anchorWalletState, connectionState } from './solana';

/**
 * Program instance to be derived by the calculated connection
 * and the connected wallet.
 * @export
 */
export const programState = atom<Program<Xnft>>({
  key: 'program',
  dangerouslyAllowMutability: true,
  default: selector({
    key: 'programDefault',
    dangerouslyAllowMutability: true,
    get: ({ get }) => {
      const wallet = get(anchorWalletState);
      const connection = get(connectionState);

      const provider = new AnchorProvider(
        connection,
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
