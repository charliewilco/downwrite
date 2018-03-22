// TODO: remove username from boilerplate, or use it, IDK

const Hapi = require('hapi')
const jwt = require('jsonwebtoken')
const Boom = require('boom')
const routes = require('./routes')
const { db } = require('./db')
const { key } = require('./util/config')

const server = new Hapi.Server()

server.connection({
  port: 4411,
  host: 'localhost',
  routes: { cors: true }
})

server.register({
  register: require('good'),
  options: {
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ response: '*', log: '*' }]
        },
        {
          module: 'good-console'
        },
        'stdout'
      ]
    }
  }
})

server.register(require('hapi-auth-jwt'), err => {
  server.auth.strategy('jwt', 'jwt', {
    key,
    verifyOptions: {
      algorithms: ['HS256']
    }
  })

  server.route(routes)
})

server.start(err => {
  if (err) {
    throw err

    process.exit(1)
  }

  server.log('info', 'Server running at: ' + server.info.uri)
})

module.exports = server
