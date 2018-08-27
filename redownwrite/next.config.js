const withOffline = require('next-offline')
const withManifest = require('next-manifest')
const withCSS = require('@zeit/next-css')
const withTypescript = require('@zeit/next-typescript')

const manifest = {
  dir: 'ltr',
  lang: 'en',
  short_name: 'Dwnxt',
  name: 'Downwrite Next',
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
}

module.exports = withTypescript(withCSS(withManifest(withOffline({ manifest }))))
