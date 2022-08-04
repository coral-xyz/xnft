import { ExternalLinkIcon } from '@heroicons/react/outline';
import { type FunctionComponent, memo, useState } from 'react';
import type { SerializedXnftWithMetadata } from '../../utils/xnft';

const tabs = [{ name: 'Information' }, { name: 'Screenshots' }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

interface ViewTabsProps {
  xnft: SerializedXnftWithMetadata;
}

const ViewTabs: FunctionComponent<ViewTabsProps> = ({ xnft }) => {
  const [selectedTab, setSelectedTab] = useState<string>('Information');

  return (
    <div>
      <div className="border-b-2 border-zinc-600">
        <nav className="mx-auto -mb-px flex max-w-2xl space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.name}
              disabled={tab.name === 'Screenshots'}
              className={classNames(
                tab.name === selectedTab
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-zinc-400 hover:text-zinc-400',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ' +
                  'disabled:text-zinc-600 disabled:hover:cursor-not-allowed'
              )}
              aria-current={tab.name === selectedTab ? 'page' : undefined}
              onClick={() => setSelectedTab(tab.name)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      {selectedTab === 'Information' && (
        <div
          className="mx-auto mt-5 flex h-full max-w-2xl flex-col gap-4 rounded-xl
          bg-zinc-800 p-4"
        >
          {xnft.metadata.external_url && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-400">Website</span>
              <a
                href={xnft.metadata.external_url}
                target="_blank"
                className="flex cursor-pointer items-center gap-1 font-medium text-zinc-100
                text-zinc-100 hover:text-sky-500"
                rel="noreferrer"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Open
              </a>
            </div>
          )}

          {xnft.metadata.properties.twitter && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-400">Twitter</span>
              <a
                href={xnft.metadata.properties.twitter}
                target="_blank"
                className="flex cursor-pointer items-center gap-1 font-medium
                text-zinc-100 hover:text-sky-500"
                rel="noreferrer"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Profile
              </a>
            </div>
          )}

          {xnft.metadata.properties.discord && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-400">Discord</span>
              <a
                href={xnft.metadata.properties.discord}
                target="_blank"
                className="flex cursor-pointer items-center gap-1 font-medium
                text-zinc-100 hover:text-sky-500"
                rel="noreferrer"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Invitation
              </a>
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-sm text-zinc-400">Supply</span>
            <span
              className="flex items-center gap-1 font-medium
              text-zinc-100"
            >
              &#8734; {/* TODO: */}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-zinc-400">Last Updated</span>
            <span
              className="flex items-center gap-1 font-medium
               text-zinc-100"
            >
              {new Date(parseInt(xnft.account.updatedTs, 16) * 1000).toUTCString()}
            </span>
          </div>

          {xnft.metadataAccount.data.uri && (
            <div className="flex flex-col">
              <span className="text-sm text-zinc-400">Metadata</span>
              <a
                href={xnft.metadataAccount.data.uri}
                target="_blank"
                className="flex cursor-pointer items-center gap-1 font-medium
                text-zinc-100 hover:text-sky-500"
                rel="noreferrer"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Open
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(ViewTabs);
