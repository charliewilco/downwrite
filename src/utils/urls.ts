import { __IS_DEV__, __IS_BROWSER__, __IS_TEST__ } from "./dev";

// const DEV_URL = "http://localhost:3000/api";
// const PROD_URL = "https://next.downwrite.us/api";
// const URL: string = __IS_DEV__ ? DEV_URL : PROD_URL;

const PORT: string = process.env.PORT;
export const SECRET_KEY =
  process.env.SECRET_KEY || "1a9876c4-6642-4b83-838a-9e84ee00646a";

export class URLEndpoints {
  public static prefix(url: string, port: string = "3000"): string {
    if (!url) {
      return "";
    }

    if (__IS_DEV__ && port !== "5000") {
      url = url.replace("5000", port);
    }

    let prefix = __IS_DEV__ ? "http://" : "https://";
    return !url.startsWith("http") ? prefix + url : url;
  }

  /**
   * Creates url string for both server and client based off header
   * @param url
   * @param hostname
   * @returns string
   */
  public static create(
    endpoint: string,
    hostname?: string,
    port: string = process.env.PORT || "3000"
  ): string {
    if (__IS_BROWSER__ && !__IS_TEST__) {
      return endpoint;
    }

    if (__IS_DEV__) {
      return `http://localhost:${PORT}`.concat(endpoint);
    }
    let url: string = URLEndpoints.prefix(hostname, port).concat(endpoint);

    return url;
  }
}
