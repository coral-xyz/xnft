import { ComputerDesktopIcon } from '@heroicons/react/24/solid';
import { type FunctionComponent, memo } from 'react';

interface MobileProps {
  className?: string;
}

const Mobile: FunctionComponent<MobileProps> = ({ className }) => {
  return (
    <section className={`flex flex-col items-center ${className ?? ''}`}>
      <ComputerDesktopIcon className="text-[#F66C5E]" height={150} />
      <h2 className="max-w-md px-16 text-center text-lg font-medium tracking-wide text-white">
        Please view use this app using a non-mobile device for the best experience.
      </h2>
    </section>
  );
};

export default memo(Mobile);
