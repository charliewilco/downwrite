// import Router from "next/router";
import { NextPageContext } from "next";
import Cookies, { CookieGetOptions } from "universal-cookie";
import { __IS_BROWSER__ } from "./dev";

export interface ICookie {
  DW_TOKEN: string;
}

export function cookies<T>(
  context: NextPageContext,
  options?: CookieGetOptions
): T | {} {
  options = options || {};
  let cookies;
  if (context.req) {
    // Server
    if (!context.req.headers) return {}; // for Static export feature of Next.js
    cookies = new Cookies(context.req.headers.cookie);
    if (!cookies) return {};
    return cookies.getAll(options);
  } else {
    // Client
    cookies = new Cookies();

    return cookies.getAll(options);
  }
}
// : Promise<string>

export const WHITE_LIST: string[] = ["/about", "/preview"];

export const authMiddleware = (ctx: NextPageContext): string => {
  const cookie = cookies<ICookie>(ctx) as ICookie;
  const token = cookie.DW_TOKEN;

  // if (ctx.req && !token) {
  //   ctx.res.writeHead(302, { Location: "/login" });
  //   ctx.res.end();
  //   return;
  // }

  if (!token) {
    // if (__IS_BROWSER__) {
    //   Router.push("/login");
    // }

    if (ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();

      return;
    }
  }

  return token;
};
