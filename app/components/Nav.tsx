import { Fragment, memo, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/solid';
import {
  DuplicateIcon,
  ExternalLinkIcon,
  LogoutIcon,
  MenuIcon,
  PencilIcon,
  ViewGridIcon,
  XIcon
} from '@heroicons/react/outline';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const Search = dynamic(() => import('./Search'));

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

const mainMenu = [{ title: 'Backpack', path: '/' }];

function Nav() {
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const router = useRouter();

  return (
    <>
      <Disclosure as="nav" className="bg-zinc-900">
        {({ open }) => (
          <>
            <div className=" mx-auto max-w-7xl px-5">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <Link href="/">
                    <div className="flex">
                      <Image alt="" src="/logo.svg" width="120px" height="40px" />
                    </div>
                  </Link>
                </div>

                {/* Navigation */}
                <div className="hidden justify-center gap-2 lg:flex">
                  {mainMenu.map((item, index) => {
                    if (item.title === 'Blog') {
                      return (
                        <a
                          key={index}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={classNames(
                            'flex gap-1 px-3 py-2 text-sm font-medium tracking-wide text-zinc-100',
                            router.pathname === item.path && 'rounded-lg bg-zinc-900'
                          )}
                        >
                          {item.title}
                        </a>
                      );
                    } else {
                      return (
                        <Link key={index} href={item.path}>
                          <button
                            className={classNames(
                              'flex gap-1 px-3 py-2 text-sm font-medium tracking-wide text-zinc-100',
                              router.pathname === item.path && 'rounded-lg bg-zinc-900'
                            )}
                          >
                            {item.title}
                            {item.title === 'For Developers' && (
                              <ExternalLinkIcon className="g-5 w-5" />
                            )}
                          </button>
                        </Link>
                      );
                    }
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-row items-center gap-4">
                  {/* Search */}
                  {/* <button
                    id="search"
                    name="search"
                    className="font-medium text-zinc-400"
                    onClick={() => setShowSearch(true)}
                  >
                    <SearchIcon className="h-5 w-5 text-zinc-300" aria-hidden="true" />
                  </button> */}

                  {/* Get backpack desktop*/}
                  {/*<button*/}
                  {/*  className="hidden cursor-not-allowed rounded-lg bg-zinc-700 py-2 px-3 text-sm*/}
                  {/*tracking-wide text-zinc-200 sm:block"*/}
                  {/*>*/}
                  {/*  Get Backpack*/}
                  {/*</button>*/}

                  {/* Wallet not connected*/}
                  {/*{!connected && (*/}
                  {/*  <button*/}
                  {/*    type="button"*/}
                  {/*    className="flex flex-row items-center gap-1 rounded-md bg-gradient-to-r*/}
                  {/*   from-teal-500 to-blue-500 px-4 py-2 text-sm font-medium tracking-wide*/}
                  {/*    text-zinc-50 shadow-sm"*/}
                  {/*    onClick={() => setVisible(true)}*/}
                  {/*  >*/}
                  {/*    Connect*/}
                  {/*  </button>*/}
                  {/*)}*/}

                  {/* Wallet Connected desktop */}
                  {connected && (
                    <div className="hidden lg:block">
                      <div className="flex items-center">
                        {/* Auth or Profile */}
                        <Menu as="div" className="relative z-20 flex-shrink-0">
                          <div>
                            <Menu.Button
                              className="flex rounded-full
                        bg-zinc-800 text-sm text-white focus:outline-none
                        focus:ring-2 focus:ring-white focus:ring-offset-2
                        focus:ring-offset-zinc-800"
                            >
                              <span className="sr-only">Open user menu</span>
                              <UserCircleIcon className="h-8 w-8" />
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items
                              className="absolute right-0 mt-2
                        w-48 origin-top-right rounded-md bg-zinc-50 py-1
                        shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                              <Menu.Item>
                                {({ active }) => (
                                  <div className="flex flex-col border-b px-3 py-2">
                                    <span>Connected as</span>
                                    <span className="font-bold">
                                      {publicKey.toBase58().slice(0, 6)}...
                                      {publicKey.toBase58().slice(-4)}
                                    </span>
                                  </div>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/myapps"
                                    className={classNames(
                                      active ? 'bg-zinc-100' : '',
                                      'block flex w-full flex-row gap-2 px-4 py-2 text-sm text-zinc-900'
                                    )}
                                  >
                                    <ViewGridIcon className="h-5 w-5" />
                                    My xNFT Apps
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/publish"
                                    className={classNames(
                                      active ? 'bg-zinc-100' : '',
                                      'block flex w-full flex-row gap-2 px-4 py-2 text-sm text-zinc-900'
                                    )}
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                    Publish a new App
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={classNames(
                                      active ? 'bg-zinc-100' : '',
                                      'block flex w-full flex-row gap-2 px-4 py-2 text-sm text-zinc-900'
                                    )}
                                    onClick={() => {
                                      navigator.clipboard.writeText(publicKey.toBase58());
                                    }}
                                  >
                                    <DuplicateIcon className="h-5 w-5" />
                                    Copy Address
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => disconnect()}
                                    className={classNames(
                                      active ? 'bg-zinc-100' : '',
                                      'block flex w-full flex-row gap-2 border-t px-4 py-2 text-sm text-zinc-900'
                                    )}
                                  >
                                    <LogoutIcon className="h-5 w-5" />
                                    Disconnect
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  )}

                  {/* Mobile menu button */}
                  <div className="flex lg:hidden">
                    <Disclosure.Button
                      className="inline-flex items-center
                justify-center rounded-md p-2 text-zinc-100 hover:bg-zinc-700
                hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="lg:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {mainMenu.map((item, index) => (
                  <Link key={index} href={item.path}>
                    <button
                      className={classNames(
                        'flex gap-1 px-3 py-2 font-medium tracking-wide text-zinc-100',
                        router.pathname === item.path && 'rounded-lg bg-zinc-900'
                      )}
                    >
                      {item.title}
                      {item.title === 'For Developers' && <ExternalLinkIcon className="g-5 w-5" />}
                    </button>
                  </Link>
                ))}
              </div>

              {/*<div className="flex justify-center border-y border-zinc-700 py-3">*/}
              {/*  <button*/}
              {/*    className="w-11/12 cursor-not-allowed rounded-lg bg-zinc-700 py-2 px-3 text-sm*/}
              {/*    tracking-wide text-zinc-200"*/}
              {/*  >*/}
              {/*    Get Backpack*/}
              {/*  </button>*/}
              {/*</div>*/}

              {/* Connected menu, mobile version */}
              {connected && (
                <div className="ml-3 mt-3 space-y-1">
                  <Disclosure.Button className="block w-full text-left">
                    <div className="flex flex-col tracking-wide">
                      <span className="text-sm text-zinc-400">Connected as</span>
                      <span className="text-zinc-200">
                        {publicKey.toBase58().slice(0, 6)}...
                        {publicKey.toBase58().slice(-4)}
                      </span>
                    </div>
                  </Disclosure.Button>

                  <Disclosure.Button
                    className="block flex w-full items-center rounded-md
                   p-2 text-left
                     text-base font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
                  >
                    <Link href="" className="flex gap-3">
                      <ViewGridIcon className="h-5 w-5" />
                      My xNFT Apps
                    </Link>
                  </Disclosure.Button>

                  <Disclosure.Button
                    className="block flex w-full items-center rounded-md
                    p-2 text-left text-base
                     font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
                  >
                    <Link href="/publish" className="flex gap-3">
                      <PencilIcon className="h-5 w-5" />
                      Publish a new App
                    </Link>
                  </Disclosure.Button>
                  <Disclosure.Button
                    className="block flex w-full items-center gap-3 rounded-md
                    p-2 text-left text-base
                     font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
                    onClick={() => {
                      navigator.clipboard.writeText(publicKey.toBase58());
                    }}
                  >
                    <DuplicateIcon className="h-5 w-5" />
                    Copy Address
                  </Disclosure.Button>
                  <Disclosure.Button
                    className="block flex w-full items-center gap-3 rounded-md
                    p-2 text-left text-base
                     font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50"
                    onClick={() => disconnect()}
                  >
                    <LogoutIcon className="h-5 w-5" />
                    Disconnect
                  </Disclosure.Button>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      {showSearch && <Search open={showSearch} setOpen={setShowSearch} />}
    </>
  );
}

export default memo(Nav);
