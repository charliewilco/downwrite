const withOffline = require("next-offline");
const withManifest = require("next-manifest");

const manifest = {
  dir: "ltr",
  lang: "en",
  short_name: "Dwnxt",
  name: "Downwrite Next",
  description: "A place to write",
  icons: [
    {
      src: "icon192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "icon256.png",
      sizes: "256x256",
      type: "image/png"
    },
    {
      src: "icon512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "icon1024.png",
      sizes: "1024x1024",
      type: "image/png"
    }
  ],
  theme_color: "#4FA5C2",
  background_color: "#4FA5C2",
  start_url: "/?utm_source=homescreen",
  display: "standalone"
};

const workboxOpts = {
  swDest: "static/service-worker.js",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "networkFirst",
      options: {
        cacheName: "https-calls",
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 1 month
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
};

const { PHASE_PRODUCTION_SERVER } =
  process.env.NODE_ENV === "development"
    ? require("next/constants")
    : require("next-server/constants");

const config = {
  manifest,
  workboxOpts
};

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    // Config used to run in production.
    return withManifest(withOffline(config));
  }
  // ✅ Put the require call here.

  const withCSS = require("@zeit/next-css");
  const withTypescript = require("@zeit/next-typescript");
  const withMDX = require("@zeit/next-mdx")({
    extension: /\.mdx?$/
  });

  return withTypescript(withMDX(withCSS(withManifest(withOffline(config)))));
};
