import Cookies from 'universal-cookie'

export default (req, query) => {
	const ck = new Cookies()

	const token = req ? req.universalCookies.cookies.DW_TOKEN : query.token || ck.get('DW_TOKEN')
	const userID = req ? req.universalCookies.cookies.DW_USERID : ck.get('DW_USERID')
	const username = req ? req.universalCookies.cookies.DW_USERNAME : ck.get('DW_USERNAME')

	return {
		token,
		userID,
		username
	}
}
