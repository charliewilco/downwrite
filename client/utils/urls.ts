import { __IS_DEV__ } from "./dev";

const DEV_URL = "http://localhost:3000/api";
const PROD_URL = "https://beta.downwrite.us/api";

const URL: string = __IS_DEV__ ? DEV_URL : PROD_URL;

export const POST_ENDPOINT: string = `${URL}/posts`;

export const PREVIEW_ENDPOINT: string = `${URL}/posts/preview`;

export const USER_ENDPOINT: string = `${URL}/users`;

export const PASSWORD_ENDPOINT: string = `${URL}/password`;

export const SETTINGS_ENDPOINT: string = `${URL}/users/settings`;

export const AUTH_ENDPOINT: string = `${URL}/users/authenticate`;
