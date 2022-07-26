import { PublicKey } from '@solana/web3.js';
import React from 'react';
import type { GetStaticPropsContext } from 'next';
import dynamic from 'next/dynamic';
import { getAllXNFTs, getXNFT } from '../../utils/xnft';

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

export async function getStaticProps(context: GetStaticPropsContext) {
  const xnft = await getXNFT(new PublicKey(context.params?.xnftPK));

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
