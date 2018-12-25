import { NextContext } from "next";
import * as cookie from "cookie";

export interface ICookie {
  DW_TOKEN: string;
}

export function cookies<T>(ctx: NextContext, options?: any): T | {} {
  options = options || {};
  if (ctx.req) {
    // server
    if (!ctx.req.headers) return {}; // for Static export feature of Next.js
    const cookies = ctx.req.headers.cookie;
    if (!cookies) return {};
    return cookie.parse(cookies, options);
  } else {
    // browser
    return require("component-cookie")();
  }
}
