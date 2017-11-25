//@flow

export const POST_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/posts'
		: 'https://api.downwrite.us/posts'


export const PREVIEW_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/posts/preview'
		: 'https://api.downwrite.us/posts/preview'

export const USER_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/users'
		: 'https://api.downwrite.us/users'

export const AUTH_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:4411/users/authenticate'
		: 'https://api.downwrite.us/users/authenticate'

export const MD_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:8793/'
		: 'https://markdown.downwrite.us/'

export const JSON_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:8794/'
		: 'https://json.downwrite.us/'

export const MEDIUM_ENDPOINT: string =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:6335/'
		: 'https://medium.downwrite.us/'
