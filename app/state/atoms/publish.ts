import { atom } from 'recoil';

const defaultUploadState = {
  title: '',
  description: '',
  publisher: '',
  website: '',
  bundle: {} as File,
  royalties: '',
  price: '',
  supply: 'inf',
  icon: {} as File,
  screenshots: {} as FileList
  // s3UrlBundle: '',
  // s3UrlIcon: '',
  // s3UrlScreenshots: [] as string[],
  // s3UrlMetadata: ''
};

export type UploadState = typeof defaultUploadState;

export const uploadDetails = atom<UploadState>({
  key: 'uploadDetails',
  default: defaultUploadState
});
