import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import xNFT, { type SerializedXnftWithMetadata, type XnftWithMetadata } from '../utils/xnft';

const Sidebar = dynamic(() => import('../components/Sidebar'));
const App = dynamic(() => import('../components/Library/App'));
const CategoryPreview = dynamic(() => import('../components/Library/CategoryPreview'));
const SecondaryCta = dynamic(() => import('../components/SecondaryCta'));

export async function getStaticProps() {
  const xnfts: XnftWithMetadata[] = await xNFT.getAll();

  return {
    props: {
      data: JSON.stringify(xnfts)
    },
    revalidate: 25
  };
}

const HomePage: NextPage<{ data: string }> = ({ data }) => {
  const xnftList: SerializedXnftWithMetadata[] = JSON.parse(data);
  const [activeMenu, setActiveMenu] = useState(0);

  return (
    <div className="grid grid-cols-4 gap-12">
      {/* Sidebar Menu */}
      <Sidebar active={activeMenu} onClick={setActiveMenu} />

      {/* Main Content */}
      <div className="col-span-3 flex flex-col gap-12">
        <App publicKey={xnftList[0].publicKey} metadata={xnftList[0].metadata} featured />
        <CategoryPreview className="pb-14" title="Popular" xnfts={xnftList} />
        <SecondaryCta />
      </div>
    </div>
  );
};

export default HomePage;
