import { NextContext } from "next";
import * as cookie from "cookie";

export interface ICookie {
  DW_TOKEN: string;
}

export function cookies<T>(
  context: NextContext,
  options?: cookie.CookieParseOptions
): T | {} {
  options = options || {};
  if (context.req) {
    // server
    if (!context.req.headers) return {}; // for Static export feature of Next.js
    const cookies = context.req.headers.cookie;
    if (!cookies) return {};
    return cookie.parse(cookies, options);
  } else {
    // browser
    // TOOD: Rethink this, should be able to use `universal-cookie`
    return require("component-cookie")();
  }
}
