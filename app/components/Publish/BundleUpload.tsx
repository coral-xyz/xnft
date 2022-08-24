import { DocumentAddIcon, DocumentTextIcon } from '@heroicons/react/solid';
import { memo, type FunctionComponent, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import type { StepComponentProps } from '../../pages/publish';
import { usePublish, validateBundleInput } from '../../state/atoms/publish';

/**
 * Convert the file byte size into a user field display.
 * @export
 * @param {number} size
 * @returns {string}
 */
export function transformBundleSize(size: number): string {
  if (size < 1000) {
    return `${size.toString()} B`;
  } else if (size < 1000000) {
    return `${(size / 1000).toFixed(2)} KB`;
  } else {
    return `${(size / 1000000).toFixed(2)} MB`;
  }
}

const BundleUpload: FunctionComponent<StepComponentProps> = ({ setNextEnabled }) => {
  const [publishState, setPublishState] = usePublish();
  const { acceptedFiles, getInputProps, getRootProps } = useDropzone({
    accept: { 'text/javascript': ['.js'] },
    maxFiles: 1
  });

  /**
   * Component effect to handle the acceptances and validation
   * of the bundle source code file selected through the dropzone input.
   */
  useEffect(() => {
    if (acceptedFiles.length > 0) {
      // TODO: validation
      setPublishState(prev => ({ ...prev, bundle: acceptedFiles[0] }));
    }
  }, [acceptedFiles, setPublishState]);

  /**
   * Component effect to process the validation of the input fields
   * every state change in or to determine if the 'Next'
   * button should be enabled for the user to continue the flow.
   */
  useEffect(() => {
    if (validateBundleInput(publishState)) {
      setNextEnabled(true);
    }
  }, [publishState, setNextEnabled]);

  /**
   * Memoized value of the subtext for the bundle dropzone input
   * based on whether a source file has been selected or not.
   */
  const inputSubtext = useMemo(
    () =>
      publishState.bundle.size ? transformBundleSize(publishState.bundle.size) : 'or drag and drop',
    [publishState.bundle]
  );

  return (
    <label {...getRootProps({ htmlFor: 'bundle', className: 'relative cursor-pointer' })}>
      <div className="mt-1 flex justify-center py-16">
        <div className="space-y-1 text-center">
          {publishState.bundle.name ? (
            <DocumentTextIcon height={66} className="mx-auto text-[#9CA3AF]" />
          ) : (
            <DocumentAddIcon height={66} className="mx-auto text-[#9CA3AF]" />
          )}
          <div className="text-sm text-zinc-600">
            <span className="text-sm text-zinc-300">
              {publishState.bundle.name ?? 'Upload an index.js file'}
            </span>
            <input {...getInputProps({ className: 'sr-only hidden' })} />
          </div>
          <p className="text-sm text-[#393C43]">{inputSubtext}</p>
        </div>
      </div>
    </label>
  );
};

export default memo(BundleUpload);
