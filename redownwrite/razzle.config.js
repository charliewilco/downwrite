const { ReactLoadablePlugin } = require('react-loadable/webpack')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

module.exports = {
  modify: (config, { target, dev }, webpack) => {
    if (target === 'web') {
      return {
        ...config,
        plugins: [
          ...config.plugins,
          new ReactLoadablePlugin({
            filename: './build/react-loadable.json'
          }),
          new SWPrecacheWebpackPlugin({
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            filename: './build/service-worker.js',
            logger(message) {
              if (message.indexOf('Total precache size is') === 0) {
                return
              }
              if (message.indexOf('Skipping static resource') === 0) {
                return
              }
              console.log(message)
            },
            minify: true,
            staticFileGlobsIgnorePatterns: [/\.map$/, /assets\.json$/]
            // navigateFallback: publicUrl + '/index.html',
            // navigateFallbackWhitelist: [/^(?!\/__).*/],
          })
        ]
      }
    }

    return config
  }
}
