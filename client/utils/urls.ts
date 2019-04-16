import { __IS_DEV__, __IS_BROWSER__, __IS_TEST__ } from "./dev";

// const DEV_URL = "http://localhost:5000/api";
// const PROD_URL = "https://next.downwrite.us/api";
// const URL: string = __IS_DEV__ ? DEV_URL : PROD_URL;

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

/**
 * Creates url string for both server and client based off header
 * @param url
 * @param hostname
 * @returns string
 */
export function createURL(endpoint: string, hostname?: string): string {
  if (__IS_BROWSER__ && !__IS_TEST__) {
    return endpoint;
  }
  let url: string = prefixURL(hostname) + endpoint;
  return url;
}
