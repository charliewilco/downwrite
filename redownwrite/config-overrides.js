const { ReactLoadablePlugin } = require('react-loadable/webpack')

module.exports = function override(config) {
  config.plugins.push(
    new ReactLoadablePlugin({
      filename: './build/react-loadable.json'
    })
  )
  return config
}
