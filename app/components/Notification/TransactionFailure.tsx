import { type FunctionComponent, memo } from 'react';

interface TransactionFailureProps {
  error: Error;
  title: string;
}

const TransactionFailure: FunctionComponent<TransactionFailureProps> = ({ error, title }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium tracking-wide text-white">{title}</span>
      <kbd className="text-sm text-[#FAFAFA]/75">{error.message}</kbd>
    </div>
  );
};

export default memo(TransactionFailure);
