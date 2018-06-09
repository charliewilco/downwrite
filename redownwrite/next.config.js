// TODO: sw-precache-plugin
// TODO: Migrate all older CSS files to resets with styled-components
// TODO: Default props `delete window.__initialData__`
// TODO: Look into React Loadable failures
// -- Maybe the imported component needs to be Loadble in the `findRoute()`
// -- Maybe remove Loadable and iterate to it, there's a lot less code now Perf wise
// TODO: Investigate vanishing div on rehydrate
// TODO: Remove useless non-js imports
// -- Reset.css
// -- Moving custom properties to variables

const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const withCSS = require('@zeit/next-css')

module.exports = withCSS({
  webpack: config => {
    config.plugins.push(
      new SWPrecacheWebpackPlugin({
        verbose: true,
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
