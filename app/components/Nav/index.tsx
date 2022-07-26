import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLinkIcon } from '@heroicons/react/solid';

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
    <div className="text-theme-font mt-5 flex items-center px-5 text-sm font-medium tracking-wide">
      <div className="flex flex-1 items-center">
        <Link href="/">
          <div className="flex">
            <Image alt="" src="/logo.svg" width="120px" height="40px" />
          </div>
        </Link>

        <NavLinks className="flex gap-2 px-5" highlightActive />
      </div>
      <div className="flex items-center gap-2.5">
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
    </div>
  );
}

export default memo(Nav);
