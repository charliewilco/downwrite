export const POST_ENDPOINT =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/posts'
		: 'https://dwn-api.now.sh/posts'
export const USER_ENDPOINT =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/users'
		: 'https://dwn-api.now.sh/users'
export const AUTH_ENDPOINT =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/users/authenticate'
		: 'https://dwn-api.now.sh/users/authenticate'
export const MD_ENDPOINT =
	process.env.NODE_ENV === 'development' ? 'http://localhost:8793/' : 'https://dwt-md.now.sh/'
