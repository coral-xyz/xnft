import { CheckCircleIcon } from '@heroicons/react/solid';
import { type FunctionComponent, useState, memo, useCallback } from 'react';
import { usePublish } from '../../state/atoms/publish';
import Input from '../Inputs/Input';

interface SupplySelectProps {
  value: string;
}

const SupplySelect: FunctionComponent<SupplySelectProps> = ({ value }) => {
  const [_, setPublishState] = usePublish();
  const [selected, setSelected] = useState<'unlimited' | 'fixed'>('unlimited');

  /**
   * Memoized function to calculate the tailwind class list for the selection options.
   * @param {boolean} checked
   * @param {[string]} others
   * @returns {string}
   */
  const classes = useCallback(
    (checked: boolean, others?: string): string =>
      ` px-4 py-4 border-2 bg-[#18181B] text-sm cursor-pointer rounded-md text-white ${
        checked ? 'border-[#F66C5E]' : 'border-[#18181B]'
      } ${others ? others : ''}`,
    []
  );

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
        <Input
          id="supply"
          name="supply"
          className="!mt-4 !border-[#393C43]"
          type="number"
          placeholder="0"
          value={value === 'inf' ? '' : value}
          forbiddenChars={['+', '-', 'e', '.']}
          onChange={e => setPublishState(prev => ({ ...prev, supply: e.target.value }))}
        />
      </div>
    </div>
  );
};

export default memo(SupplySelect);
