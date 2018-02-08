//@flow

const __IS_DEV__ = process.env.NODE_ENV === 'development'

export const POST_ENDPOINT: string = __IS_DEV__
  ? 'http://localhost:4411/posts'
  : 'https://api.downwrite.us/posts'

export const PREVIEW_ENDPOINT: string = __IS_DEV__
  ? 'http://localhost:4411/posts/preview'
  : 'https://api.downwrite.us/posts/preview'

export const USER_ENDPOINT: string = __IS_DEV__
  ? 'http://localhost:4411/users'
  : 'https://api.downwrite.us/users'

export const AUTH_ENDPOINT: string = __IS_DEV__
  ? 'http://localhost:4411/users/authenticate'
  : 'https://api.downwrite.us/users/authenticate'
