const jwt = require('jsonwebtoken')
const { key } = require('./config')

module.exports = function(user) {
  let scopes

  if (user.admin) {
    scopes = 'admin'
  }

  const jwtConfig = {
    algorithm: 'HS256',
    expiresIn: '180 days'
  }

  const data = {
    user: user._id,
    name: user.username,
    scope: scopes
  }

  return jwt.sign(data, key, jwtConfig)
}
