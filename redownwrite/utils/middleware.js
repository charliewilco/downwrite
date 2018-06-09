const jwt = require('jsonwebtoken')

const verifyJWT = token =>
  new Promise(resolve =>
    resolve(jwt.verify(token, 'b2d45bbb-4277-4397-b8d2-a6c67a8003f5'))
  )

const isLoggedIn = async (req, res, next) => {
  const token = req.universalCookies.get('DW_TOKEN')

  if (token) {
    const { user } = await verifyJWT(token)

    return user && next()
  }

  return res.redirect('/login')
}

const isNotLoggedIn = async (req, res, next) => {
  const token = req.universalCookies.get('DW_TOKEN')

  if (token) {
    const { user } = await verifyJWT(token)

    console.log('i made in the if statement')

    return user && next()
  }

  return res.redirect('/login')
}

module.exports = { verifyJWT, isLoggedIn, isNotLoggedIn }
