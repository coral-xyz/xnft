import { ArrowDownTrayIcon, WifiIcon } from '@heroicons/react/24/solid';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import {
  memo,
  useMemo,
  useState,
  useCallback,
  MouseEvent,
  type FunctionComponent,
  type MouseEventHandler
} from 'react';
import { ClipLoader } from 'react-spinners';

const Modal = dynamic(() => import('../Modal/Base'));

interface AppPrimaryButtonProps {
  className?: string;
  disabled?: boolean;
  installed?: boolean;
  large?: boolean;
  loading?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
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
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleDisabledClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setConnectModalOpen(true);
  }, []);

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
    <>
      <button
        className={`flex items-center gap-2.5 bg-white py-2 text-[#374151] ${classes} ${
          className ?? ''
        }`}
        onClick={disabled ? handleDisabledClick : onClick}
      >
        {btnText}
        {btnIcon}
      </button>
      <Modal open={connectModalOpen} onClose={() => setConnectModalOpen(false)}>
        <section className="flex flex-col items-center justify-center gap-4 py-12">
          <WifiIcon color="#F66C5E" height={64} />
          Connect your wallet to install xNFTs.
        </section>
      </Modal>
    </>
  );
};

export default memo(AppPrimaryButton);
