import { WifiIcon } from '@heroicons/react/solid';
import { FunctionComponent, memo } from 'react';

const Disconnected: FunctionComponent = () => {
  return (
    <div className="mt-12 flex flex-col justify-center gap-4">
      <WifiIcon className="animate-bounce text-[#F66C5E]" height={64} />
      <h1 className="text-center text-lg font-bold leading-tight text-white">
        Connect your wallet to start publishing!
      </h1>
    </div>
  );
};

export default memo(Disconnected);
