import { PhotoIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import NextImage from 'next/image';
import { memo, useEffect, useMemo, useState, type FunctionComponent } from 'react';
import { useDropzone } from 'react-dropzone';
import type { StepComponentProps } from '../../pages/publish';
import {
  usePublish,
  validateAppIcon,
  validateAppScreenshot,
  validateDetailsInput
} from '../../state/atoms/publish';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_NAME_LENGTH,
  PLACEHOLDER_PUBKEY,
  PRICE_RX,
  ROYALTY_RX,
  XNFT_KIND_OPTIONS,
  XNFT_TAG_OPTIONS
} from '../../utils/constants';
import { inputClasses } from '../Inputs/Input';

const Input = dynamic(() => import('../Inputs/Input'));
const InputWIthSuffix = dynamic(() => import('../Inputs/InputWIthSuffix'));
const SupplySelect = dynamic(() => import('./SupplySelect'));

/**
 * Array of components for all kind select field options.
 */
const kindOptions = XNFT_KIND_OPTIONS.map(o => (
  <option key={o} value={o}>
    {o}
  </option>
));

/**
 * Array of components for all tag select field options.
 */
const tagOptions = XNFT_TAG_OPTIONS.map(o => (
  <option key={o} value={o}>
    {o}
  </option>
));

/**
 * Gets the image dimensions from the argued file and
 * returns as [width, height].
 * @export
 * @param {File} f
 * @returns {Promise<[number, number]>}
 */
export async function getImageDimensions(f: File): Promise<[number, number]> {
  return new Promise(resolve => {
    const img = new Image();
    img.addEventListener('load', () => {
      return resolve([img.width, img.height]);
    });
    img.src = URL.createObjectURL(f);
  });
}

const Details: FunctionComponent<StepComponentProps> = ({ setNextEnabled }) => {
  const [publishState, setPublishState] = usePublish();
  const iconDrop = useDropzone({ accept: ALLOWED_IMAGE_TYPES, maxFiles: 1 });
  const ssDrop = useDropzone({ accept: ALLOWED_IMAGE_TYPES, multiple: true });
  const [iconDimensions, setIconDimensions] = useState('');
  const [ssDimensions, setSSDimensions] = useState<string[]>([]);

  /**
   * Component effect to handle the acceptance and validation
   * of the selected app icon file through the dropzone input.
   */
  useEffect(() => {
    if (iconDrop.acceptedFiles.length > 0) {
      validateAppIcon(iconDrop.acceptedFiles[0])
        .then(file => setPublishState(prev => ({ ...prev, icon: file })))
        .catch(alert);
    }
  }, [iconDrop.acceptedFiles, setPublishState]);

  /**
   * Component effect to generate the app icon dimensions for the
   * subtext of the dropzone when an image is selected.
   */
  useEffect(() => {
    if (publishState.icon.name) {
      getImageDimensions(publishState.icon)
        .then(dims => setIconDimensions(dims.join('x')))
        .catch(console.error);
    }
  }, [publishState.icon]);

  /**
   * Component effect to handle the acceptance and validation
   * of all screenshot files selected through the dropzone input.
   */
  useEffect(() => {
    if (ssDrop.acceptedFiles.length > 0) {
      Promise.all(
        ssDrop.acceptedFiles.map(f =>
          validateAppScreenshot(f).catch(err => alert(`${f.name}: ${err}`))
        )
      ).then(async files => {
        const screenshots = files.filter(f => f) as File[];
        setPublishState(prev => ({ ...prev, screenshots }));
      });
    }
  }, [ssDrop.acceptedFiles, setPublishState]);

  /**
   * Component effect to generate the array of screenshot dimensions for the
   * subtext of the dropzone when images are selected.
   */
  useEffect(() => {
    if (publishState.screenshots.length > 0) {
      Promise.all(publishState.screenshots.map(getImageDimensions))
        .then(dims => setSSDimensions(dims.map(d => d.join('x'))))
        .catch(console.error);
    }
  }, [publishState.screenshots]);

  /**
   * Component effect to process the validation of all input fields
   * in the form every state change in or to determine if the 'Next'
   * button should be enabled for the user to continue the flow.
   */
  useEffect(() => {
    if (validateDetailsInput(publishState)) {
      setNextEnabled(true);
    }
  }, [publishState, setNextEnabled]);

  /**
   * Memoized value for the icon/image preview in the app icon
   * dropzone section of the form based on the selected file.
   */
  const iconPreview = useMemo(
    () =>
      publishState.icon.name ? (
        <NextImage
          className="rounded-md"
          src={URL.createObjectURL(publishState.icon)}
          height={48}
          width={48}
        />
      ) : (
        <PhotoIcon className="mx-auto text-zinc-400" height={48} />
      ),
    [publishState.icon]
  );

  /**
   * Memoizd value for how many characters are remaining that can be
   * used in the inputted name for the new xNFT.
   */
  const nameCharsLeft = useMemo(
    () => MAX_NAME_LENGTH - publishState.title.length,
    [publishState.title]
  );

  return (
    <section className="flex flex-col gap-4 px-16 py-14">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          Title
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          maxLength={MAX_NAME_LENGTH}
          value={publishState.title}
          onChange={e => setPublishState(prev => ({ ...prev, title: e.target.value }))}
        />
        <span className="float-right pt-1 text-xs text-[#9CA3AF]">
          {nameCharsLeft} characters left
        </span>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          Description
        </label>
        <Input
          id="description"
          name="description"
          rows={5}
          value={publishState.description}
          onChange={e => setPublishState(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Publisher */}
      <div>
        <label
          htmlFor="publisher"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          Publisher
        </label>
        <Input
          id="publisher"
          name="publisher"
          type="text"
          spellCheck={false}
          placeholder={PLACEHOLDER_PUBKEY}
          value={publishState.publisher}
          onChange={e => setPublishState(prev => ({ ...prev, publisher: e.target.value }))}
        />
      </div>

      {/* Install Vault */}
      <div>
        <label htmlFor="vault" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Install Vault
        </label>
        <Input
          id="vault"
          name="vault"
          type="text"
          spellCheck={false}
          placeholder={publishState.publisher}
          value={publishState.vault}
          onChange={e => setPublishState(prev => ({ ...prev, vault: e.target.value }))}
        />
        <div className="max-w-md">
          <span className="text-sm text-[#9CA3AF]">
            An xNFT install vault is the address that receives payments (if any) for installation.
            It will default to the publisher address.
          </span>
        </div>
      </div>

      {/* Kind */}
      <div>
        <label
          htmlFor="kind"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          Kind
        </label>
        <select
          id="kind"
          name="kind"
          className={inputClasses}
          value={publishState.kind}
          onChange={e =>
            setPublishState(prev => ({
              ...prev,
              kind: e.target.value as typeof XNFT_KIND_OPTIONS[number]
            }))
          }
        >
          {kindOptions}
        </select>
      </div>

      {/* Tag */}
      <div>
        <label htmlFor="tag" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Tag
        </label>
        <select
          id="tag"
          name="tag"
          className={inputClasses}
          value={publishState.tag}
          onChange={e =>
            setPublishState(prev => ({
              ...prev,
              tag: e.target.value as typeof XNFT_TAG_OPTIONS[number]
            }))
          }
        >
          {tagOptions}
        </select>
      </div>

      {/* Website */}
      <div>
        <label
          htmlFor="website"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          Publisher&apos;s website
        </label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://example.com"
          value={publishState.website}
          onChange={e => setPublishState(prev => ({ ...prev, website: e.target.value }))}
        />
      </div>

      {/* Supply Type */}
      <div>
        <label
          htmlFor="supply"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          How many editions would you like to mint?
        </label>
        <SupplySelect value={publishState.supply} />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Price
        </label>
        <InputWIthSuffix
          id="price"
          name="price"
          type="number"
          className="pr-12 text-right"
          suffix="SOL"
          placeholder="0"
          value={publishState.price}
          forbiddenChars={['+', '-', 'e']}
          onChange={e => {
            if (PRICE_RX.test(e.target.value))
              setPublishState(prev => ({ ...prev, price: e.target.value }));
          }}
        />
      </div>

      {/* Royalties */}
      <div>
        <label htmlFor="royalties" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Royalties
        </label>
        <InputWIthSuffix
          id="royalties"
          name="royalties"
          type="number"
          className="pr-7 text-right"
          suffix="%"
          placeholder="0"
          value={publishState.royalties}
          forbiddenChars={['+', '-', 'e']}
          onChange={e => {
            if (
              ROYALTY_RX.test(e.target.value) &&
              (parseFloat(e.target.value) <= 100 || e.target.value === '')
            )
              setPublishState(prev => ({ ...prev, royalties: e.target.value }));
          }}
        />
        <div className="max-w-md">
          <span className="text-sm text-[#9CA3AF]">
            Royalties are payments earned on every secondary sale and are paid to the mint address
            in perpetuity.
          </span>
        </div>
      </div>

      {/* App Icon */}
      <div>
        <label
          htmlFor="icon"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          App Icon
        </label>
        <label
          {...iconDrop.getRootProps({ htmlFor: 'icon', className: 'relative cursor-pointer' })}
        >
          <div className="mt-1 flex justify-center rounded-md border-2 border-[#393C43] px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              {iconPreview}
              <div className="text-sm text-[#393C43]">
                <span className="text-[#E5E7EB]">
                  {publishState.icon.name ?? (
                    <>
                      <span className="text-[#F66C5E]">Upload a file</span> or drag and drop
                    </>
                  )}
                </span>
                <input {...iconDrop.getInputProps({ className: 'sr-only hidden' })} />
              </div>
              <p className="text-xs text-[#9CA3AF]/50">
                {iconDimensions !== '' ? iconDimensions : 'PNG, JPG, GIF up to 10MB'}
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Screenshots */}
      <div>
        <label
          htmlFor="screenshots"
          className="text-sm font-medium tracking-wide text-[#E5E7EB] after:ml-1 after:text-red-500 after:content-['*']"
        >
          Screenshots
        </label>
        <label
          {...ssDrop.getRootProps({ htmlFor: 'screenshots', className: 'relative cursor-pointer' })}
        >
          <div className="mt-1 flex justify-center rounded-md border-2 border-[#393C43] px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <div className="text-sm text-[#393C43]">
                <span className="text-[#E5E7EB]">
                  {publishState.screenshots.length > 0 ? (
                    publishState.screenshots.map(s => s.name).join(', ')
                  ) : (
                    <>
                      <span className="text-[#F66C5E]">Upload a file(s)</span> or drag and drop
                    </>
                  )}
                </span>
                <input {...ssDrop.getInputProps({ className: 'sr-only hidden' })} />
              </div>
              <p className="text-xs text-[#9CA3AF]/50">
                {ssDimensions.length > 0 ? ssDimensions.join(', ') : 'PNG, JPG, GIF up to 10MB'}
              </p>
            </div>
          </div>
        </label>
      </div>
    </section>
  );
};

export default memo(Details);
