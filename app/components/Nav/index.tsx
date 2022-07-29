import { UserCircleIcon } from '@heroicons/react/solid';
import { type FunctionComponent, memo, useState } from 'react';
import Link from 'next/link';
import Search from './Search';
import { DocsLink, DownloadBackpackLink } from './Links';

const Nav: FunctionComponent = () => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="tracking-wide">
      <div className="flex items-center">
        <div className="flex flex-1 items-center gap-36">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white">xNFT Library</h1>
          </Link>
          <Search value={searchValue} onChange={setSearchValue} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <DocsLink />
          <DownloadBackpackLink />
          <Link href="/">
            <button
              className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#E379B3] to-[#E1B43F] px-4 py-3 text-white"
              disabled
            >
              <UserCircleIcon height={18} /> Connect
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default memo(Nav);
