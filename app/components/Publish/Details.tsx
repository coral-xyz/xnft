import { PhotographIcon } from '@heroicons/react/outline';
import { type KeyboardEvent, memo, useEffect, type FunctionComponent } from 'react';
import type { StepComponentProps } from '../../pages/publish';
import SupplySelect from './SupplySelect';

const inputClasses = `focus:border-[#F66C5E] border-[#18181B] bg-[#18181B]
  text-[#E5E7EB] w-full rounded-md text-sm focus:ring-0 placeholder:text-[#393C43]`;

function blockSpecialNumericals(e: KeyboardEvent) {
  if (['+', '-', 'e'].includes(e.key)) {
    e.preventDefault();
  }
}

const Details: FunctionComponent<StepComponentProps> = ({ state, setState, setNextEnabled }) => {
  useEffect(() => {
    const checks = [
      state.title,
      state.description,
      state.publisher,
      state.website,
      state.supply,
      state.price,
      state.royalties,
      state.icon.name ?? '',
      state.screenshots
    ];

    if (checks.every(x => x.length > 0) && parseFloat(state.royalties) <= 100) {
      setNextEnabled(true);
    }
  }, [state, setNextEnabled]);

  return (
    <div className="flex flex-col gap-4 px-16 py-14">
      {/* Title */}
      <div>
        <label htmlFor="title" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Title
        </label>
        <input
          required
          id="title"
          name="title"
          className={inputClasses}
          type="text"
          value={state.title}
          onChange={e => setState(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={`${inputClasses} resize-none`}
          rows={5}
          value={state.description}
          onChange={e => setState(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Publisher */}
      <div>
        <label htmlFor="publisher" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Publisher
        </label>
        <input
          required
          id="publisher"
          name="publisher"
          className={inputClasses}
          type="text"
          placeholder="3f1Ypov9Lv1Lmr4arkjY2fTMHcj4dRWP7BcpiDW6PTe3"
          value={state.publisher}
          onChange={e => setState(prev => ({ ...prev, publisher: e.target.value }))}
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Publisher&apos;s website
        </label>
        <input
          id="website"
          name="website"
          className={inputClasses}
          type="url"
          placeholder="https://example.com"
          value={state.website}
          onChange={e => setState(prev => ({ ...prev, website: e.target.value }))}
        />
      </div>

      {/* Supply Type */}
      <div>
        <label htmlFor="supply" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          How many editions would you like to mint?
        </label>
        <SupplySelect
          inputClasses={`${inputClasses.replace('border-[#18181B]', 'border-[#393C43]')} mt-4`}
          setState={setState}
          value={state.supply}
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Price
        </label>
        <label className="relative block">
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-sm text-[#393C43]">
            SOL
          </span>
          <input
            required
            id="price"
            name="price"
            type="number"
            className={`${inputClasses} pr-12 text-right`}
            placeholder="0"
            value={state.price}
            onKeyDown={blockSpecialNumericals}
            onChange={e => setState(prev => ({ ...prev, price: e.target.value }))}
          />
        </label>
      </div>

      {/* Royalties */}
      <div>
        <label htmlFor="royalties" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Royalties
        </label>
        <label className="relative block">
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-sm text-[#393C43]">
            %
          </span>
          <input
            required
            id="royalties"
            name="royalties"
            type="number"
            className={`${inputClasses} pr-7 text-right`}
            placeholder="0"
            value={state.royalties}
            onKeyDown={blockSpecialNumericals}
            onChange={e => setState(prev => ({ ...prev, royalties: e.target.value }))}
          />
        </label>
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
        <label htmlFor="icon" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-[#393C43] px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <div className="text-sm text-[#393C43]">
                <span className="text-[#E5E7EB]">
                  {state.icon.name ?? (
                    <>
                      <span className="text-[#F66C5E]">Upload a file</span> or drag and drop
                    </>
                  )}
                </span>
                <input
                  required
                  id="icon"
                  name="icon"
                  type="file"
                  accept="image/*"
                  className="sr-only hidden"
                  onChange={e => setState(prev => ({ ...prev, icon: e.target.files[0] }))}
                />
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
        <label htmlFor="screenshots" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-[#393C43] px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <div className="text-sm text-[#393C43]">
                <span className="text-[#E5E7EB]">
                  <span className="text-[#F66C5E]">Upload a file</span> or drag and drop
                </span>
                <input
                  required
                  id="screenshots"
                  name="screenshots"
                  type="file"
                  accept="image/*"
                  className="sr-only hidden"
                  onChange={e => setState(prev => ({ ...prev, screenshots: e.target.files }))}
                />
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
