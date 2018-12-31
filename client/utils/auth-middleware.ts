import Router from "next/router";
import { NextContext } from "next";
import Cookies, { CookieGetOptions } from "universal-cookie";
import { __IS_BROWSER__ } from "./dev";

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
// : Promise<string>
export const authMiddleware = (ctx: NextContext): string => {
  const cookie = cookies<ICookie>(ctx) as ICookie;
  const token = cookie.DW_TOKEN;

  if (ctx.req && !token) {
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
    return;
  }

  if (!token) {
    Router.push("/login");
  }

  return token;
};
