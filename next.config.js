const withOffline = require("next-offline");
const withManifest = require("next-manifest");
const withCSS = require("@zeit/next-css");

const workboxOpts = {
  runtimeCaching: [
    {
      urlPattern: /.png$/,
      handler: "CacheFirst"
    },
    {
      urlPattern: /api/,
      handler: "NetworkFirst",
      options: {
        cacheableResponse: {
          statuses: [0, 200],
          headers: {
            "x-test": "true"
          }
        }
      }
    }
  ]
};

const manifest = {
  output: "./static/",
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

module.exports = withOffline(
  withManifest(
    withCSS({
      target: "serverless",
      workboxOpts,
      manifest
    })
  )
);
