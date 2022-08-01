import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getAllXNFTs } from '../utils/xnft';

const Sidebar = dynamic(() => import('../components/Sidebar'));
const Featured = dynamic(() => import('../components/Featured'));
const CategoryPreview = dynamic(() => import('../components/Library/CategoryPreview'));
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

const Home: NextPage<{ data: string }> = ({ data }) => {
  const xnftList = JSON.parse(data);
  const [activeMenu, setActiveMenu] = useState(0);

  useEffect(() => {
    console.log(xnftList);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-4 gap-12">
        {/* Sidebar Menu */}
        <Sidebar active={activeMenu} onClick={setActiveMenu} />

        {/* Main Content */}
        <div className="col-span-3 flex flex-col gap-12">
          <Featured app={xnftList[0]} />
          <CategoryPreview className="pb-14" title="Popular" xnfts={xnftList} />
          <SecondaryCta />
        </div>
      </div>
    </div>
  );
};

export default Home;
