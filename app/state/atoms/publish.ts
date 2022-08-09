import { atom, type SetterOrUpdater, useRecoilState } from 'recoil';
import { XNFT_TAG_OPTIONS } from '../../utils/xnft';

export type PublishState = typeof defaultPublishState;

export const priceRx = /^\d*(\.\d{0,5})?$/;
export const royaltyRx = /^\d*(\.\d{0,2})?$/;

const defaultPublishState = {
  title: '',
  description: '',
  publisher: '',
  website: '',
  bundle: {} as File,
  tag: 'None' as typeof XNFT_TAG_OPTIONS[number],
  royalties: '',
  price: '',
  supply: 'inf',
  icon: {} as File,
  screenshots: [] as File[]
};

/**
 * State to track the inputted values for a new xNFT during the publish flow.
 * @export
 */
export const publishState = atom<PublishState>({
  key: 'publishState',
  default: defaultPublishState
});

/**
 * Custom hook to use and mutate the publish input atom state.
 * @export
 * @returns {[PublishState, SetterOrUpdater<PublishState>]}
 */
export function usePublish(): [PublishState, SetterOrUpdater<PublishState>] {
  return useRecoilState(publishState);
}
