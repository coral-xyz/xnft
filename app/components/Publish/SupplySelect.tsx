import { CheckCircleIcon } from '@heroicons/react/solid';
import { type Dispatch, useState, memo, type FunctionComponent } from 'react';
import type { UploadDispatchAction } from '../../state/reducers/upload';

type SupplySelectProps = {
  value: string;
  dispatch: Dispatch<UploadDispatchAction<'supply'>>;
};

const SupplySelect: FunctionComponent<SupplySelectProps> = ({ value, dispatch }) => {
  const [selected, setSelected] = useState<'unlimited' | 'fixed'>('unlimited');

  const classes = (checked: boolean, others?: string): string =>
    ` px-4 py-4 border-2 bg-theme-background text-sm cursor-pointer rounded-md text-theme-font ${
      checked ? 'border-theme-primary' : 'border-theme-background'
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
          className="placeholder:text-theme-font-gray-dark bg-theme-background border-theme-font-gray-dark
            focus:border-theme-font-gray-dark mt-4 w-full rounded-md focus:ring-0"
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
};

export default memo(SupplySelect);
