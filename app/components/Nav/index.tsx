import { Disclosure } from '@headlessui/react';
import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLinkIcon, MenuIcon, XIcon } from '@heroicons/react/solid';

function NavLinks({
  className,
  highlightActive
}: {
  className: string;
  highlightActive?: boolean;
}) {
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
    </div>
  );
}

function Nav() {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="text-theme-font text-sm font-medium tracking-wide">
          <div className="mt-5 flex items-center px-5">
            <div className="flex flex-1 items-center">
              <Link href="/">
                <div className="flex">
                  <Image alt="" src="/logo.svg" width="120px" height="40px" />
                </div>
              </Link>

              <NavLinks className="hidden gap-2 px-5 md:flex lg:flex" highlightActive />
            </div>
            <div className="hidden items-center gap-2.5 md:flex lg:flex">
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

            <div className="flex md:hidden lg:hidden">
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
          <Disclosure.Panel className="md:hidden lg:hidden">
            <NavLinks className="flex flex-col gap-1 px-2 pt-2 pb-3" />
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}

export default memo(Nav);
