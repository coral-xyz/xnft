import React from 'react';
import dynamic from 'next/dynamic';
import { getAllXNFTs, getXNFT } from '../../utils/xnft-client';

const Tabs = dynamic(() => import('../../components/View/Tabs'));
const AppBanner = dynamic(() => import('../../components/View/Banner'));

export async function getStaticPaths() {
  const data = await getAllXNFTs();

  const paths = data.map(xnft => {
    return {
      params: { xnftPK: xnft.accounts.publicKey.toBase58() }
    };
  });

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps(context) {
  const xnft = await getXNFT(context.params.xnftPK);

  return {
    props: {
      data: JSON.stringify(xnft)
    },
    revalidate: 60
  };
}

export default function App({ data }) {
  const xnft = JSON.parse(data);

  return (
    <>
      <AppBanner xnft={xnft} />
      <Tabs xnft={xnft} />
    </>
  );
}
