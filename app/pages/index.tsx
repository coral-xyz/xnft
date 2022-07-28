import { PublicKey } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { getAllXNFTs } from '../utils/xnft';

const Sidebar = dynamic(() => import('../components/Sidebar'));
const App = dynamic(() => import('../components/Library/App'));
const SecondaryCta = dynamic(() => import('../components/SecondaryCta'));
const Posts = dynamic(() => import('../components/Posts'));
const Newsletter = dynamic(() => import('../components/Newsletter'));

export async function getStaticProps() {
  const xnfts = await getAllXNFTs();

  return {
    props: {
      data: JSON.stringify(xnfts)
    },
    revalidate: 25
  };
}

function Home({ data }) {
  const [activeMenu, setActiveMenu] = useState(0);

  const xnfts = JSON.parse(data);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-12">
        <Sidebar className="w-72" active={activeMenu} onClick={setActiveMenu} />
        {/*  Apps */}
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold tracking-wide text-white">Popular</h2>
          <ul
            role="list"
            className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-2"
          >
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
      </div>

      <SecondaryCta publishDisable={false} />
      <Posts />
      <Newsletter />
    </div>
  );
}

export default Home;
