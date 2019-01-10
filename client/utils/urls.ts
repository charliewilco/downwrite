import { __IS_DEV__, __IS_BROWSER__ } from "./dev";

// const DEV_URL = "http://localhost:5000/api";
// const PROD_URL = "https://next.downwrite.us/api";
// const URL: string = __IS_DEV__ ? DEV_URL : PROD_URL;

export const POST_ENDPOINT: string = `/api/posts`;
export const PREVIEW_ENDPOINT: string = `/api/posts/preview`;
export const USER_ENDPOINT: string = `/api/users`;
export const PASSWORD_ENDPOINT: string = `/api/password`;
export const SETTINGS_ENDPOINT: string = `/api/users/settings`;
export const AUTH_ENDPOINT: string = `/api/users/authenticate`;

export const prefixURL = (url: string): string => {
  let prefix = __IS_DEV__ ? "http://" : "https://";
  return !url.startsWith("http") ? prefix + url : url;
};

export const createURL = (endpoint: string, hostname?: string): string => {
  let url: string = "";
  const API_URL = __IS_DEV__ ? "http://localhost:5000" : "https://next.downwrite.us";

  if (hostname) {
    url = prefixURL(__IS_DEV__ ? "localhost:5000" : hostname);
    return url + endpoint;
  }

  return API_URL + endpoint;
};
