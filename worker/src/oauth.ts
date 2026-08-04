import type { Context } from "hono";
import { randomToken, sha256Base64Url, timingSafeEqual } from "./crypto.js";
import { HttpError } from "./http.js";
import { readSessionCookie } from "./identity.js";
import type { Env, Identity, Storage } from "./types.js";

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_SECONDS = 30 * 24 * 60 * 60;
const AUTHORIZATION_CODE_SECONDS = 10 * 60;
const SUPPORTED_CODE_CHALLENGE_METHOD = "S256";

export const OAUTH_SCOPES = [
  "workspaces:read",
  "workspaces:write",
  "documents:read",
  "documents:write",
  "sharing:write",
  "mcp:documents",
] as const;

type OAuthScope = (typeof OAUTH_SCOPES)[number];

interface AuthorizationRequest {
  responseType: "code";
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
  scopes: OAuthScope[];
  resource: string;
  state: string | null;
}

export function oauthClientPolicy() {
  return [
    {
      clientId: "downwrite-ios",
      redirectUris: ["downwrite://oauth/callback"],
      notes:
        "Reserved public client id for the future single Downwrite iOS app.",
    },
    {
      clientId: "downwrite-mcp",
      redirectUris: [
        "http://127.0.0.1:{port}/callback",
        "http://localhost:{port}/callback",
      ],
      notes:
        "Loopback redirect policy for local MCP clients using authorization-code-with-PKCE.",
    },
  ];
}

export function parseAuthorizationRequest(url: string): AuthorizationRequest {
  const requestUrl = new URL(url);
  const origin = requestUrl.origin;
  const responseType = requiredSearch(requestUrl, "response_type");
  const clientId = requiredSearch(requestUrl, "client_id");
  const redirectUri = requiredSearch(requestUrl, "redirect_uri");
  const codeChallenge = requiredSearch(requestUrl, "code_challenge");
  const codeChallengeMethod = requiredSearch(
    requestUrl,
    "code_challenge_method",
  );
  const resource =
    requestUrl.searchParams.get("resource") ?? `${origin}/api/v1`;
  const scopes = parseScopes(requestUrl.searchParams.get("scope"));

  if (responseType !== "code") {
    throw new HttpError(400, "OAuth response_type must be code");
  }

  if (codeChallengeMethod !== SUPPORTED_CODE_CHALLENGE_METHOD) {
    throw new HttpError(400, "OAuth PKCE code_challenge_method must be S256");
  }

  assertAllowedClientRedirect(clientId, redirectUri);
  assertExpectedResource(resource, origin);
  assertScopeResourceCompatibility(scopes, resource, origin);

  return {
    responseType,
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scopes,
    resource,
    state: requestUrl.searchParams.get("state"),
  };
}

export async function renderAuthorizationPage(input: {
  c: Context<{ Bindings: Env }>;
  storage: Storage;
}) {
  const request = parseAuthorizationRequest(input.c.req.url);
  const identity = await readSessionIdentity(input);

  return input.c.html(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Authorize Downwrite Client</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: Canvas; color: CanvasText; }
      main { width: min(36rem, calc(100vw - 2rem)); border: 1px solid color-mix(in srgb, CanvasText 16%, transparent); padding: 2rem; }
      h1 { margin: 0 0 1rem; font-size: 1.5rem; }
      p, li { line-height: 1.5; }
      button { font: inherit; padding: 0.75rem 1rem; background: CanvasText; color: Canvas; border: 0; cursor: pointer; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Authorize ${escapeHtml(request.clientId)}</h1>
      <p>Signed in as <code>${escapeHtml(identity.id)}</code>.</p>
      <p>This client is requesting:</p>
      <ul>${request.scopes.map((scope) => `<li><code>${scope}</code></li>`).join("")}</ul>
      <form method="post" action="/oauth/authorize/approve">
        ${hidden("client_id", request.clientId)}
        ${hidden("redirect_uri", request.redirectUri)}
        ${hidden("code_challenge", request.codeChallenge)}
        ${hidden("code_challenge_method", request.codeChallengeMethod)}
        ${hidden("scope", request.scopes.join(" "))}
        ${hidden("resource", request.resource)}
        ${request.state ? hidden("state", request.state) : ""}
        <button type="submit">Authorize client</button>
      </form>
    </main>
  </body>
</html>`,
    200,
    { "content-type": "text/html; charset=utf-8" },
  );
}

export async function approveAuthorizationRequest(input: {
  c: Context<{ Bindings: Env }>;
  storage: Storage;
}) {
  const identity = await readSessionIdentity(input);
  const form = await input.c.req.raw.formData();
  const request = parseAuthorizationForm(form, input.c.req.url);
  const code = randomToken();
  await input.storage.createOAuthAuthorizationCode({
    codeHash: await sha256Base64Url(code),
    identityId: identity.id,
    clientId: request.clientId,
    redirectUri: request.redirectUri,
    codeChallenge: request.codeChallenge,
    scopes: request.scopes,
    resource: request.resource,
    expiresAt: secondsFromNow(AUTHORIZATION_CODE_SECONDS),
  });

  const redirect = new URL(request.redirectUri);
  redirect.searchParams.set("code", code);
  if (request.state) {
    redirect.searchParams.set("state", request.state);
  }

  return input.c.redirect(redirect.toString(), 302);
}

export async function exchangeToken(input: {
  c: Context<{ Bindings: Env }>;
  storage: Storage;
}) {
  const form = await input.c.req.raw.formData();
  const grantType = requiredForm(form, "grant_type");

  if (grantType === "authorization_code") {
    return exchangeAuthorizationCode(input, form);
  }

  if (grantType === "refresh_token") {
    return exchangeRefreshToken(input, form);
  }

  throw new HttpError(400, "Unsupported OAuth grant_type");
}

export async function revokeToken(input: {
  c: Context<{ Bindings: Env }>;
  storage: Storage;
}) {
  const form = await input.c.req.raw.formData();
  const token = requiredForm(form, "token");
  await input.storage.revokeOAuthTokenByHash(await sha256Base64Url(token));
  return input.c.body(null, 200);
}

export function assertScope(identity: Identity, scope: OAuthScope) {
  if (identity.authKind !== "oauth") {
    return;
  }

  if (!identity.scopes?.includes(scope)) {
    throw new HttpError(403, `OAuth token is missing required scope: ${scope}`);
  }
}

async function exchangeAuthorizationCode(
  input: {
    c: Context<{ Bindings: Env }>;
    storage: Storage;
  },
  form: FormData,
) {
  const clientId = requiredForm(form, "client_id");
  const redirectUri = requiredForm(form, "redirect_uri");
  const codeVerifier = requiredForm(form, "code_verifier");
  const codeHash = await sha256Base64Url(requiredForm(form, "code"));
  const code = await input.storage.getOAuthAuthorizationCodeByHash(codeHash);

  if (!code) {
    throw new HttpError(400, "Unknown OAuth authorization code");
  }
  if (code.consumedAt) {
    throw new HttpError(400, "OAuth authorization code has already been used");
  }
  if (new Date(code.expiresAt).getTime() <= Date.now()) {
    throw new HttpError(400, "OAuth authorization code has expired");
  }
  if (code.clientId !== clientId || code.redirectUri !== redirectUri) {
    throw new HttpError(400, "OAuth client or redirect_uri does not match");
  }

  const verifierChallenge = await sha256Base64Url(codeVerifier);
  if (!(await timingSafeEqual(verifierChallenge, code.codeChallenge))) {
    throw new HttpError(400, "OAuth PKCE verifier failed");
  }

  await input.storage.consumeOAuthAuthorizationCode(codeHash);
  return issueTokenResponse(input, {
    identityId: code.identityId,
    clientId: code.clientId,
    scopes: code.scopes,
    resource: code.resource,
  });
}

async function exchangeRefreshToken(
  input: {
    c: Context<{ Bindings: Env }>;
    storage: Storage;
  },
  form: FormData,
) {
  const clientId = requiredForm(form, "client_id");
  const refreshToken = requiredForm(form, "refresh_token");
  const refreshHash = await sha256Base64Url(refreshToken);
  const current = await input.storage.getOAuthRefreshTokenByHash(refreshHash);

  if (!current) {
    throw new HttpError(400, "Unknown OAuth refresh token");
  }
  if (current.revokedAt) {
    throw new HttpError(400, "OAuth refresh token has been revoked");
  }
  if (new Date(current.expiresAt).getTime() <= Date.now()) {
    throw new HttpError(400, "OAuth refresh token has expired");
  }
  if (current.clientId !== clientId) {
    throw new HttpError(400, "OAuth client_id does not match refresh token");
  }

  await input.storage.revokeOAuthTokenByHash(refreshHash);
  return issueTokenResponse(input, {
    identityId: current.identityId,
    clientId: current.clientId,
    scopes: current.scopes,
    resource: current.resource,
  });
}

async function issueTokenResponse(
  input: {
    c: Context<{ Bindings: Env }>;
    storage: Storage;
  },
  token: {
    identityId: string;
    clientId: string;
    scopes: string[];
    resource: string;
  },
) {
  const accessToken = randomToken();
  const refreshToken = randomToken();
  await input.storage.createOAuthAccessToken({
    tokenHash: await sha256Base64Url(accessToken),
    identityId: token.identityId,
    clientId: token.clientId,
    scopes: token.scopes,
    resource: token.resource,
    expiresAt: secondsFromNow(ACCESS_TOKEN_SECONDS),
  });
  await input.storage.createOAuthRefreshToken({
    tokenHash: await sha256Base64Url(refreshToken),
    identityId: token.identityId,
    clientId: token.clientId,
    scopes: token.scopes,
    resource: token.resource,
    expiresAt: secondsFromNow(REFRESH_TOKEN_SECONDS),
  });

  return input.c.json({
    token_type: "Bearer",
    access_token: accessToken,
    expires_in: ACCESS_TOKEN_SECONDS,
    refresh_token: refreshToken,
    refresh_expires_in: REFRESH_TOKEN_SECONDS,
    scope: token.scopes.join(" "),
    resource: token.resource,
  });
}

async function readSessionIdentity(input: {
  c: Context<{ Bindings: Env }>;
  storage: Storage;
}): Promise<Identity> {
  const sessionToken = readSessionCookie(input.c.req.header("cookie") ?? "");
  if (!sessionToken) {
    throw new HttpError(
      401,
      "OAuth authorization requires a signed-in session",
    );
  }

  const session = await input.storage.getSessionByTokenHash(
    await sha256Base64Url(sessionToken),
  );
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    throw new HttpError(
      401,
      "OAuth authorization requires a signed-in session",
    );
  }

  return { id: session.identityId, authKind: "session" };
}

function parseAuthorizationForm(form: FormData, requestUrl: string) {
  const origin = new URL(requestUrl).origin;
  const clientId = requiredForm(form, "client_id");
  const redirectUri = requiredForm(form, "redirect_uri");
  const codeChallenge = requiredForm(form, "code_challenge");
  const codeChallengeMethod = requiredForm(form, "code_challenge_method");
  const resource = formString(form, "resource") ?? `${origin}/api/v1`;
  const scopes = parseScopes(formString(form, "scope"));

  if (codeChallengeMethod !== SUPPORTED_CODE_CHALLENGE_METHOD) {
    throw new HttpError(400, "OAuth PKCE code_challenge_method must be S256");
  }

  assertAllowedClientRedirect(clientId, redirectUri);
  assertExpectedResource(resource, origin);
  assertScopeResourceCompatibility(scopes, resource, origin);

  return {
    clientId,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scopes,
    resource,
    state: formString(form, "state"),
  };
}

function parseScopes(value: string | null): OAuthScope[] {
  const requested = (value ?? "workspaces:read documents:read")
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
  const invalid = requested.find(
    (scope): scope is string => !OAUTH_SCOPES.includes(scope as OAuthScope),
  );

  if (invalid) {
    throw new HttpError(400, `Unsupported OAuth scope: ${invalid}`);
  }

  return [...new Set(requested)] as OAuthScope[];
}

function assertAllowedClientRedirect(clientId: string, redirectUri: string) {
  if (
    clientId === "downwrite-ios" &&
    redirectUri === "downwrite://oauth/callback"
  ) {
    return;
  }

  if (clientId === "downwrite-mcp" && isLoopbackCallback(redirectUri)) {
    return;
  }

  throw new HttpError(400, "OAuth client_id and redirect_uri are not allowed");
}

function isLoopbackCallback(redirectUri: string) {
  try {
    const url = new URL(redirectUri);
    return (
      url.protocol === "http:" &&
      (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
      url.pathname === "/callback" &&
      url.port !== ""
    );
  } catch {
    return false;
  }
}

function assertExpectedResource(resource: string, origin: string) {
  if (resource !== `${origin}/api/v1` && resource !== `${origin}/mcp`) {
    throw new HttpError(400, "OAuth resource must be this Downwrite instance");
  }
}

function assertScopeResourceCompatibility(
  scopes: string[],
  resource: string,
  origin: string,
) {
  const mcpScope = scopes.includes("mcp:documents");

  if (resource === `${origin}/mcp` && !mcpScope) {
    throw new HttpError(400, "MCP OAuth tokens require mcp:documents scope");
  }

  if (resource === `${origin}/api/v1` && mcpScope) {
    throw new HttpError(400, "mcp:documents scope must use the MCP resource");
  }
}

function requiredSearch(url: URL, key: string) {
  const value = url.searchParams.get(key);
  if (!value) {
    throw new HttpError(400, `Expected OAuth ${key}`);
  }
  return value;
}

function requiredForm(form: FormData, key: string) {
  const value = formString(form, key);
  if (!value) {
    throw new HttpError(400, `Expected OAuth ${key}`);
  }
  return value;
}

function formString(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function secondsFromNow(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function hidden(name: string, value: string) {
  return `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
