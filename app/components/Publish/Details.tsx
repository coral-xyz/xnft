import { PhotographIcon } from '@heroicons/react/outline';
import dynamic from 'next/dynamic';
import { memo, useEffect, type FunctionComponent } from 'react';
import { useDropzone } from 'react-dropzone';
import type { StepComponentProps } from '../../pages/publish';
import { usePublish } from '../../state/atoms/publish';
import { XNFT_TAG_OPTIONS } from '../../utils/xnft';
import { inputClasses } from '../Inputs/Input';

const Input = dynamic(() => import('../Inputs/Input'));
const InputWIthSuffix = dynamic(() => import('../Inputs/InputWIthSuffix'));
const SupplySelect = dynamic(() => import('./SupplySelect'));

const priceRx = /^\d*(\.\d{0,5})?$/;
const royaltyRx = /^\d*(\.\d{0,2})?$/;

function getNameList(screenshots: File[]): string {
  return screenshots.map(s => s.name).join(', ');
}

const Details: FunctionComponent<StepComponentProps> = ({ setNextEnabled }) => {
  const [publishState, setPublishState] = usePublish();
  const iconDrop = useDropzone({ accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, maxFiles: 1 });
  const ssDrop = useDropzone({ accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple: true });

  useEffect(() => {
    if (iconDrop.acceptedFiles.length > 0) {
      setPublishState(prev => ({ ...prev, icon: iconDrop.acceptedFiles[0] }));
    }
  }, [iconDrop.acceptedFiles, setPublishState]);

  useEffect(() => {
    if (ssDrop.acceptedFiles.length > 0) {
      setPublishState(prev => ({ ...prev, screenshots: ssDrop.acceptedFiles }));
    }
  }, [ssDrop.acceptedFiles, setPublishState]);

  useEffect(() => {
    const checks = [
      publishState.title,
      publishState.description,
      publishState.publisher,
      publishState.tag,
      publishState.website,
      publishState.supply,
      publishState.price,
      publishState.royalties,
      publishState.icon.name ?? '',
      publishState.screenshots
    ];

    if (checks.every(x => x.length > 0)) {
      setNextEnabled(true);
    }
  }, [publishState, setNextEnabled]);

  return (
    <div className="flex flex-col gap-4 px-16 py-14">
      {/* Title */}
      <div>
        <label htmlFor="title" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Title
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          value={publishState.title}
          onChange={e => setPublishState(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
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
        <label htmlFor="publisher" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Publisher
        </label>
        <Input
          id="publisher"
          name="publisher"
          type="text"
          placeholder="3f1Ypov9Lv1Lmr4arkjY2fTMHcj4dRWP7BcpiDW6PTe3"
          value={publishState.publisher}
          onChange={e => setPublishState(prev => ({ ...prev, publisher: e.target.value }))}
        />
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
          {XNFT_TAG_OPTIONS.map((o, idx) => (
            <option key={idx} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
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
        <label htmlFor="supply" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
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
            if (priceRx.test(e.target.value))
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
              royaltyRx.test(e.target.value) &&
              (parseFloat(e.target.value) <= 100 || e.target.value === '')
            )
              setPublishState(prev => ({ ...prev, royalties: e.target.value }));
          }}
        />
        <div className="max-w-sm">
          <span className="text-sm text-[#9CA3AF]">
            Royalties are payments earned on every secondary sale and are paid to the mint address
            in perpetuity.
          </span>
        </div>
      </div>

      {/* App Icon */}
      <div>
        <label htmlFor="icon" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          App Icon
        </label>
        <label
          {...iconDrop.getRootProps({ htmlFor: 'icon', className: 'relative cursor-pointer' })}
        >
          <div className="mt-1 flex justify-center rounded-md border-2 border-[#393C43] px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-zinc-400" />
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
              <p className="text-xs text-[#393C43]">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </label>
      </div>

      {/* Screenshots */}
      <div>
        <label htmlFor="screenshots" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Screenshots
        </label>
        <label
          {...ssDrop.getRootProps({ htmlFor: 'screenshots', className: 'relative cursor-pointer' })}
        >
          <div className="mt-1 flex justify-center rounded-md border-2 border-[#393C43] px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <div className="text-sm text-[#393C43]">
                <span className="text-[#E5E7EB]">
                  {publishState.screenshots.length > 0 ? (
                    getNameList(publishState.screenshots)
                  ) : (
                    <>
                      <span className="text-[#F66C5E]">Upload a file(s)</span> or drag and drop
                    </>
                  )}
                </span>
                <input {...ssDrop.getInputProps({ className: 'sr-only hidden' })} />
              </div>
              <p className="text-xs text-[#393C43]">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default memo(Details);
