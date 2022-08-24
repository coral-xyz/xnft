import { atom, type SetterOrUpdater, useRecoilState } from 'recoil';
import {
  APP_ICON_CONSTRAINTS,
  APP_SCREENSHOT_CONSTRAINTS,
  XNFT_KIND_OPTIONS,
  XNFT_TAG_OPTIONS
} from '../../utils/constants';

export type PublishState = typeof defaultPublishState;

const defaultPublishState = {
  title: '',
  description: '',
  publisher: '',
  vault: '',
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
 * Validates that the file received from the icon dropzone
 * is square and meets the minimum size requirement.
 * @param {File} file
 * @returns {Promise<File>}
 */
export function validateAppIcon(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      if (img.width !== img.height) {
        return reject('Icon should have equal width and height');
      } else if (img.width < APP_ICON_CONSTRAINTS[0] || img.width > APP_ICON_CONSTRAINTS[1]) {
        return reject(
          `Icon should be between ${APP_ICON_CONSTRAINTS[0]}x${APP_ICON_CONSTRAINTS[0]} and ${APP_ICON_CONSTRAINTS[1]}x${APP_ICON_CONSTRAINTS[1]}`
        );
      } else {
        return resolve(file);
      }
    });
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Custom input validation for the inputted screenshots.
 * @export
 * @param {File} file
 * @returns {Promise<File>}
 */
export function validateAppScreenshot(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      const longestSide = Math.max(img.height, img.width);
      if (
        longestSide < APP_SCREENSHOT_CONSTRAINTS[0] ||
        longestSide > APP_SCREENSHOT_CONSTRAINTS[1]
      ) {
        return reject(
          `The longest side of the screenshot must be between ${APP_SCREENSHOT_CONSTRAINTS[0]}px and ${APP_SCREENSHOT_CONSTRAINTS[1]}px.`
        );
      } else {
        return resolve(file);
      }
    });
    img.src = URL.createObjectURL(file);
  });
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
    state.icon.name ?? '',
    state.screenshots
  ];

  return checks.every(x => x.length > 0);
}
