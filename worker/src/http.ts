import type { Context } from "hono";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    status: number,
    message: string,
    code = errorCodeForStatus(status),
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function jsonError(c: Context, error: unknown) {
  if (error instanceof HttpError) {
    return c.json(errorEnvelope(error), error.status as never);
  }

  console.error(error);
  return c.json(
    errorEnvelope(new HttpError(500, "Internal server error")),
    500,
  );
}

export function errorEnvelope(error: HttpError) {
  return {
    error: error.message,
    code: error.code,
    status: error.status,
  };
}

function errorCodeForStatus(status: number) {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 428:
      return "precondition_required";
    case 429:
      return "rate_limited";
    case 501:
      return "not_implemented";
    default:
      return "internal_error";
  }
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
