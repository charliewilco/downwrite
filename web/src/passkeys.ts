export async function createPasskey(options: unknown) {
  if (!isCredentialCreationOptions(options)) {
    throw new Error("Passkey registration options were malformed");
  }

  const credential = await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: bytesFromBase64Url(options.challenge),
      user: {
        ...options.user,
        id: bytesFromBase64Url(options.user.id),
      },
      excludeCredentials: options.excludeCredentials?.map((item) => ({
        ...item,
        id: bytesFromBase64Url(item.id),
      })),
    },
  });

  if (!credential) {
    throw new Error("Passkey registration was cancelled");
  }

  const publicKeyCredential = credential as PublicKeyCredential;
  return typeof publicKeyCredential.toJSON === "function"
    ? publicKeyCredential.toJSON()
    : credentialToJson(publicKeyCredential);
}

export async function getPasskey(options: unknown) {
  if (!isCredentialRequestOptions(options)) {
    throw new Error("Passkey login options were malformed");
  }

  const credential = await navigator.credentials.get({
    publicKey: {
      ...options,
      challenge: bytesFromBase64Url(options.challenge),
      allowCredentials: options.allowCredentials?.map((item) => ({
        ...item,
        id: bytesFromBase64Url(item.id),
      })),
    },
  });

  if (!credential) {
    throw new Error("Passkey login was cancelled");
  }

  const publicKeyCredential = credential as PublicKeyCredential;
  return typeof publicKeyCredential.toJSON === "function"
    ? publicKeyCredential.toJSON()
    : credentialToJson(publicKeyCredential);
}

function isCredentialCreationOptions(
  value: unknown,
): value is PublicKeyCredentialCreationOptionsJSON {
  return (
    value !== null &&
    typeof value === "object" &&
    "challenge" in value &&
    "user" in value
  );
}

function isCredentialRequestOptions(
  value: unknown,
): value is PublicKeyCredentialRequestOptionsJSON {
  return value !== null && typeof value === "object" && "challenge" in value;
}

function credentialToJson(credential: PublicKeyCredential) {
  const response = credential.response;

  if (response instanceof AuthenticatorAttestationResponse) {
    return {
      id: credential.id,
      rawId: base64UrlFromBytes(new Uint8Array(credential.rawId)),
      response: {
        clientDataJSON: base64UrlFromBytes(
          new Uint8Array(response.clientDataJSON),
        ),
        attestationObject: base64UrlFromBytes(
          new Uint8Array(response.attestationObject),
        ),
        transports: response.getTransports(),
      },
      type: credential.type,
      clientExtensionResults: credential.getClientExtensionResults(),
      authenticatorAttachment: credential.authenticatorAttachment,
    };
  }

  const assertion = response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: base64UrlFromBytes(new Uint8Array(credential.rawId)),
    response: {
      clientDataJSON: base64UrlFromBytes(
        new Uint8Array(assertion.clientDataJSON),
      ),
      authenticatorData: base64UrlFromBytes(
        new Uint8Array(assertion.authenticatorData),
      ),
      signature: base64UrlFromBytes(new Uint8Array(assertion.signature)),
      userHandle: assertion.userHandle
        ? base64UrlFromBytes(new Uint8Array(assertion.userHandle))
        : undefined,
    },
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment,
  };
}

function bytesFromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64UrlFromBytes(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  user: { id: string; name: string; displayName: string };
  rp: PublicKeyCredentialRpEntity;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  excludeCredentials?: Array<JsonCredentialDescriptor>;
}

interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  timeout?: number;
  rpId?: string;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: Array<JsonCredentialDescriptor>;
}

interface JsonCredentialDescriptor extends Omit<
  PublicKeyCredentialDescriptor,
  "id"
> {
  id: string;
}
