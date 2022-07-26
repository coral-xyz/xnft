import { CheckCircleIcon } from '@heroicons/react/solid';
import { type Dispatch, useState } from 'react';
import { UploadDispatchAction } from '../../state/reducers/upload';

export default function SupplySelect({
  value,
  dispatch
}: {
  value: string;
  dispatch: Dispatch<UploadDispatchAction<'supply'>>;
}) {
  const [selected, setSelected] = useState<'unlimited' | 'fixed'>('unlimited');

  const classes = (checked: boolean, others?: string): string =>
    ` px-4 py-4 border-2 bg-zinc-900 text-sm cursor-pointer rounded-md text-white ${
      checked ? 'border-theme-primary' : 'border-zinc-900'
    } ${others ? others : ''}`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className={classes(selected === 'unlimited', 'flex')}
        onClick={() => {
          setSelected('unlimited');
          dispatch({ type: 'field', field: 'supply', value: 'inf' });
        }}
      >
        <span className="flex-1 font-medium">Unlimited Supply</span>
        {selected === 'unlimited' && <CheckCircleIcon className="text-theme-primary h-5" />}
      </div>
      <div className={classes(selected === 'fixed')} onClick={() => setSelected('fixed')}>
        <div className="flex">
          <span className="flex-1 font-medium">Fixed Supply</span>
          {selected === 'fixed' && <CheckCircleIcon className="text-theme-primary h-5" />}
        </div>
        <input
          type="text"
          className="mt-4 w-full rounded-md border-zinc-600 bg-zinc-900 focus:border-zinc-600 focus:ring-0"
          placeholder="0"
          value={value === 'inf' ? '' : value}
          onChange={e => {
            if (/^\d*$/.test(e.currentTarget.value)) {
              dispatch({ type: 'field', field: 'supply', value: e.currentTarget.value });
            }
          }}
        />
      </div>
    </div>
  );
}
