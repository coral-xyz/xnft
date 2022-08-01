import { DocumentAddIcon, DocumentTextIcon } from '@heroicons/react/solid';
import { type ChangeEvent, memo, useCallback, type FunctionComponent } from 'react';
import { useRecoilState } from 'recoil';
import type { StepComponentProps } from '../../pages/publish';
import { uploadDetails } from '../../state/atoms/publish';

function transformBundleSize(size: number): string {
  if (size < 1000) {
    return size.toString();
  } else if (size < 1000000) {
    return `${(size / 1000).toFixed(2)} KB`;
  } else {
    return `${(size / 1000000).toFixed(2)} MB`;
  }
}

const BundleUpload: FunctionComponent<StepComponentProps> = ({ setNextEnabled }) => {
  const [state, setState] = useRecoilState(uploadDetails);

  const handleUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setState(prev => ({ ...prev, bundle: e.currentTarget.files[0] }));
      setNextEnabled(true);
    },
    [setState, setNextEnabled]
  );

  return (
    <label htmlFor="bundle" className="relative cursor-pointer">
      <div className="mt-1 flex justify-center py-16">
        <div className="space-y-1 text-center">
          {state.bundle.name ? (
            <DocumentTextIcon height={66} className="text-theme-font-gray mx-auto" />
          ) : (
            <DocumentAddIcon height={66} className="text-theme-font-gray mx-auto" />
          )}
          <div className="text-sm text-zinc-600">
            <span className="text-sm text-zinc-300">
              {state.bundle.name ?? 'Upload a bundle.js file'}
            </span>
            <input
              required
              id="bundle"
              name="bundle"
              accept=".js"
              type="file"
              className="sr-only hidden"
              onChange={handleUpload}
            />
          </div>
          <p className="text-theme-font-gray-dark text-sm">
            {state.bundle.size ? transformBundleSize(state.bundle.size) : 'or drag and drop'}
          </p>
        </div>
      </div>
    </label>
  );
};

export default memo(BundleUpload);
