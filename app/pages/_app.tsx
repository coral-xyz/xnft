import '../styles/globals.css';

import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import nprogress from 'nprogress';
import { ToastContainer } from 'react-toastify';
import { ContextProvider } from '../state/context/ContextProvider';

require('@solana/wallet-adapter-react-ui/styles.css');
require('nprogress/nprogress.css');
require('react-toastify/dist/ReactToastify.css');

const Footer = dynamic(() => import('../components/Footer'));
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

      <ContextProvider>
        <main>
          <div className="flex min-h-screen flex-col justify-between py-8 px-4 md:px-12">
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

          <ToastContainer
            hideProgressBar
            closeOnClick={false}
            limit={3}
            position="bottom-left"
            theme="dark"
          />
        </main>
      </ContextProvider>
    </>
  );
}
