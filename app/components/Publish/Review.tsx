import { BadgeCheckIcon } from '@heroicons/react/solid';
import { type FunctionComponent, memo, useEffect, useState } from 'react';
import Image from 'next/image';
import type { StepComponentProps } from '../../pages/publish';

const Review: FunctionComponent<StepComponentProps> = ({ state, setNextEnabled }) => {
  const [icon, setIcon] = useState('');

  useEffect(() => {
    setNextEnabled(true);
  }, [setNextEnabled]);

  useEffect(() => {
    if ('name' in state.icon) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(state.icon);
    }
  }, [state.icon]);

  return (
    <div className="py-10">
      <div className="flex justify-center gap-6 md:px-52 lg:px-52">
        {/* App Icon */}
        <Image
          className="h-56 w-56 rounded-xl"
          alt="app-icon"
          src={icon}
          height={224}
          width={224}
        />

        <div className="flex flex-col gap-4">
          {/* Title and verification status */}
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-white">
            {state.title}
            <BadgeCheckIcon height={22} color="#45EB4D" />
          </h1>

          {/* Description */}
          <h5 className="max-w-[350px] font-medium text-zinc-500">{state.description}</h5>

          {/* Price */}
          <div>
            <span className="bg-theme-accent rounded-md px-4 py-2 font-medium text-white">
              {state.price === '0.0' ? 'FREE' : state.price + ' SOL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Review);
