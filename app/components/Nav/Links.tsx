import { DownloadIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import type { FunctionComponent } from 'react';
import { BACKPACK_LINK, DOCS_LINK } from '../../utils/constants';

export const DocsLink: FunctionComponent = () => {
  return (
    <Link href={DOCS_LINK} target="_blank">
      <button className="flex items-center gap-2.5 px-4 py-3 font-medium text-[#FAFAFA]">
        Docs <ExternalLinkIcon height={14} />
      </button>
    </Link>
  );
};

export const DownloadBackpackLink: FunctionComponent = () => {
  return (
    <Link href={BACKPACK_LINK} target="_blank">
      <button className="flex items-center gap-3 rounded-3xl bg-[#3F3F46] py-3 px-4 font-medium tracking-wide text-[#FAFAFA]">
        <span>Download Backpack</span> <DownloadIcon height={16} />
      </button>
    </Link>
  );
};
