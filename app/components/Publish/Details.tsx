import { PhotographIcon } from '@heroicons/react/outline';
import { memo, useEffect, type FunctionComponent } from 'react';
import type { StepComponentProps } from '../../pages/publish';
import SupplySelect from './SupplySelect';
import Input from './Input';

const numbersOnly = /^\d*$/;

const Details: FunctionComponent<StepComponentProps> = ({ state, dispatch, setNextEnabled }) => {
  useEffect(() => {
    const checks = [
      state.title,
      state.description,
      state.price,
      state.royalties,
      state.icon.name ?? ''
    ];

    if (checks.every(x => x.length > 0)) {
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
        <Input
          id="title"
          type="text"
          name="title"
          value={state.title}
          onChange={val => dispatch({ type: 'field', field: 'title', value: val })}
          required
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
          value={state.description}
          onChange={val =>
            dispatch({
              type: 'field',
              field: 'description',
              value: val
            })
          }
          area
          required
        />
      </div>

      {/* Publisher */}
      <div>
        <label htmlFor="publisher" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Publisher
        </label>
        <Input
          id="publisher"
          type="text"
          name="publisher"
          value={state.publisher}
          onChange={val =>
            dispatch({
              type: 'field',
              field: 'publisher',
              value: val
            })
          }
          required
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          Publisher&apos;s website
        </label>
        <Input
          id="website"
          type="url"
          name="website"
          value={state.website}
          onChange={val =>
            dispatch({
              type: 'field',
              field: 'website',
              value: val
            })
          }
        />
      </div>

      {/* Supply Type */}
      <div>
        <label htmlFor="supply" className="text-sm font-medium tracking-wide text-[#E5E7EB]">
          How many editions would you like to mint?
        </label>
        <SupplySelect value={state.supply} dispatch={dispatch} />
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
          <Input
            id="price"
            type="text"
            name="price"
            className="pr-12 text-right placeholder:text-[#393C43]"
            placeholder="0"
            value={state.price}
            onChange={val => {
              if (numbersOnly.test(val)) {
                dispatch({
                  type: 'field',
                  field: 'price',
                  value: val
                });
              }
            }}
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
          <Input
            id="royalties"
            type="text"
            name="royalties"
            className="pr-7 text-right placeholder:text-[#393C43]"
            placeholder="0"
            value={state.royalties}
            onChange={val => {
              if (numbersOnly.test(val)) {
                dispatch({
                  type: 'field',
                  field: 'royalties',
                  value: val
                });
              }
            }}
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
                  onChange={e =>
                    dispatch({
                      type: 'file',
                      field: 'icon',
                      value: e.target.files[0]
                    })
                  }
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
                  onChange={e =>
                    dispatch({
                      type: 'file',
                      field: 'screenshots',
                      value: e.target.files
                    })
                  }
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
