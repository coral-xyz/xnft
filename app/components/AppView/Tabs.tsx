import { ExternalLinkIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import { type FunctionComponent, memo, useState } from 'react';
import type { SerializedXnftWithMetadata } from '../../utils/xnft';
import xNFT from '../../utils/xnft';

const tabs = [{ name: 'Overview' }, { name: 'Information' }];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface OverviewTabProps {
  xnft: SerializedXnftWithMetadata;
}

const OverviewTab: FunctionComponent<OverviewTabProps> = ({ xnft }) => {
  return (
    <section className="mt-6 w-full rounded-2xl bg-[#27272A]">
      <div className="flex justify-center p-10">
        <ul className="no-scrollbar flex list-none gap-5 overflow-x-auto">
          {xnft.metadata.properties.files.map((f, idx) => (
            <li key={f.uri}>
              <Image
                className="rounded-xl bg-transparent"
                alt={`screenshot-${idx}`}
                src={f.uri}
                height={479}
                width={300}
                layout="fixed"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

type InformationTabProps = {
  xnft: SerializedXnftWithMetadata;
};

const InformationTab: FunctionComponent<InformationTabProps> = ({ xnft }) => {
  return (
    <section className="mx-auto mt-5 flex h-full max-w-3xl flex-col gap-4 rounded-xl bg-[#292C33] p-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[#99A4B4]">Authority</span>
        <span className="font-medium text-white">{xnft.account.authority}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-[#99A4B4]">Tag</span>
        <span className="font-medium text-white">{xNFT.tagName(xnft.account.tag)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-[#99A4B4]">Kind</span>
        <span className="font-medium text-white">{xNFT.kindName(xnft.account.kind)}</span>
      </div>

      {xnft.metadata.external_url && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#99A4B4]">Website</span>
          <a
            href={xnft.metadata.external_url}
            target="_blank"
            className="flex cursor-pointer items-center gap-1 font-medium text-white
            text-white hover:text-sky-500"
            rel="noreferrer"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            {xnft.metadata.external_url}
          </a>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-sm text-[#99A4B4]">Supply</span>
        <span className="font-medium text-white">
          {xnft.metadataAccount.collectionDetails ? (
            parseInt(xnft.metadataAccount.collectionDetails.size.toString(), 16).toLocaleString()
          ) : (
            <>&#8734;</>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-[#99A4B4]">Last Updated</span>
        <span className="font-medium text-white">
          {new Date(parseInt(xnft.account.updatedTs, 16) * 1000).toUTCString()}
        </span>
      </div>

      {xnft.metadataAccount.data.uri && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#99A4B4]">Metadata</span>
          <a
            href={xnft.metadataAccount.data.uri}
            target="_blank"
            className="flex cursor-pointer items-center gap-1 font-medium text-white hover:text-sky-500"
            rel="noreferrer"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Open
          </a>
        </div>
      )}
    </section>
  );
};

interface TabsProps {
  xnft: SerializedXnftWithMetadata;
}

const Tabs: FunctionComponent<TabsProps> = ({ xnft }) => {
  const [selectedTab, setSelectedTab] = useState(tabs[0].name);

  return (
    <div className="mt-8">
      <div className="border-b-2 border-[#393C43]">
        <nav className="mx-auto -mb-px flex max-w-xl space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.name}
              disabled={tab.name === 'Screenshots'}
              className={classNames(
                selectedTab === tab.name
                  ? 'border-[#FC9870] text-[#FC9870]'
                  : 'border-transparent text-[#99A4B4]',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ' +
                  'disabled:text-[#393C43] disabled:hover:cursor-not-allowed'
              )}
              onClick={() => setSelectedTab(tab.name)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      {selectedTab === 'Overview' && <OverviewTab xnft={xnft} />}
      {selectedTab === 'Information' && <InformationTab xnft={xnft} />}
    </div>
  );
};

export default memo(Tabs);
