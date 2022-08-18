import '../styles/globals.css';

import { RecoilRoot } from 'recoil';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import PlausibleProvider from 'next-plausible';
import nprogress from 'nprogress';
import { ContextProvider } from '../state/context/ContextProvider';

require('@solana/wallet-adapter-react-ui/styles.css');
require('nprogress/nprogress.css');

const Footer = dynamic(() => import('../components/Footer'));
const MobilePlaceholder = dynamic(() => import('../components/Placeholders/Mobile'));
const Nav = dynamic(() => import('../components/Nav'));

Router.events.on('routeChangeStart', nprogress.start);
Router.events.on('routeChangeError', nprogress.done);
Router.events.on('routeChangeComplete', nprogress.done);

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
              <div className="flex min-h-screen flex-col justify-between py-8 px-4 md:px-12">
                <section className="border-b-[1px] border-b-[#393C43] pb-8">
                  <Nav />
                </section>

                <section className="mb-auto hidden py-10 md:block">
                  <Component {...pageProps} />
                </section>
                <MobilePlaceholder className="md:hidden" />

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
