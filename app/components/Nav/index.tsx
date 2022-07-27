import { MenuIcon, XIcon } from '@heroicons/react/solid';
import { Disclosure } from '@headlessui/react';
import { type FunctionComponent, memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Search from './Search';
import { DocsLink, NavLinks } from './Links';

const Nav: FunctionComponent = () => {
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

            {!open && <Search value={searchValue} onChange={setSearchValue} />}

            <div className="hidden items-center justify-end gap-2.5 lg:flex">
              <DocsLink />
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
              <DocsLink />
            </NavLinks>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

export default memo(Nav);
