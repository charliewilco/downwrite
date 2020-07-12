const withFonts = require("next-fonts");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

module.exports = withBundleAnalyzer(
  withFonts({
    experimental: {
      jsconfigPaths: true // enables it for both jsconfig.json and tsconfig.json
    }
  })
);
