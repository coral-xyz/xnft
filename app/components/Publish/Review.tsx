import { BadgeCheckIcon } from '@heroicons/react/solid';
import { type FunctionComponent, memo, useEffect } from 'react';
import Image from 'next/image';
import type { StepComponentProps } from '../../pages/publish';
import { usePublish } from '../../state/hooks/xnfts';

const Review: FunctionComponent<StepComponentProps> = ({ setNextEnabled }) => {
  const [publishState] = usePublish();

  useEffect(() => {
    setNextEnabled(true);
  }, [setNextEnabled]);

  return (
    <div className="flex max-w-6xl flex-col gap-5 divide-y divide-[#393C43] py-10">
      <div className="flex justify-center gap-6 px-52">
        {/* App Icon */}
        <Image
          className="rounded-xl"
          alt="app-icon"
          src={URL.createObjectURL(publishState.icon)}
          height={224}
          width={224}
        />

        <div className="flex flex-col gap-4">
          {/* Title and verification status */}
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-white">
            {publishState.title}
            <BadgeCheckIcon height={22} color="#45EB4D" />
          </h1>

          {/* Description */}
          <h5 className="max-w-[350px] font-medium text-zinc-500">{publishState.description}</h5>

          {/* Price */}
          <div>
            <span className="rounded-md bg-[#4F46E5] px-4 py-2 font-medium text-white">
              {publishState.price === '0.0' ? 'FREE' : publishState.price + ' SOL'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-10 pt-5">
        <ul className="flex list-none gap-5 overflow-x-scroll">
          {publishState.screenshots.map((s, idx) => (
            <li key={idx}>
              <Image
                className="rounded-xl"
                alt={`screenshot-${idx}`}
                src={URL.createObjectURL(s)}
                height={479}
                width={300}
                layout="fixed"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default memo(Review);
