import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { type FunctionComponent, memo, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';

interface AppPrimaryButtonProps {
  className?: string;
  disabled?: boolean;
  installed?: boolean;
  large?: boolean;
  loading?: boolean;
  onClick: () => void;
  price: number;
}

const AppPrimaryButton: FunctionComponent<AppPrimaryButtonProps> = ({
  className,
  disabled,
  installed,
  large,
  loading,
  onClick,
  price
}) => {
  /**
   * Memoized value for the button text based on the
   * installation status and app price.
   */
  const btnText = useMemo(
    () => (installed ? 'Open' : price === 0 ? 'Free' : `${price / LAMPORTS_PER_SOL} SOL`),
    [installed, price]
  );

  /**
   * Memoized value for the button icon based on the
   * prop provided loading and installed values.
   */
  const btnIcon = useMemo(
    () =>
      loading ? <ClipLoader size={16} /> : !installed ? <ArrowDownTrayIcon height={16} /> : null,
    [loading, installed]
  );

  /**
   * Memoized value for the class list of the button that
   * depend of the intended size of the button.
   */
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
      {btnIcon}
    </button>
  );
};

export default memo(AppPrimaryButton);
