import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="charset" content="utf-8" />
        <meta name="description" content="Built on coralOS, the xNFT operating system." />
        <meta name="theme-color" content="#18181B" />
        <meta name="referrer" content="no-referrer" />

        <meta name="twitter:site" content="@0xCoral" />
        <meta name="twitter:url" content="https://xnft.gg" />
        <meta name="twitter:title" content="A home for your xNFT apps" />
        <meta name="twitter:description" content="Built on coralOS, the xNFT operating system." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://xnft.gg/coral.png" />
        <meta name="twitter:image:alt" content="Coral logo" />

        <link rel="manifest" href="manifest.json" />
        <link rel="icon" sizes="192x192" href="/coral.png" />
        <link rel="apple-touch-icon" href="/coral.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-[#18181B]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
