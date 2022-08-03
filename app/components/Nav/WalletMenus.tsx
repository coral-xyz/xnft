import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  ClipboardCopyIcon,
  CodeIcon,
  LogoutIcon,
  SparklesIcon,
  UserCircleIcon
} from '@heroicons/react/solid';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
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
  const { setVisible } = useWalletModal();
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setInstalled(Object.hasOwn(window, 'backpack'));
    }, 500);
  }, []);

  return (
    <>
      <Transition
        show={!installed}
        enter="transition-all ease-in-out duration-500"
        enterFrom="transform opacity-0"
        enterTo="transform opacity-100"
      >
        <DownloadBackpackLink />
      </Transition>
      <button
        className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#E379B3] to-[#E1B43F] px-4 py-3 text-white"
        onClick={() => setVisible(true)}
      >
        <UserCircleIcon height={18} /> Connect
      </button>
    </>
  );
};

type ConnectedMenuProps = {
  onDisconnect: () => void;
};

export const ConnectedMenu: FunctionComponent<ConnectedMenuProps> = ({ onDisconnect }) => {
  const { publicKey } = useWallet();

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button
        className="flex items-center gap-2 rounded-3xl bg-[#27272A]
          px-4 py-3 font-medium tracking-wide text-[#FAFAFA]"
      >
        <UserCircleIcon height={20} /> {truncatePublicKey(publicKey.toBase58())}{' '}
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

type ConnectedMenuItemsProps = {
  publicKey: PublicKey;
  onDisconnect: () => void;
};

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
              <CodeIcon height={14} /> My xNFTs
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
            <ClipboardCopyIcon height={14} /> Copy Address
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
            <LogoutIcon height={14} /> Disconnect
          </button>
        )}
      </Menu.Item>
    </Menu.Items>
  );
};
