import { ExternalLinkIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import type { FunctionComponent, ReactNode } from 'react';

type NavLinksProps = {
  className: string;
  children?: ReactNode;
  highlightActive?: boolean;
};

export const NavLinks: FunctionComponent<NavLinksProps> = props => {
  return (
    <div className={props.className}>
      <Link href="https://backpack.app">
        <button className="px-3 py-2">App</button>
      </Link>
      <Link href="/">
        <button
          className={`${
            props.highlightActive ? 'bg-theme-background-dark' : ''
          } rounded-lg px-3 py-2`}
        >
          xNFT Library
        </button>
      </Link>
      {props.children}
    </div>
  );
};

export const DocsLink: FunctionComponent = () => {
  return (
    <Link href="https://docs.xnft.gg">
      <button className="flex items-center gap-2.5 px-3 py-2">
        Docs <ExternalLinkIcon height={14} />
      </button>
    </Link>
  );
};
