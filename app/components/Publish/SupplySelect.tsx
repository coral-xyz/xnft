import { CheckCircleIcon } from '@heroicons/react/solid';
import { type KeyboardEvent, type FunctionComponent, useState, memo } from 'react';
import { usePublish } from '../../state/atoms/publish';

function blockSpecialNumericals(e: KeyboardEvent) {
  if (['+', '-', 'e', '.'].includes(e.key)) {
    e.preventDefault();
  }
}

type SupplySelectProps = {
  inputClasses?: string;
  value: string;
};

const SupplySelect: FunctionComponent<SupplySelectProps> = ({ inputClasses, value }) => {
  const [_, setPublishState] = usePublish();
  const [selected, setSelected] = useState<'unlimited' | 'fixed'>('unlimited');

  const classes = (checked: boolean, others?: string): string =>
    ` px-4 py-4 border-2 bg-[#18181B] text-sm cursor-pointer rounded-md text-white ${
      checked ? 'border-[#F66C5E]' : 'border-[#18181B]'
    } ${others ? others : ''}`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className={classes(selected === 'unlimited', 'flex')}
        onClick={() => {
          setSelected('unlimited');
          setPublishState(prev => ({ ...prev, supply: 'inf' }));
        }}
      >
        <span className="flex-1 font-medium">Unlimited Supply</span>
        {selected === 'unlimited' && <CheckCircleIcon className="h-5 text-[#F66C5E]" />}
      </div>
      <div className={classes(selected === 'fixed')} onClick={() => setSelected('fixed')}>
        <div className="flex">
          <span className="flex-1 font-medium">Fixed Supply</span>
          {selected === 'fixed' && <CheckCircleIcon className="h-5 text-[#F66C5E]" />}
        </div>
        <input
          id="supply"
          name="supply"
          type="number"
          className={inputClasses}
          placeholder="0"
          value={value === 'inf' ? '' : value}
          onKeyDown={blockSpecialNumericals}
          onChange={e => setPublishState(prev => ({ ...prev, supply: e.target.value }))}
        />
      </div>
    </div>
  );
};

export default memo(SupplySelect);
