// import Router from "next/router";
import { NextPageContext } from "next";
import Cookies from "universal-cookie";
import { __IS_BROWSER__ } from "./dev";

export const WHITE_LIST: string[] = ["/about", "/preview"];

export const authMiddleware = (ctx: NextPageContext): string => {
  const cookies = new Cookies(ctx.req);
  const token = cookies.get<string>("DW_TOKEN");

  if (!token) {
    if (ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();

      return;
    }
  }

  return token;
};
