const { ReactLoadablePlugin } = require('react-loadable/webpack')

module.exports = {
  webpack: (config, options, webpack) => {
    // Perform customizations to config
    // Important: return the modified config

    // changes the name of the entry point from index -> main.js
    config.entry.main = ['./src/server.js']

    config.plugins.push(new webpack.IgnorePlugin(/\.(css|img|svg)$/))
    config.plugins.push(new ReactLoadablePlugin({ filename: './dist/react-loadable' }))

    return config
  }
}
