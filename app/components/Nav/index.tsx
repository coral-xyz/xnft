import { ExternalLinkIcon, MenuIcon, SearchIcon, XIcon } from '@heroicons/react/solid';
import { Disclosure } from '@headlessui/react';
import { memo, PropsWithChildren, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function NavLinks({
  className,
  children,
  highlightActive
}: PropsWithChildren<{
  className: string;
  highlightActive?: boolean;
}>) {
  return (
    <div className={className}>
      <Link href="https://backpack.app">
        <button className="px-3 py-2">App</button>
      </Link>
      <Link href="/">
        <button
          className={`${highlightActive ? 'bg-theme-background-dark' : ''} rounded-lg px-3 py-2`}
        >
          xNFT Library
        </button>
      </Link>
      {children}
    </div>
  );
}

type SearchProps = {
  value: string;
  onChange: (val: string) => void;
};

function Search({ value, onChange }: SearchProps) {
  return (
    <label className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
        <SearchIcon className="text-theme-font-gray" height={16} />
      </span>
      <input
        className="bg-theme-background-light placeholder:text-theme-font-gray w-80 rounded-lg py-2 pr-3 pl-8 font-normal focus:ring-0"
        placeholder="Search"
        value={value}
        onChange={e => onChange(e.currentTarget.value)}
      />
    </label>
  );
}

function Nav() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <Disclosure>
      {({ open }) => (
        <div className="text-theme-font text-sm font-medium tracking-wide">
          <div className={`mt-5 grid grid-cols-2 px-5 lg:grid-cols-3`}>
            <div className="flex flex-1 items-center">
              <Link href="/">
                <div className="flex">
                  <Image alt="" src="/logo.svg" width="120px" height="40px" />
                </div>
              </Link>

              <NavLinks className="hidden gap-2 px-5 lg:flex" highlightActive />
            </div>

            {!open && (
              <div className="hidden items-center justify-center lg:flex">
                <Search value={searchValue} onChange={setSearchValue} />
              </div>
            )}

            <div className="hidden items-center justify-end gap-2.5 lg:flex">
              <Link href="https://docs.xnft.gg">
                <button className="flex items-center gap-2.5 px-3 py-2">
                  Docs <ExternalLinkIcon height={14} />
                </button>
              </Link>
              <Link href="/">
                <button
                  className="rounded-lg bg-gradient-to-r from-[#E379B3] to-[#E1B43F] px-3 py-2"
                  disabled
                >
                  Download Backpack
                </button>
              </Link>
            </div>

            <div className="flex justify-end lg:hidden">
              <Disclosure.Button>
                <span className="sr-only">Open Main Menu</span>
                {open ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>
          <Disclosure.Panel className="lg:hidden">
            <NavLinks className="flex flex-col gap-1 px-2 pt-2 pb-3">
              <Link href="https://docs.xnft.gg">
                <button className="flex items-center gap-2.5 px-3 py-2">
                  Docs <ExternalLinkIcon height={14} />
                </button>
              </Link>
            </NavLinks>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

export default memo(Nav);
