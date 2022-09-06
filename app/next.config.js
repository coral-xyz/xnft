const withBundleAnalyzer = require('@next/bundle-analyzer');
const { withSentryConfig } = require('@sentry/nextjs');
const { withPlausibleProxy } = require('next-plausible');

/** @type {import('next').NextConfig} */
const moduleExports = withBundleAnalyzer({ enabled: process.env.ANALYZER === 'true' })(
  withPlausibleProxy()(
    withSentryConfig({
      sentry: { hideSourceMaps: true },
      swcMinify: true,
      reactStrictMode: true,
      experimental: {
        newNextLinkBehavior: true,
        scrollRestoration: true,
        legacyBrowsers: false,
        runtime: 'nodejs'
      },
      images: {
        domains: [
          'xnfts-dev.s3.us-west-2.amazonaws.com',
          'xnfts.s3.us-west-2.amazonaws.com',
          'nftstorage.link'
        ],
        formats: ['image/avif', 'image/webp']
      },
      typescript: {
        ignoreBuildErrors: true
      }
    })
  )
);

module.exports = moduleExports;
