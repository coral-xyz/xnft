import { BN } from '@project-serum/anchor';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import xNFT, { type SerializedXnftWithMetadata, type XnftWithMetadata } from '../utils/xnft';
import Layout from '../components/Layout';

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

  return (
    <Layout contentClassName="flex flex-col gap-12">
      {xnftList.length > 0 && (
        <>
          <App
            featured
            publicKey={xnftList[0].publicKey}
            price={new BN(xnftList[0].account.installPrice)}
            metadata={xnftList[0].metadata}
          />
          <CategoryPreview className="pb-14" title="Popular" xnfts={xnftList} />
        </>
      )}
      <SecondaryCta />
    </Layout>
  );
};

export default HomePage;
