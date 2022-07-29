import { PublicKey } from '@solana/web3.js';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { getAllXNFTs } from '../utils/xnft';

const Sidebar = dynamic(() => import('../components/Sidebar'));
const Featured = dynamic(() => import('../components/Featured'));
const App = dynamic(() => import('../components/Library/App'));
const SecondaryCta = dynamic(() => import('../components/SecondaryCta'));

export async function getStaticProps() {
  const xnfts = await getAllXNFTs();

  return {
    props: {
      data: JSON.stringify(xnfts)
    },
    revalidate: 25
  };
}

const Home: NextPage<{ data: any }> = ({ data }) => {
  const [activeMenu, setActiveMenu] = useState(0);

  const xnfts = JSON.parse(data);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-4 gap-12">
        {/* Sidebar Menu */}
        <Sidebar active={activeMenu} onClick={setActiveMenu} />

        {/* Main Content */}
        <div className="col-span-3 flex flex-col gap-12">
          <Featured app={xnfts[0]} />

          <div className="flex flex-col gap-7 pb-14">
            <h2 className="text-2xl font-extrabold tracking-wide text-white">Popular</h2>
            <ul role="list" className="grid grid-cols-1 grid-cols-2 gap-y-4 gap-x-4">
              {xnfts.map((xnft, index) => (
                <li key={index} className="col-span-1 rounded-lg bg-[#27272A]">
                  <App
                    key={index}
                    iconUrl={xnft.metadata.properties.icon}
                    name={xnft.metadata.name}
                    description={xnft.metadata.description}
                    publicKey={xnft.accounts.publicKey}
                    publisher={new PublicKey(xnft.accounts.account.publisher)}
                    installVault={new PublicKey(xnft.accounts.account.installVault)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <SecondaryCta publishDisable={false} />
        </div>
      </div>
    </div>
  );
};

export default Home;
