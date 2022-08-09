import { DownloadIcon } from '@heroicons/react/solid';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { type FunctionComponent, memo, useMemo } from 'react';

type AppPrimaryButtonProps = {
  className?: string;
  disabled?: boolean;
  installed?: boolean;
  large?: boolean;
  onClick: () => void;
  price: number;
};

const AppPrimaryButton: FunctionComponent<AppPrimaryButtonProps> = ({
  className,
  disabled,
  installed,
  large,
  onClick,
  price
}) => {
  const btnText = useMemo(
    () => (installed ? 'Open' : price === 0 ? 'Free' : `${price / LAMPORTS_PER_SOL} SOL`),
    [installed, price]
  );

  const classes = useMemo(
    () => (large ? 'px-4 rounded-md' : 'px-3 rounded text-xs font-medium tracking-wide'),
    [large]
  );

  return (
    <button
      className={`flex items-center gap-2.5 bg-white py-2 text-[#374151] ${classes} ${
        className ?? ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {btnText}
      {!installed && <DownloadIcon height={16} />}
    </button>
  );
};

export default memo(AppPrimaryButton);
