const jwt = require('jsonwebtoken')

let key = process.env.SECRET_KEY
  ? '1a9876c4-6642-4b83-838a-9e84ee00646a'
  : process.env.SECRET_KEY

const verifyJWT = token => new Promise(resolve => resolve(jwt.verify(token, key)))

const isNotLoggedIn = async (req, res, next) => {
  const token = req.universalCookies.get('DW_TOKEN')

  if (token) {
    const { user } = await verifyJWT(token)

    return user && next()
  }

  return res.redirect('/login')
}

module.exports = { verifyJWT, isNotLoggedIn }
