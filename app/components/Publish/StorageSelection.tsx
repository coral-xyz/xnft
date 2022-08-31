import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { type FunctionComponent, memo, useEffect } from 'react';
import type { StepComponentProps } from '../../pages/publish';
import { StorageName, usePublish } from '../../state/atoms/publish';

const options = [
  {
    title: 'AWS S3',
    value: StorageName.S3
  },
  {
    title: 'IPFS/Filecoin',
    value: StorageName.Ipfs
  }
];

const StorageSelection: FunctionComponent<StepComponentProps> = ({ setNextEnabled }) => {
  const [publishState, setPublishState] = usePublish();

  useEffect(() => {
    if (publishState.storageType !== null) {
      setNextEnabled(true);
    }
  }, [publishState.storageType, setNextEnabled]);

  return (
    <section className="grid grid-cols-1 gap-6 px-16 py-14 text-center md:grid-cols-2">
      {options.map(({ title, value }) => (
        <div
          key={title}
          className={`relative flex cursor-pointer flex-col items-center gap-4 rounded-lg border bg-[#18181B] p-24 ${
            publishState.storageType === value
              ? 'border-[#F66C5E] text-[#F66C5E]'
              : 'border-[#18181B] text-white'
          }`}
          onClick={() => setPublishState(prev => ({ ...prev, storageType: value }))}
        >
          <span className={`text-lg font-medium tracking-wide`}>{title}</span>
          {publishState.storageType === value && (
            <CheckCircleIcon className="absolute top-2 right-2 h-5 text-[#F66C5E]" />
          )}
        </div>
      ))}
    </section>
  );
};

export default memo(StorageSelection);
