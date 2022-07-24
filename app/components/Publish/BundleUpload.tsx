import { DocumentAddIcon, DocumentTextIcon } from '@heroicons/react/solid';
import { type Dispatch, memo } from 'react';
import type { UploadDispatchAction, UploadState } from '../../reducers/upload';

function BundleUpload({
  state,
  dispatch
}: {
  state: UploadState;
  dispatch: Dispatch<UploadDispatchAction<'bundle'>>;
}) {
  return (
    <label htmlFor="bundle" className="relative cursor-pointer">
      <div className="mt-1 flex justify-center py-16">
        <div className="space-y-1 text-center">
          {state.bundle.name ? (
            <DocumentTextIcon height={66} className="mx-auto text-zinc-400" />
          ) : (
            <DocumentAddIcon height={66} className="mx-auto text-zinc-400" />
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
              onChange={e =>
                dispatch({
                  type: 'file',
                  field: 'bundle',
                  value: e.target.files[0]
                })
              }
            />
          </div>
          <p className="text-sm text-[#4B5563]">
            {state.bundle.size ? transformBundleSize(state.bundle.size) : 'or drag and drop'}
          </p>
        </div>
      </div>
    </label>
  );
}

function transformBundleSize(size: number): string {
  if (size < 1000) {
    return size.toString();
  } else if (size < 1000000) {
    return `${(size / 1000).toFixed(2)} KB`;
  } else {
    return `${(size / 1000000).toFixed(2)} MB`;
  }
}

export default memo(BundleUpload);
