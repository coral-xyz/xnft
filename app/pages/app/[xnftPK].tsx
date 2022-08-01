import { PublicKey } from '@solana/web3.js';
import type { GetStaticPropsContext, NextPage } from 'next';
import dynamic from 'next/dynamic';
import { getAllXNFTs, getXNFT } from '../../utils/xnft';

const Tabs = dynamic(() => import('../../components/View/Tabs'));
const AppBanner = dynamic(() => import('../../components/View/Banner'));

export async function getStaticPaths() {
  const data = await getAllXNFTs();

  const paths = data.map(xnft => {
    return {
      params: { xnftPK: xnft.publicKey.toBase58() }
    };
  });

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const xnft = await getXNFT(new PublicKey(context.params?.xnftPK));

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
    <>
      <AppBanner xnft={xnft} />
      <Tabs xnft={xnft} />
    </>
  );
};

export default AppPage;
