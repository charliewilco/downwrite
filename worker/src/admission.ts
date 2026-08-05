import { HttpError } from "./http.js";
import type { Env } from "./types.js";

export type RegistrationMode = "closed" | "open" | "email_domain";

export interface AdmissionPolicy {
  mode: RegistrationMode;
  allowedEmailDomains: string[];
}

export function admissionPolicy(env: Env): AdmissionPolicy {
  const mode = parseRegistrationMode(env.DOWNWRITE_REGISTRATION_MODE);
  return {
    mode,
    allowedEmailDomains: parseAllowedEmailDomains(
      env.DOWNWRITE_ALLOWED_EMAIL_DOMAINS,
    ),
  };
}

export function admissionConfiguration(env: Env) {
  const policy = admissionPolicy(env);
  return {
    registrationMode: policy.mode,
    allowedEmailDomains: policy.allowedEmailDomains,
  };
}

export function assertRegistrationAllowed(env: Env, identityId: string) {
  const policy = admissionPolicy(env);

  if (policy.mode === "open") {
    return;
  }

  if (policy.mode === "closed") {
    throw new HttpError(403, "Registration is closed for this instance");
  }

  assertEmailDomainAllowed(identityId, policy.allowedEmailDomains);
}

export function assertIdentityAdmitted(env: Env, identityId: string) {
  const policy = admissionPolicy(env);

  if (policy.mode === "open" || policy.mode === "closed") {
    return;
  }

  assertEmailDomainAllowed(identityId, policy.allowedEmailDomains);
}

export function normalizedIdentityId(identityId: string) {
  return identityId.trim().toLowerCase();
}

function parseRegistrationMode(value: string | undefined): RegistrationMode {
  if (!value) {
    return "closed";
  }

  if (value === "closed" || value === "open" || value === "email_domain") {
    return value;
  }

  throw new HttpError(500, "DOWNWRITE_REGISTRATION_MODE is invalid");
}

function parseAllowedEmailDomains(value: string | undefined) {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function assertEmailDomainAllowed(
  identityId: string,
  allowedEmailDomains: string[],
) {
  if (allowedEmailDomains.length === 0) {
    throw new HttpError(
      503,
      "DOWNWRITE_ALLOWED_EMAIL_DOMAINS is required for domain registration",
    );
  }

  const normalized = normalizedIdentityId(identityId);
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    throw new HttpError(403, "Identity must be an allowed email address");
  }

  const domain = normalized.slice(atIndex + 1);
  if (!allowedEmailDomains.includes(domain)) {
    throw new HttpError(403, "Identity email domain is not allowed");
  }
}
