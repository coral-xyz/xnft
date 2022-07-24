import { PhotographIcon } from '@heroicons/react/outline';
import { type Dispatch, memo } from 'react';
import type { UploadDispatchAction, UploadState } from '../../reducers/upload';
import SupplySelect from './SupplySelect';

const numbersOnly = /^\d*$/;

function Details({
  state,
  dispatch
}: {
  state: UploadState;
  dispatch: Dispatch<UploadDispatchAction<Exclude<keyof UploadState, 'bundle'>>>;
}) {
  return (
    <div className="flex flex-col gap-4 px-16 py-14">
      {/* Title */}
      <div>
        <label htmlFor="title" className="text-sm font-medium tracking-wide text-zinc-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          name="title"
          className="focus:border-theme-primary w-full rounded-md border-zinc-900 bg-zinc-900 text-sm text-zinc-300 focus:ring-0"
          value={state.title}
          onChange={e =>
            dispatch({
              type: 'field',
              field: 'title',
              value: e.currentTarget.value
            })
          }
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-sm font-medium tracking-wide text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="focus:border-theme-primary w-full rounded-md border-zinc-900 bg-zinc-900 text-sm text-zinc-300 focus:ring-0"
          value={state.description}
          onChange={e =>
            dispatch({
              type: 'field',
              field: 'description',
              value: e.currentTarget.value
            })
          }
          required
        />
      </div>

      {/* Publisher */}
      <div>
        <label htmlFor="publisher" className="text-sm font-medium tracking-wide text-zinc-300">
          Publisher
        </label>
        <input
          id="publisher"
          type="text"
          name="publisher"
          className="focus:border-theme-primary w-full rounded-md border-zinc-900 bg-zinc-900 text-sm text-zinc-300 focus:ring-0"
          value={state.publisher}
          onChange={e =>
            dispatch({
              type: 'field',
              field: 'publisher',
              value: e.currentTarget.value
            })
          }
          required
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="text-sm font-medium tracking-wide text-zinc-300">
          Publisher&apos;s website
        </label>
        <input
          id="website"
          type="url"
          name="website"
          className="focus:border-theme-primary w-full rounded-md border-zinc-900 bg-zinc-900 text-sm text-zinc-300 focus:ring-0"
          value={state.website}
          onChange={e =>
            dispatch({
              type: 'field',
              field: 'website',
              value: e.currentTarget.value
            })
          }
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="text-sm font-medium tracking-wide text-zinc-300">
          Price
        </label>
        <label className="relative block">
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-500">
            SOL
          </span>
          <input
            id="price"
            type="text"
            name="price"
            className="focus:border-theme-primary block w-full rounded-md border-zinc-900 bg-zinc-900 pr-12 text-right text-sm text-zinc-300 focus:ring-0"
            placeholder="0"
            value={state.price}
            onChange={e => {
              if (numbersOnly.test(e.currentTarget.value)) {
                dispatch({
                  type: 'field',
                  field: 'price',
                  value: e.currentTarget.value
                });
              }
            }}
          />
        </label>
      </div>

      {/* Supply Type */}
      <div>
        <label htmlFor="supply" className="text-sm font-medium tracking-wide text-zinc-300">
          How many editions would you like to mint?
        </label>
        <SupplySelect value={state.supply} dispatch={dispatch} />
      </div>

      {/* Royalties */}
      <div>
        <label htmlFor="royalties" className="text-sm font-medium tracking-wide text-zinc-300">
          Royalties
        </label>
        <label className="relative block">
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-500">%</span>
          <input
            id="royalties"
            type="text"
            name="royalties"
            className="focus:border-theme-primary block w-full rounded-md border-zinc-900 bg-zinc-900 pr-7 text-right text-sm text-zinc-300 focus:ring-0"
            placeholder="0"
            value={state.royalties}
            onChange={e => {
              if (numbersOnly.test(e.currentTarget.value)) {
                dispatch({
                  type: 'field',
                  field: 'royalties',
                  value: e.currentTarget.value
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
        <label htmlFor="icon" className="text-sm font-medium tracking-wide text-zinc-300">
          App Icon
        </label>
        <label htmlFor="icon" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-zinc-600 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <div className="text-sm text-zinc-600">
                <span className="text-zinc-300">
                  {state.icon.name ?? (
                    <>
                      <span className="text-theme-primary">Upload a file</span> or drag and drop
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
              <p className="text-xs text-zinc-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </label>
      </div>

      {/* Screenshots */}
      <div>
        <label htmlFor="screenshots" className="text-sm font-medium tracking-wide text-zinc-300">
          Screenshots
        </label>
        <label htmlFor="screenshots" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-zinc-600 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <div className="text-sm text-zinc-600">
                <span className="text-zinc-300">
                  <span className="text-theme-primary">Upload a file</span> or drag and drop
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
              <p className="text-xs text-zinc-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

export default memo(Details);
