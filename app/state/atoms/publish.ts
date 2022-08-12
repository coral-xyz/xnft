import { atom, type SetterOrUpdater, useRecoilState } from 'recoil';
import { XNFT_KIND_OPTIONS, XNFT_TAG_OPTIONS } from '../../utils/constants';

export type PublishState = typeof defaultPublishState;

const defaultPublishState = {
  title: '',
  description: '',
  publisher: '',
  website: '',
  bundle: {} as File,
  tag: 'None' as typeof XNFT_TAG_OPTIONS[number],
  kind: 'App' as typeof XNFT_KIND_OPTIONS[number],
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

/**
 * Custom input validation for the uploaded bundle source file.
 * @export
 * @param {PublishState} state
 * @returns {boolean}
 */
export function validateBundleInput(state: PublishState): boolean {
  return (state.bundle.size ?? 0) > 0;
}

/**
 * Custom input validation for the inputted publish details.
 * @export
 * @param {PublishState} state
 * @returns {boolean}
 */
export function validateDetailsInput(state: PublishState): boolean {
  const checks = [
    state.title,
    state.description,
    state.publisher,
    state.tag,
    state.website,
    state.supply,
    state.price,
    state.royalties,
    state.icon.name ?? '',
    state.screenshots
  ];

  return checks.every(x => x.length > 0);
}
