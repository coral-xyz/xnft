import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { atom, selector, type SetterOrUpdater, useRecoilState } from 'recoil';
import xNFT, { type XnftWithMetadata } from '../../utils/xnft';

/**
 * Manages the state of which xNFT has been selected for
 * auxiliary action purposes.
 */
const focusXnftState = atom<XnftWithMetadata>({
  key: 'editXnft',
  default: undefined
});

/**
 * Custom hook to use the focused xNFT recoil state.
 * @export
 * @returns {([
 *   XnftWithMetadata | undefined,
 *   SetterOrUpdater<XnftWithMetadata | undefined>
 * ])}
 */
export function useXnftFocus(): [
  XnftWithMetadata | undefined,
  SetterOrUpdater<XnftWithMetadata | undefined>
] {
  return useRecoilState(focusXnftState);
}

export type XnftEdits = {
  bundle: File;
  installVault: string;
  name: string;
  price: string;
  tag: string;
  uri: string;
};

/**
 * State to track derive and track the metadata and property
 * edits for the focused xNFT from the edits modal.
 * @export
 */
export const xnftEditsState = atom<XnftEdits>({
  key: 'xnftEdits',
  default: selector({
    key: 'xnftEditsDefault',
    get: ({ get }) => {
      const xnft = get(focusXnftState);
      return {
        bundle: {} as File,
        installVault: xnft ? xnft.account.installVault.toBase58() : '',
        name: xnft ? xnft.account.name : '',
        price: xnft ? (xnft.account.installPrice.toNumber() / LAMPORTS_PER_SOL).toString() : '',
        tag: xNFT.tagName(xnft ? xnft.account.tag : { none: {} }),
        uri: xnft ? xnft.metadataAccount.data.uri : ''
      };
    }
  })
});

/**
 * Custom hook to use the xNFT edits recoil state.
 * @export
 */
export function useXnftEdits() {
  return useRecoilState(xnftEditsState);
}
