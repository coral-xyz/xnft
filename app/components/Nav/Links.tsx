import { ExternalLinkIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import type { FunctionComponent } from 'react';

export const DocsLink: FunctionComponent = () => {
  return (
    <Link href="https://docs.xnft.gg">
      <button className="flex items-center gap-2.5 px-4 py-3 font-medium text-[#FAFAFA]">
        Docs <ExternalLinkIcon height={14} />
      </button>
    </Link>
  );
};
