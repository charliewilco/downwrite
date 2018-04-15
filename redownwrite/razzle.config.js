const { ReactLoadablePlugin } = require('react-loadable/webpack')

module.exports = {
  modify: (config, { target, dev }, webpack) => {
    config.plugins.push(
      new ReactLoadablePlugin({
        filename: './build/react-loadable.json'
      })
    )
    return config
  }
}
