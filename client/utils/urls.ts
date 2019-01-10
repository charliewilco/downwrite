import { __IS_DEV__, __IS_BROWSER__, __IS_TEST__ } from "./dev";

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
  if (!url) {
    return "";
  }

  if (__IS_DEV__) {
    url = url.replace("3000", "5000");
  }

  let prefix = __IS_DEV__ ? "http://" : "https://";
  return !url.startsWith("http") ? prefix + url : url;
};

export const createURL = (endpoint: string, hostname?: string): string => {
  if (__IS_BROWSER__ && !__IS_TEST__) {
    return endpoint;
  }
  let url: string = prefixURL(hostname) + endpoint;
  return url;
};
