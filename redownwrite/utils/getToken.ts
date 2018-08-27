import Cookies from 'universal-cookie'

// const { cookies } = req.universalCookies
// const userID = req ? cookies.DW_USERID : ck.get('DW_USERID')
// const username = req ? cookies.DW_USERNAME : ck.get('DW_USERNAME')

export default (req, query) => {
  const ck = new Cookies()

  const token = req
    ? req.universalCookies.cookies.DW_TOKEN
    : query.token || ck.get('DW_TOKEN')

  return token
}
