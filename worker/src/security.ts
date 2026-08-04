import type { Context, Next } from "hono";
import { sha256Base64Url } from "./crypto.js";
import { HttpError } from "./http.js";
import { readSessionCookie } from "./identity.js";
import type { Env, Storage } from "./types.js";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function securityHeaders(c: Context, next: Next) {
  await next();

  c.header("x-content-type-options", "nosniff");
  c.header("referrer-policy", "no-referrer");

  if (c.req.path.startsWith("/api/")) {
    c.header("cache-control", "no-store");
  }
}

export function assertSameOriginForSessionWrites(
  c: Context<{ Bindings: Env }>,
) {
  if (!UNSAFE_METHODS.has(c.req.method.toUpperCase())) {
    return;
  }

  const sessionToken = readSessionCookie(c.req.header("cookie") ?? "");
  if (!sessionToken) {
    return;
  }

  const origin = c.req.header("origin");
  if (!origin || origin !== expectedOrigin(c.env, c.req.url)) {
    throw new HttpError(403, "Cross-origin session write blocked");
  }
}

export async function enforceRateLimit(input: {
  c: Context<{ Bindings: Env }>;
  storage: Storage;
  purpose: string;
  subject: string;
  limit: number;
  windowSeconds: number;
}) {
  const client = input.c.req.header("cf-connecting-ip") ?? "local";
  const hashedKey = await sha256Base64Url(
    `${input.purpose}:${input.subject}:${client}`,
  );
  const allowed = await input.storage.consumeRateLimit({
    key: `rate:${hashedKey}`,
    limit: input.limit,
    windowSeconds: input.windowSeconds,
  });

  if (!allowed) {
    throw new HttpError(429, "Too many requests");
  }
}

export function authConfiguration(env: Env) {
  return {
    bootstrapTokenConfigured: Boolean(env.AUTH_BOOTSTRAP_TOKEN),
    instancePublicUrl: env.INSTANCE_PUBLIC_URL ?? null,
    webauthnRpId: env.WEBAUTHN_RP_ID ?? null,
    webauthnRpName: env.WEBAUTHN_RP_NAME ?? "Downwrite",
  };
}

function expectedOrigin(env: Env, requestUrl: string) {
  return env.INSTANCE_PUBLIC_URL ?? new URL(requestUrl).origin;
}
