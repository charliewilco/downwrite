import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { HttpError } from "./http.js";
import { randomToken, sha256Base64Url, timingSafeEqual } from "./crypto.js";
import { sessionCookie } from "./identity.js";
import {
  assertIdentityAdmitted,
  assertRegistrationAllowed,
  normalizedIdentityId,
} from "./admission.js";
import type {
  BootstrapOptions,
  Env,
  LoginOptions,
  RegistrationOptions,
  SessionRecord,
  Storage,
} from "./types.js";

const SESSION_DAYS = 30;

export interface AuthService {
  beginOwnerBootstrap(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    setupToken: string;
    identityId: string;
    displayName: string;
  }): Promise<BootstrapOptions>;
  finishOwnerBootstrap(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    setupToken: string;
    challengeId: string;
    response: RegistrationResponseJSON;
  }): Promise<AuthSession>;
  beginRegistration(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    identityId: string;
    displayName: string;
  }): Promise<RegistrationOptions>;
  finishRegistration(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    challengeId: string;
    response: RegistrationResponseJSON;
  }): Promise<AuthSession>;
  beginLogin(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    identityId: string;
  }): Promise<LoginOptions>;
  finishLogin(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    challengeId: string;
    response: AuthenticationResponseJSON;
  }): Promise<AuthSession>;
  logout(input: {
    storage: Storage;
    sessionToken: string | null;
  }): Promise<void>;
}

export interface AuthSession {
  identityId: string;
  session: SessionRecord;
  cookie: string;
}

export class WebAuthnAuthService implements AuthService {
  async beginOwnerBootstrap(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    setupToken: string;
    identityId: string;
    displayName: string;
  }) {
    await assertBootstrapAllowed(input);
    const identityId = normalizedIdentityId(input.identityId);

    const options = await createRegistrationOptions({
      env: input.env,
      requestUrl: input.requestUrl,
      identityId,
      displayName: input.displayName,
      excludeCredentials: [],
    });
    const challenge = await input.storage.createWebAuthnChallenge({
      identityId,
      type: "bootstrap",
      challenge: options.challenge,
    });

    return { challengeId: challenge.id, options };
  }

  async finishOwnerBootstrap(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    setupToken: string;
    challengeId: string;
    response: RegistrationResponseJSON;
  }) {
    await assertBootstrapAllowed(input);

    const challenge = await input.storage.getWebAuthnChallenge({
      challengeId: input.challengeId,
      type: "bootstrap",
    });

    if (!challenge) {
      throw new HttpError(400, "Unknown bootstrap challenge");
    }

    await verifyAndCreateCredential({
      env: input.env,
      storage: input.storage,
      requestUrl: input.requestUrl,
      challenge,
      response: input.response,
      displayName: challenge.identityId,
    });

    return createSession(input.storage, challenge.identityId, input.requestUrl);
  }

  async beginRegistration(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    identityId: string;
    displayName: string;
  }) {
    const identityId = normalizedIdentityId(input.identityId);
    assertRegistrationAllowed(input.env, identityId);

    const existingCredentials =
      await input.storage.listCredentialsForIdentity(identityId);
    const options = await createRegistrationOptions({
      env: input.env,
      requestUrl: input.requestUrl,
      identityId,
      displayName: input.displayName,
      excludeCredentials: existingCredentials.map((credential) => ({
        id: credential.credentialId,
        type: "public-key",
        transports: credential.transports,
      })),
    });
    const challenge = await input.storage.createWebAuthnChallenge({
      identityId,
      type: "registration",
      challenge: options.challenge,
    });

    return { challengeId: challenge.id, options };
  }

  async finishRegistration(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    challengeId: string;
    response: RegistrationResponseJSON;
  }) {
    const challenge = await input.storage.getWebAuthnChallenge({
      challengeId: input.challengeId,
      type: "registration",
    });

    if (!challenge) {
      throw new HttpError(400, "Unknown registration challenge");
    }

    assertRegistrationAllowed(input.env, challenge.identityId);
    await verifyAndCreateCredential({
      env: input.env,
      storage: input.storage,
      requestUrl: input.requestUrl,
      challenge,
      response: input.response,
      displayName: challenge.identityId,
    });

    return createSession(input.storage, challenge.identityId, input.requestUrl);
  }

  async beginLogin(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    identityId: string;
  }) {
    const identityId = normalizedIdentityId(input.identityId);
    assertIdentityAdmitted(input.env, identityId);
    const identity = await input.storage.getIdentity(identityId);
    if (!identity) {
      throw new HttpError(404, "Identity not found");
    }

    const credentials =
      await input.storage.listCredentialsForIdentity(identityId);
    if (credentials.length === 0) {
      throw new HttpError(400, "Identity has no passkeys");
    }

    const options = await generateAuthenticationOptions({
      rpID: rpId(input.env, input.requestUrl),
      userVerification: "required",
      allowCredentials: credentials.map((credential) => ({
        id: credential.credentialId,
        type: "public-key",
        transports: credential.transports,
      })),
    });
    const challenge = await input.storage.createWebAuthnChallenge({
      identityId,
      type: "login",
      challenge: options.challenge,
    });

    return { challengeId: challenge.id, options };
  }

  async finishLogin(input: {
    env: Env;
    storage: Storage;
    requestUrl: string;
    challengeId: string;
    response: AuthenticationResponseJSON;
  }) {
    const challenge = await input.storage.getWebAuthnChallenge({
      challengeId: input.challengeId,
      type: "login",
    });

    if (!challenge) {
      throw new HttpError(400, "Unknown login challenge");
    }

    assertIdentityAdmitted(input.env, challenge.identityId);
    const credential = await input.storage.getCredentialByCredentialId(
      input.response.id,
    );

    if (!credential || credential.identityId !== challenge.identityId) {
      throw new HttpError(400, "Unknown passkey");
    }

    const verification = await verifyAuthenticationResponse({
      response: input.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin(input.env, input.requestUrl),
      expectedRPID: rpId(input.env, input.requestUrl),
      credential: {
        id: credential.credentialId,
        publicKey: arrayBufferUint8(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      throw new HttpError(400, "Passkey login failed");
    }

    await input.storage.updateCredentialCounter({
      credentialId: credential.credentialId,
      counter: verification.authenticationInfo.newCounter,
    });
    await input.storage.deleteWebAuthnChallenge(challenge.id);

    return createSession(input.storage, challenge.identityId, input.requestUrl);
  }

  async logout(input: { storage: Storage; sessionToken: string | null }) {
    if (!input.sessionToken) {
      return;
    }

    await input.storage.deleteSessionByTokenHash(
      await sha256Base64Url(input.sessionToken),
    );
  }
}

async function createRegistrationOptions(input: {
  env: Env;
  requestUrl: string;
  identityId: string;
  displayName: string;
  excludeCredentials: Array<{
    id: string;
    type: "public-key";
    transports?: AuthenticatorTransportFuture[];
  }>;
}) {
  return generateRegistrationOptions({
    rpName: rpName(input.env),
    rpID: rpId(input.env, input.requestUrl),
    userID: arrayBufferUint8(new TextEncoder().encode(input.identityId)),
    userName: input.identityId,
    userDisplayName: input.displayName,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
    excludeCredentials: input.excludeCredentials,
  });
}

async function verifyAndCreateCredential(input: {
  env: Env;
  storage: Storage;
  requestUrl: string;
  challenge: {
    id: string;
    identityId: string;
    challenge: string;
  };
  response: RegistrationResponseJSON;
  displayName: string;
}) {
  const verification = await verifyRegistrationResponse({
    response: input.response,
    expectedChallenge: input.challenge.challenge,
    expectedOrigin: origin(input.env, input.requestUrl),
    expectedRPID: rpId(input.env, input.requestUrl),
    requireUserVerification: true,
  });

  if (!verification.verified) {
    throw new HttpError(400, "Passkey registration failed");
  }

  const credential = verification.registrationInfo.credential;
  await input.storage.createIdentityWithCredential({
    identityId: input.challenge.identityId,
    displayName: input.displayName,
    credentialId: credential.id,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: credential.transports ?? [],
  });
  await input.storage.deleteWebAuthnChallenge(input.challenge.id);
}

async function assertBootstrapAllowed(input: {
  env: Env;
  storage: Storage;
  setupToken: string;
}) {
  if (await input.storage.hasAnyIdentity()) {
    throw new HttpError(409, "Owner bootstrap has already been completed");
  }

  const expected = input.env.AUTH_BOOTSTRAP_TOKEN;
  if (!expected) {
    throw new HttpError(503, "AUTH_BOOTSTRAP_TOKEN is not configured");
  }

  if (!(await timingSafeEqual(input.setupToken, expected))) {
    throw new HttpError(401, "Invalid bootstrap token");
  }
}

export async function createSession(
  storage: Storage,
  identityId: string,
  requestUrl: string,
) {
  const token = randomToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const session = await storage.createSession({
    identityId,
    tokenHash: await sha256Base64Url(token),
    expiresAt,
  });

  return {
    identityId,
    session,
    cookie: sessionCookie({ token, expiresAt, requestUrl }),
  };
}

function origin(env: Env, requestUrl: string) {
  return env.INSTANCE_PUBLIC_URL ?? new URL(requestUrl).origin;
}

function rpId(env: Env, requestUrl: string) {
  return env.WEBAUTHN_RP_ID ?? new URL(origin(env, requestUrl)).hostname;
}

function rpName(env: Env) {
  return env.WEBAUTHN_RP_NAME ?? "Downwrite";
}

function arrayBufferUint8(
  value: Uint8Array<ArrayBufferLike>,
): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(new ArrayBuffer(value.byteLength));
  copy.set(value);
  return copy;
}
