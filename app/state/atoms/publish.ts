import { atom } from 'recoil';
import { XNFT_TAG_OPTIONS } from '../../utils/xnft';

export type PublishState = typeof defaultPublishState;

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

export const publishState = atom<PublishState>({
  key: 'publishState',
  default: defaultPublishState
});
