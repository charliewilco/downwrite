// @ts-check
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const graphqlRule = {
  test: /\.(graphql|gql)$/,
  exclude: /node_modules/,
  loader: "graphql-tag/loader"
};

const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push(graphqlRule);
    return config;
  },
  webpackDevMiddleware: (config) => {
    return config;
  }
};

module.exports = withBundleAnalyzer(config);
