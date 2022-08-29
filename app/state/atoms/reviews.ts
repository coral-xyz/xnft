import { type ProgramAccount } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { selectorFamily, useRecoilValueLoadable } from 'recoil';
import xNFT, { type ReviewAccount } from '../../utils/xnft';
import { programState } from './program';

/**
 * Selector family for fetching the state of the reviews for the
 * argued xNFT program account public key.
 * @export
 */
export const xnftReviewsState = selectorFamily<ProgramAccount<ReviewAccount>[], string>({
  key: 'xnftReviews',
  get:
    (xnft: string) =>
    async ({ get }) => {
      const program = get(programState);
      return await xNFT.getReviews(program, new PublicKey(xnft));
    }
});

/**
 * Custom hook to use the selector family for an argued xNFT account reviews.
 * @export
 * @param {string} xnft
 * @returns {{
 *   reviews: ProgramAccount<ReviewAccount>[];
 *   loading: boolean;
 *   err?: Error;
 * }}
 */
export function useXnftReviewsLoadable(xnft: string): {
  reviews: ProgramAccount<ReviewAccount>[];
  loading: boolean;
  err?: Error;
} {
  const reviews = useRecoilValueLoadable(xnftReviewsState(xnft));

  return {
    reviews: reviews.state === 'hasValue' ? reviews.contents : [],
    loading: reviews.state === 'loading',
    err: reviews.state === 'hasError' ? reviews.contents : undefined
  };
}
