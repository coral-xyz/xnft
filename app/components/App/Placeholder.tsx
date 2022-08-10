import { type FunctionComponent, memo } from 'react';

const Placeholder: FunctionComponent = () => {
  return (
    <div className="mx-auto w-full max-w-sm rounded-xl bg-[#27272A] p-4">
      <div className="flex animate-pulse items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-[#393C43]"></div>
        <div className="flex-1 space-y-5 py-1">
          <div className="h-2 rounded bg-[#393C43]"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-[#393C43]"></div>
              <div className="col-span-1 h-2 rounded bg-[#393C43]"></div>
            </div>
            <div className="h-2 rounded bg-[#393C43]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Placeholder);
