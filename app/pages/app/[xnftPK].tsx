import { PublicKey } from '@solana/web3.js';
import type { GetStaticPropsContext, NextPage } from 'next';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import xNFT from '../../utils/xnft';

const Tabs = dynamic(() => import('../../components/AppView/Tabs'));
const Banner = dynamic(() => import('../../components/AppView/Banner'));

export async function getStaticPaths() {
  const data = await xNFT.getAll();

  const paths = data.map(xnft => {
    return {
      params: { xnftPK: xnft.publicKey.toBase58() }
    };
  });

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const xnft = await xNFT.get(new PublicKey(context.params?.xnftPK));

  return {
    props: {
      data: JSON.stringify(xnft)
    },
    revalidate: 60
  };
}

const AppPage: NextPage<{ data: any }> = ({ data }) => {
  const xnft = JSON.parse(data);

  return (
    <Layout>
      <Banner xnft={xnft} />
      <Tabs xnft={xnft} />
    </Layout>
  );
};

export default AppPage;
