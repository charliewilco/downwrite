const jwt = require('jsonwebtoken')

const verifyJWT = token =>
  new Promise(resolve =>
    resolve(jwt.verify(token, 'b2d45bbb-4277-4397-b8d2-a6c67a8003f5'))
  )

const isNotLoggedIn = async (req, res, next) => {
  const token = req.universalCookies.get('DW_TOKEN')

  if (token) {
    const { user } = await verifyJWT(token)

    return user && next()
  }

  return res.redirect('/login')
}

const isLoggedIn = async (req, res, next) => {
  const token = req.universalCookies.get('DW_TOKEN')

  if (!token) {
    return res.redirect('/')
  } else {
    return next()
  }
}

module.exports = { verifyJWT, isLoggedIn, isNotLoggedIn }
