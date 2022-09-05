import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import { useWallet } from '@solana/wallet-adapter-react';
import { BackpackWalletName } from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { type FunctionComponent, useEffect, useState } from 'react';
import { DownloadBackpackLink } from './Links';

/**
 * Truncate the argued public key string to be to format `XXXXX...XXXXX`.
 * @param {string} pk
 * @returns {string}
 */
function truncatePublicKey(pk: string): string {
  return `${pk.slice(0, 5)}...${pk.slice(-5)}`;
}

export const DisconnectedMenu: FunctionComponent = () => {
  const { select } = useWallet();
  const [backpackInstalled, setBackpackInstalled] = useState(true);

  /**
   * Component effect to check if Backpack is installed in the current
   * browser window in order to determine if the download button
   * should be displayed in the navbar.
   */
  useEffect(() => {
    setTimeout(() => setBackpackInstalled(Object.hasOwn(window, 'backpack')), 500);
  }, []);

  return backpackInstalled ? (
    <button
      className="hidden items-center gap-2 rounded-3xl bg-gradient-to-r from-[#E379B3] to-[#E1B43F] px-4 py-3 text-white sm:flex"
      onClick={() => select(BackpackWalletName)}
    >
      <UserCircleIcon height={18} /> Connect
    </button>
  ) : (
    <DownloadBackpackLink />
  );
};

interface ConnectedMenuProps {
  onDisconnect: () => void;
}

export const ConnectedMenu: FunctionComponent<ConnectedMenuProps> = ({ onDisconnect }) => {
  const { publicKey } = useWallet();

  return (
    <Menu as="div" className="relative hidden sm:inline-block">
      <Menu.Button
        className="flex items-center gap-2 rounded-3xl bg-[#27272A]
          px-4 py-3 font-medium tracking-wide text-[#FAFAFA]"
      >
        <UserCircleIcon height={20} />
        {truncatePublicKey(publicKey.toBase58())}
        <ChevronDownIcon height={20} />
      </Menu.Button>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <ConnectedMenuItems publicKey={publicKey} onDisconnect={onDisconnect} />
      </Transition>
    </Menu>
  );
};

interface ConnectedMenuItemsProps {
  publicKey: PublicKey;
  onDisconnect: () => void;
}

const ConnectedMenuItems: FunctionComponent<ConnectedMenuItemsProps> = ({
  publicKey,
  onDisconnect
}) => {
  return (
    <Menu.Items className="absolute right-0 mt-2 origin-top-right rounded-lg bg-[#27272A] p-1 text-sm text-white shadow-lg">
      <Menu.Item>
        {({ active }) => (
          <Link href="/me">
            <button
              className={`${
                active ? 'bg-[#52525B]' : ''
              } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
            >
              <CodeBracketIcon height={14} /> My xNFTs
            </button>
          </Link>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <Link href="/publish">
            <button
              className={`${
                active ? 'bg-[#52525B]' : ''
              } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
            >
              <SparklesIcon height={14} /> Publish New xNFT
            </button>
          </Link>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button
            className={`${
              active ? 'bg-[#52525B]' : ''
            } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
            onClick={() => navigator.clipboard.writeText(publicKey.toBase58())}
          >
            <ClipboardDocumentIcon height={14} /> Copy Address
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button
            className={`${
              active ? 'bg-[#52525B]' : ''
            } flex w-full items-center gap-3 rounded-lg px-3 py-2`}
            onClick={onDisconnect}
          >
            <ArrowLeftOnRectangleIcon height={14} /> Disconnect
          </button>
        )}
      </Menu.Item>
    </Menu.Items>
  );
};
