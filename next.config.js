// @ts-check
const bundleAnalyzer = require("@next/bundle-analyzer");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: Boolean(process.env.ANALYZE === "true")
});

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  cleanDistDir: true
};

module.exports = withBundleAnalyzer(config);
