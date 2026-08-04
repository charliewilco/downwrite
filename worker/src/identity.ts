import type { Context } from "hono";
import { HttpError } from "./http.js";
import { sha256Base64Url } from "./crypto.js";
import type { Env, Identity, Storage } from "./types.js";

const SESSION_COOKIE = "dw_session";

type TokenMap = Map<string, string>;

function parseTokenMap(raw: string | undefined): TokenMap {
  const pairs = new Map<string, string>();

  for (const entry of raw?.split(",") ?? []) {
    const [identityId, token] = entry.split(":").map((part) => part.trim());
    if (identityId && token) {
      pairs.set(token, identityId);
    }
  }

  return pairs;
}

export async function readIdentity(
  c: Context<{ Bindings: Env }>,
  storage: Storage,
): Promise<Identity> {
  const sessionToken = readCookie(c.req.header("cookie") ?? "", SESSION_COOKIE);

  if (sessionToken) {
    const session = await storage.getSessionByTokenHash(
      await sha256Base64Url(sessionToken),
    );

    if (session && new Date(session.expiresAt).getTime() > Date.now()) {
      return { id: session.identityId, authKind: "session" };
    }
  }

  const header = c.req.header("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw new HttpError(401, "Missing session or bearer token");
  }

  const token = match[1].trim();
  const oauthToken = await storage.getOAuthAccessTokenByHash(
    await sha256Base64Url(token),
  );

  if (oauthToken) {
    if (
      oauthToken.revokedAt ||
      new Date(oauthToken.expiresAt).getTime() <= Date.now() ||
      oauthToken.resource !== expectedOAuthResource(c.req.url)
    ) {
      throw new HttpError(
        401,
        "OAuth bearer token is expired, revoked, or invalid for this resource",
      );
    }

    return {
      id: oauthToken.identityId,
      authKind: "oauth",
      scopes: oauthToken.scopes,
    };
  }

  const identityId = parseTokenMap(c.env.DEVELOPMENT_API_TOKENS).get(token);

  if (!identityId) {
    throw new HttpError(401, "Unknown bearer token");
  }

  return { id: identityId, authKind: "development" };
}

export function sessionCookie(input: {
  token: string;
  expiresAt: string;
  requestUrl: string;
}) {
  return [
    `${SESSION_COOKIE}=${input.token}`,
    "Path=/",
    "HttpOnly",
    isLocalHttp(input.requestUrl) ? null : "Secure",
    "SameSite=Lax",
    `Expires=${new Date(input.expiresAt).toUTCString()}`,
    `Max-Age=${Math.max(
      0,
      Math.floor((new Date(input.expiresAt).getTime() - Date.now()) / 1000),
    )}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(requestUrl: string) {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    isLocalHttp(requestUrl) ? null : "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
}

export function readSessionCookie(cookieHeader: string) {
  return readCookie(cookieHeader, SESSION_COOKIE);
}

function readCookie(cookieHeader: string, name: string) {
  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (rawName === name) {
      return rawValue.join("=");
    }
  }

  return null;
}

function isLocalHttp(requestUrl: string) {
  const url = new URL(requestUrl);
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1")
  );
}

function expectedOAuthResource(requestUrl: string) {
  const url = new URL(requestUrl);
  return url.pathname === "/mcp" ? `${url.origin}/mcp` : `${url.origin}/api/v1`;
}
