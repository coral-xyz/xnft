import '../styles/globals.css';

import { RecoilRoot } from 'recoil';
import type { AppProps } from 'next/app';
import PlausibleProvider from 'next-plausible';
import Head from 'next/head';
import Nav from '../components/Nav';
import { ContextProvider } from '../state/context/ContextProvider';
import Footer from '../components/Footer';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0" />
        <title>xNFT Library</title>
      </Head>

      <RecoilRoot>
        <PlausibleProvider domain="xnft.gg" trackOutboundLinks={true}>
          <ContextProvider>
            <main>
              <div className="flex min-h-screen flex-col justify-between py-8 px-12">
                <section className="border-b-[1px] border-b-[#393C43] pb-8">
                  <Nav />
                </section>

                <section className="mb-auto py-10">
                  <Component {...pageProps} />
                </section>

                <section className="items-end pb-8">
                  <Footer />
                </section>
              </div>
            </main>
          </ContextProvider>
        </PlausibleProvider>
      </RecoilRoot>
    </>
  );
}
