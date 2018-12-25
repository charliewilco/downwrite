import Router from "next/router";
import { NextContext } from "next";
import { cookies, ICookie } from "./cookies";
import { __IS_BROWSER__ } from "./dev";

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
