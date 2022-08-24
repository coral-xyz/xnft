import Link from 'next/link';
import { type FunctionComponent, memo } from 'react';

interface ExplorerProps {
  signature: string;
  title: string;
}

const Explorer: FunctionComponent<ExplorerProps> = ({ signature, title }) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium tracking-wide text-white">{title}</span>
      <Link
        className="text-sm text-[#00B5F4]"
        href={`https://solscan.io/tx/${signature}?cluster=devnet`}
        target="_blank"
      >
        View on SolScan
      </Link>
    </div>
  );
};

export default memo(Explorer);
