import { NextContext } from "next";
import Cookies, { CookieGetOptions } from "universal-cookie";

export interface ICookie {
  DW_TOKEN: string;
}

export function cookies<T>(
  context: NextContext,
  options?: CookieGetOptions
): T | {} {
  options = options || {};
  if (context.req) {
    // Server
    if (!context.req.headers) return {}; // for Static export feature of Next.js
    const cookies = new Cookies(context.req.headers.cookie);
    if (!cookies) return {};
    return cookies.getAll(options);
  } else {
    // Client
    const cookies = new Cookies();

    return cookies.getAll(options);
  }
}
