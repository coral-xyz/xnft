import '../styles/globals.css';
import type { AppProps } from 'next/app';
import PlausibleProvider from 'next-plausible';
import Head from 'next/head';
import Nav from '../components/Nav';
import { ContextProvider } from '../state/context/ContextProvider';
import Footer from '../components/Footer';

require('@solana/wallet-adapter-react-ui/styles.css');

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="twitter:description" content="Built on coralOS, the xNFT operating system." />
        <meta name="twitter:title" content="Backpack - A home for your xNFT apps" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://www.backpack.app/_next/image?url=%2Fbrands%2Fbackpack-twitter.png&w=3840&q=75"
        />
        <title>xNFT Library</title>
      </Head>

      <PlausibleProvider domain="xnft.gg" trackOutboundLinks={true}>
        <ContextProvider>
          <div className="bg-theme-background">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between">
              <div className="pb-10">
                <Nav />
              </div>

              <div className="mb-auto px-5 py-10">
                <Component {...pageProps} />
              </div>

              <div className="items-end pb-8">
                <Footer />
              </div>
            </div>
          </div>
        </ContextProvider>
      </PlausibleProvider>
    </>
  );
}

export default MyApp;
