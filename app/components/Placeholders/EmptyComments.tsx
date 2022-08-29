import { ArchiveBoxIcon } from '@heroicons/react/24/solid';
import { FunctionComponent, memo } from 'react';

const EmptyComments: FunctionComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ArchiveBoxIcon height={72} color="#FC9870" />
      <span className="text-lg font-medium tracking-wide text-white">No comments found!</span>
    </div>
  );
};

export default memo(EmptyComments);
