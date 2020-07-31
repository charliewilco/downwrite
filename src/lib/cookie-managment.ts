import { NextApiRequest } from "next";
import { serialize, parse } from "cookie";
import { ServerResponse, IncomingMessage } from "http";
import decode from "jwt-decode";
import { readToken, getInitialState, TokenContents } from "./token";
import { IAppState } from "@reducers/app";

export const TOKEN_NAME = "DW_TOKEN";

export const MAX_AGE = 60 * 60 * 8; // 8 hours

export function setTokenCookie(res: ServerResponse, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax"
  });

  res.setHeader("Set-Cookie", cookie);
}

export function removeTokenCookie(res: ServerResponse) {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/"
  });

  res.setHeader("Set-Cookie", cookie);
}

export function parseCookies(req: IncomingMessage | NextApiRequest) {
  // For API Routes we don't need to parse the cookies.
  if ((req as NextApiRequest).cookies) {
    return (req as NextApiRequest).cookies;
  }

  // For pages we do need to parse the cookies.
  const cookie = req.headers!.cookie;
  return parse(cookie || "");
}

export function getTokenCookie(req: IncomingMessage | NextApiRequest) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

export function getUserToken(req: IncomingMessage | NextApiRequest) {
  const token = getTokenCookie(req);

  if (!token) return;

  return readToken(token);
}

export async function getInitialStateFromCookie(
  req: IncomingMessage | NextApiRequest
): Promise<IAppState> {
  return new Promise((resolve, reject) => {
    const { DW_TOKEN } = parseCookies(req);
    if (!DW_TOKEN) {
      reject("No token available");
    }
    const d = decode<TokenContents>(DW_TOKEN);
    const state = getInitialState(d);
    resolve(state);
  });
}
