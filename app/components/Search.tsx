import { Fragment, useState } from 'react';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/solid';
import {
  DocumentTextIcon,
  ExternalLinkIcon,
  FolderAddIcon,
  FolderIcon
} from '@heroicons/react/outline';
import Link from 'next/link';
import useCachedXNFTs from '../hooks/useCachedXNFTs';

const quickActions = [
  { name: 'Get Backpack Wallet', icon: ExternalLinkIcon, url: '/', disabled: true },
  { name: 'Documentation', icon: DocumentTextIcon, url: '/', disabled: true },
  { name: 'Publish a new App', icon: FolderAddIcon, url: '/publish', disabled: false }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Search({ open, setOpen }: SearchProps) {
  const { cachedXNFTs } = useCachedXNFTs();
  const [query, setQuery] = useState('');

  return (
    <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery('')} appear>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className="mx-auto max-w-2xl transform divide-y divide-zinc-500
             divide-opacity-20 overflow-hidden rounded-xl bg-zinc-900 shadow-2xl transition-all"
            >
              <Combobox
                value={query}
                onChange={(item: any) =>
                  (window.location = item.url || `/app/${item.accounts.publicKey}`)
                }
              >
                <div className="relative">
                  <SearchIcon
                    className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-zinc-500"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white
                     placeholder-zinc-500 focus:ring-0 sm:text-sm"
                    placeholder="Search..."
                    onChange={event => setQuery(event.target.value)}
                  />
                </div>

                {(query === '' || cachedXNFTs.length > 0) && (
                  <Combobox.Options
                    static
                    className="max-h-80 scroll-py-2 divide-y divide-zinc-500 divide-opacity-20
                     overflow-y-auto"
                  >
                    <li className="p-2">
                      <ul className="text-sm text-zinc-400">
                        {cachedXNFTs.length > 0 &&
                          cachedXNFTs.map((xnft, index) => (
                            <Combobox.Option
                              key={index}
                              value={xnft}
                              className={({ active }) =>
                                classNames(
                                  'flex cursor-pointer select-none items-center rounded-md px-3 py-2',
                                  active && 'bg-zinc-800 text-white'
                                )
                              }
                            >
                              {({ active }) => (
                                <Link
                                  href={`/app/${xnft.accounts.publicKey}`}
                                  onClick={() => setOpen(false)}
                                >
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full border border-zinc-500">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        alt=""
                                        src={xnft.metadata.properties.icon}
                                        width="100px"
                                        height="100px"
                                      />
                                    </div>
                                    <span className="ml-3 flex-auto truncate">
                                      {xnft.metadata.name}
                                    </span>
                                    {active && (
                                      <span className="ml-3 flex-none text-zinc-400">
                                        Jump to...
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              )}
                            </Combobox.Option>
                          ))}
                      </ul>
                    </li>
                    {query === '' && (
                      <li className="p-2">
                        <h2 className="sr-only">Quick actions</h2>
                        <ul className="text-sm text-zinc-400">
                          {quickActions.map((action, index) => (
                            <Combobox.Option
                              key={index}
                              value={action}
                              disabled={action.disabled}
                              className={({ active }) =>
                                classNames(
                                  'flex select-none items-center rounded-md px-3 py-2',
                                  active && 'bg-zinc-800 text-zinc-50',
                                  action.disabled ? 'cursor-not-allowed ' : 'cursor-pointer'
                                )
                              }
                            >
                              {({ active }) => (
                                <Link
                                  href={action.url}
                                  onClick={() => setOpen(false)}
                                  className={classNames(
                                    action.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                                  )}
                                >
                                  <div className="flex items-center">
                                    <action.icon
                                      className={classNames(
                                        'h-6 w-6 flex-none',
                                        active ? 'text-white' : 'text-zinc-500'
                                      )}
                                      aria-hidden="true"
                                    />
                                    <span className="ml-3 flex-auto truncate">{action.name}</span>
                                  </div>
                                </Link>
                              )}
                            </Combobox.Option>
                          ))}
                        </ul>
                      </li>
                    )}
                  </Combobox.Options>
                )}

                {query !== '' && cachedXNFTs.length === 0 && (
                  <div className="py-14 px-6 text-center sm:px-14">
                    <FolderIcon className="mx-auto h-6 w-6 text-zinc-500" aria-hidden="true" />
                    <p className="mt-4 text-sm text-zinc-200">
                      We couldn`&apos;`t find any xNFT with that term. Please try again.
                    </p>
                  </div>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

interface SearchProps {
  open: boolean;
  setOpen: any;
}
