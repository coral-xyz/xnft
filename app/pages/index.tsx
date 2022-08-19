import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import xNFT, { type SerializedXnftWithMetadata, type XnftWithMetadata } from '../utils/xnft';
import Layout from '../components/Layout';

const App = dynamic(() => import('../components/App'));
const CategoryPreview = dynamic(() => import('../components/Category/CategoryPreview'));
const SecondaryCta = dynamic(() => import('../components/SecondaryCta'));

/**
 * Generate the static props to provide to this page during build.
 * @export
 */
export async function getStaticProps() {
  const xnfts: XnftWithMetadata[] = await xNFT.getAll();

  return {
    props: {
      data: JSON.stringify(xnfts)
    },
    revalidate: 30
  };
}

const HomePage: NextPage<{ data: string }> = ({ data }) => {
  const xnftList: SerializedXnftWithMetadata[] = JSON.parse(data);

  return (
    <Layout contentClassName="flex flex-col gap-12">
      {xnftList.length > 0 && (
        <>
          <App featured price={parseInt(xnftList[0].account.installPrice, 16)} xnft={xnftList[0]} />
          <CategoryPreview className="pb-14" title="Popular" xnfts={xnftList} />
        </>
      )}
      <SecondaryCta />
    </Layout>
  );
};

export default HomePage;
