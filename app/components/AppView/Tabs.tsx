import { ExternalLinkIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import { type FunctionComponent, memo, useState } from 'react';
import type { SerializedXnftWithMetadata } from '../../utils/xnft';

const tabs = [{ name: 'Overview' }, { name: 'Information' }];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

type OverviewTabProps = {
  xnft: SerializedXnftWithMetadata;
};

const OverviewTab: FunctionComponent<OverviewTabProps> = ({ xnft }) => {
  return (
    <section className="mt-6 w-full rounded-2xl bg-[#27272A]">
      <div className="flex justify-center p-10">
        <ul className="flex list-none gap-5 overflow-x-scroll">
          {xnft.metadata.properties.screenshots.map((url, idx) => (
            <li key={idx}>
              <Image
                className="rounded-xl"
                alt={`screenshot-${idx}`}
                src={url}
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
    <section className="mx-auto mt-5 flex h-full max-w-2xl flex-col gap-4 rounded-xl bg-[#292C33] p-4">
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
            Open
          </a>
        </div>
      )}

      {xnft.metadata.properties.twitter && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#99A4B4]">Twitter</span>
          <a
            href={xnft.metadata.properties.twitter}
            target="_blank"
            className="flex cursor-pointer items-center gap-1 font-medium
            text-white hover:text-sky-500"
            rel="noreferrer"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Profile
          </a>
        </div>
      )}

      {xnft.metadata.properties.discord && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#99A4B4]">Discord</span>
          <a
            href={xnft.metadata.properties.discord}
            target="_blank"
            className="flex cursor-pointer items-center gap-1 font-medium
            text-white hover:text-sky-500"
            rel="noreferrer"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Invitation
          </a>
        </div>
      )}

      <div className="flex flex-col">
        <span className="text-sm text-[#99A4B4]">Supply</span>
        <span
          className="flex items-center gap-1 font-medium
          text-white"
        >
          &#8734; {/* TODO: */}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-[#99A4B4]">Last Updated</span>
        <span
          className="flex items-center gap-1 font-medium
           text-white"
        >
          {new Date(parseInt(xnft.account.updatedTs, 16) * 1000).toUTCString()}
        </span>
      </div>

      {xnft.metadataAccount.data.uri && (
        <div className="flex flex-col">
          <span className="text-sm text-[#99A4B4]">Metadata</span>
          <a
            href={xnft.metadataAccount.data.uri}
            target="_blank"
            className="flex cursor-pointer items-center gap-1 font-medium
            text-white hover:text-sky-500"
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
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              disabled={tab.name === 'Screenshots'}
              className={classNames(
                selectedTab === tab.name
                  ? 'border-[#FC9870] text-[#FC9870]'
                  : 'border-transparent text-[#99A4B4]',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ' +
                  'disabled:text-[#393C43] disabled:hover:cursor-not-allowed'
              )}
              aria-current={selectedTab === tab.name ? 'page' : undefined}
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
