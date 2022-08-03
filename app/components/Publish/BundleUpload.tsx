import { DocumentAddIcon, DocumentTextIcon } from '@heroicons/react/solid';
import { memo, type FunctionComponent, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import type { StepComponentProps } from '../../pages/publish';

function transformBundleSize(size: number): string {
  if (size < 1000) {
    return size.toString();
  } else if (size < 1000000) {
    return `${(size / 1000).toFixed(2)} KB`;
  } else {
    return `${(size / 1000000).toFixed(2)} MB`;
  }
}

const BundleUpload: FunctionComponent<StepComponentProps> = ({
  state,
  setState,
  setNextEnabled
}) => {
  const { acceptedFiles, getInputProps, getRootProps } = useDropzone({
    accept: { 'text/javascript': ['.js'] },
    maxFiles: 1
  });

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      setState(prev => ({ ...prev, bundle: acceptedFiles[0] }));
      setNextEnabled(true);
    }
  }, [acceptedFiles]);

  return (
    <label {...getRootProps({ htmlFor: 'bundle', className: 'relative cursor-pointer' })}>
      <div className="mt-1 flex justify-center py-16">
        <div className="space-y-1 text-center">
          {state.bundle.name ? (
            <DocumentTextIcon height={66} className="mx-auto text-[#9CA3AF]" />
          ) : (
            <DocumentAddIcon height={66} className="mx-auto text-[#9CA3AF]" />
          )}
          <div className="text-sm text-zinc-600">
            <span className="text-sm text-zinc-300">
              {state.bundle.name ?? 'Upload a bundle.js file'}
            </span>
            <input
              {...getInputProps({
                className: 'sr-only hidden'
              })}
            />
          </div>
          <p className="text-sm text-[#393C43]">
            {state.bundle.size ? transformBundleSize(state.bundle.size) : 'or drag and drop'}
          </p>
        </div>
      </div>
    </label>
  );
};

export default memo(BundleUpload);
