export type UploadState = typeof uploadInitialState;
export type UploadDispatchAction<K extends keyof UploadState> = {
  type: 'field' | 'file' | 'reset';
  field: K;
  value: UploadState[K];
};

export const uploadInitialState = {
  title: '',
  description: '',
  publisher: '',
  website: '',
  discord: '',
  twitter: '',
  bundle: {} as File,
  royalties: '',
  price: '',
  supply: 'inf',
  icon: {} as File,
  screenshots: {} as FileList,
  s3UrlBundle: '',
  s3UrlIcon: '',
  s3UrlScreenshots: '',
  s3UrlMetadata: ''
};

export function uploadReducer<K extends keyof UploadState>(
  state: UploadState,
  action: UploadDispatchAction<K>
) {
  switch (action.type) {
    case 'field': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 'file': {
      return {
        ...state,
        [action.field]: action.value
      };
    }
    case 'reset': {
      return uploadInitialState;
    }
  }
}
