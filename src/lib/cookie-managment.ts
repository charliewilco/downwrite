import { NextApiRequest } from "next";
import { serialize, parse } from "cookie";
import { ServerResponse, IncomingMessage } from "http";
import decode from "jwt-decode";
import { readToken, getInitialState, TokenContents, IReadResults } from "./token";
import { IAppState, initialState } from "@reducers/app";
import { __IS_PROD__ } from "@utils/dev";

export const TOKEN_NAME = "DW_TOKEN";

export const MAX_AGE = 60 * 60 * 8; // 8 hours

export type __NextRequest = IncomingMessage | NextApiRequest;

export const setTokenCookie = (res: ServerResponse, token: string) =>
  res.setHeader(
    "Set-Cookie",
    serialize(TOKEN_NAME, token, {
      httpOnly: true,
      secure: !Boolean(process.env.NO_HTTPS),
      path: "/",
      sameSite: "lax"
    })
  );

export const removeTokenCookie = (res: ServerResponse) =>
  res.setHeader(
    "Set-Cookie",
    serialize(TOKEN_NAME, "", {
      maxAge: -1,
      path: "/"
    })
  );

export const parseCookies = (req: __NextRequest) => {
  // For API Routes we don't need to parse the cookies.
  if ((req as NextApiRequest).cookies) {
    return (req as NextApiRequest).cookies;
  }

  // For pages we do need to parse the cookies.
  const cookie = req.headers!.cookie;
  return parse(cookie || "");
};

export const getTokenFromHeader = (req: __NextRequest): string => {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME] || req.headers.authorization;
};

export const getUserTokenContents = (req: __NextRequest): IReadResults => {
  const token = getTokenFromHeader(req);

  if (!token) return;

  return readToken(token);
};

export const getInitialStateFromCookie = async (
  req: __NextRequest
): Promise<IAppState> =>
  new Promise((resolve, reject) => {
    const token = getTokenFromHeader(req);
    if (!token) {
      resolve(initialState);
    }
    const d = decode<TokenContents>(token);
    const state = getInitialState(d);
    resolve(state);
  });
