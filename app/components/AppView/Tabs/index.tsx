import dynamic from 'next/dynamic';
import { type FunctionComponent, memo, useState } from 'react';
import type { SerializedXnftWithMetadata } from '../../../utils/xnft';

const InformationTab = dynamic(() => import('./Information'));
const OverviewTab = dynamic(() => import('./Overview'));
const Reviews = dynamic(() => import('./Reviews'));

const tabs = [{ name: 'Overview' }, { name: 'Information' }, { name: 'Reviews' }];

/**
 * @param {...any[]} classes
 * @returns {string}
 */
function classNames(...classes: any[]): string {
  return classes.filter(Boolean).join(' ');
}

interface TabsProps {
  xnft: SerializedXnftWithMetadata;
}

const Tabs: FunctionComponent<TabsProps> = ({ xnft }) => {
  const [selectedTab, setSelectedTab] = useState(tabs[0].name);

  return (
    <div className="mt-8">
      <div className="mb-6 border-b-2 border-[#393C43]">
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
      {selectedTab === 'Reviews' && <Reviews xnft={xnft} />}
    </div>
  );
};

export default memo(Tabs);
