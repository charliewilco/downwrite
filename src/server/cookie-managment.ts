import { serialize, parse } from "cookie";
import { IncomingMessage, ServerResponse } from "http";
import { readToken } from "./token";
import { __IS_PROD__ } from "@shared/constants";
import { TOKEN_NAME } from "@shared/constants";

export const removeTokenCookie = (res: ServerResponse) =>
  res.setHeader(
    "Set-Cookie",
    serialize(TOKEN_NAME, "", {
      maxAge: -1,
      path: "/"
    })
  );

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

export const MAX_AGE = 60 * 60 * 8; // 8 hours

export type __NextRequest = IncomingMessage;

export const parseCookies = (req: IncomingMessage) => {
  // For pages we do need to parse the cookies.
  return parse(req.headers.cookie || "");
};

export const getTokenFromHeader = (req: IncomingMessage) => {
  const cookies = parse(req.headers.cookie || "");
  return cookies[TOKEN_NAME] ?? req.headers.authorization;
};

export const getUserTokenContents = (req: IncomingMessage) => {
  const token = getTokenFromHeader(req);

  if (!token) return;

  return readToken(token);
};
