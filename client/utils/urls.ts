import { __IS_DEV__ } from "./dev";

// const DEV_URL = "http://localhost:5000/api";
// const PROD_URL = "https://next.downwrite.us/api";
// const URL: string = __IS_DEV__ ? DEV_URL : PROD_URL;

export const POST_ENDPOINT: string = `/api/posts`;

export const PREVIEW_ENDPOINT: string = `/api/posts/preview`;

export const USER_ENDPOINT: string = `/api/users`;

export const PASSWORD_ENDPOINT: string = `/api/password`;

export const SETTINGS_ENDPOINT: string = `/api/users/settings`;

export const AUTH_ENDPOINT: string = `/api/users/authenticate`;

export const prefixURL = (p: string, url: string): string => p + url;
