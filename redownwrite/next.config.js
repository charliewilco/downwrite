// TODO: sw-precache-plugin
// TODO: Manifest
// TODO: Migrate all older CSS files to resets with styled-components
// TODO: Remove useless non-js imports
// -- Reset.css
// -- Moving custom properties to variables

const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const withManifest = require('next-manifest')
const withCSS = require('@zeit/next-css')

module.exports = withManifest(
  withCSS({
    manifest: {
      dir: 'ltr',
      lang: 'en',
      short_name: 'DownwriteNext',
      name: 'Downwrite Next',
      display: 'standalone',
      description: 'A place to write',
      icons: [
        {
          src: 'icon192-beta.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon256-beta.png',
          sizes: '256x256',
          type: 'image/png'
        },
        {
          src: 'icon512-beta.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'icon1024-beta.png',
          sizes: '1024x1024',
          type: 'image/png'
        }
      ],
      theme_color: '#4FA5C2',
      background_color: '#4FA5C2',
      start_url: '/?utm_source=homescreen',
      display: 'standalone'
    },
    webpack: config => {
      config.plugins.push(
        new SWPrecacheWebpackPlugin({
          verbose: true,
          filename: 'sw.js',
          staticFileGlobsIgnorePatterns: [/\.next\//],
          runtimeCaching: [
            {
              handler: 'networkFirst',
              urlPattern: /^https?.*/
            }
          ]
        })
      )

      return config
    }
  })
)
