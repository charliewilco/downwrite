import { __IS_DEV__ } from './dev';

const DEV_URL = 'http://localhost:3000/api';
const PROD_URL = 'https://beta.downwrite.us/api';

export const POST_ENDPOINT: string = __IS_DEV__
  ? `${DEV_URL}/posts`
  : `${PROD_URL}/posts`;

export const PREVIEW_ENDPOINT: string = __IS_DEV__
  ? `${DEV_URL}/posts/preview`
  : `${PROD_URL}/posts/preview`;

export const USER_ENDPOINT: string = __IS_DEV__
  ? `${DEV_URL}/users`
  : `${PROD_URL}/users`;

export const AUTH_ENDPOINT: string = __IS_DEV__
  ? `${DEV_URL}/users/authenticate`
  : `${PROD_URL}/users/authenticate`;
