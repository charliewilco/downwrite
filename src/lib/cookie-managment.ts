import { serialize, parse } from "cookie";
import { IncomingMessage, ServerResponse } from "http";
import decode from "jwt-decode";
import { getInitialState, TokenContents } from "./token";
import { IAppState } from "@reducers/app";
import { __IS_PROD__ } from "@utils/dev";

export const TOKEN_NAME = "DW_TOKEN";

export const removeTokenCookie = (res: ServerResponse) =>
  res.setHeader(
    "Set-Cookie",
    serialize(TOKEN_NAME, "", {
      maxAge: -1,
      path: "/"
    })
  );

export const getInitialStateFromCookie = async (
  req: IncomingMessage & { cookies: { [key: string]: string } }
): Promise<IAppState> =>
  new Promise((resolve, reject) => {
    const cookies = req.cookies ?? parse(req.headers.cookie);
    const token = cookies[TOKEN_NAME] ?? req.headers.authorization;
    if (!token) {
      reject("No token available");
    }
    const d = decode<TokenContents>(token);
    const state = getInitialState(d);
    resolve(state);
  });
