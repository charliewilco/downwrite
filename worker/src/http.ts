import type { Context } from "hono";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonError(c: Context, error: unknown) {
  if (error instanceof HttpError) {
    return c.json({ error: error.message }, error.status as never);
  }

  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
}

export async function readJsonObject(
  c: Context,
): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await c.req.json();
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {}

  throw new HttpError(400, "Expected a JSON object request body");
}

export function requireString(
  body: Record<string, unknown>,
  key: string,
  fallback?: string,
) {
  const value = body[key] ?? fallback;

  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `Expected ${key} to be a non-empty string`);
  }

  return value.trim();
}

export function optionalString(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value === "undefined" || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `Expected ${key} to be a string`);
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function optionalText(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `Expected ${key} to be a string`);
  }

  return value;
}

export function optionalBoolean(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new HttpError(400, `Expected ${key} to be a boolean`);
  }

  return value;
}

export function optionalNumber(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpError(400, `Expected ${key} to be a finite number`);
  }

  return value;
}
