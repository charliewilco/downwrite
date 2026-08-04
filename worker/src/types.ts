import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

export type Role = "owner" | "editor";
export type InvitationStatus = "pending" | "accepted" | "revoked";
export type WebAuthnChallengeType = "bootstrap" | "registration" | "login";

export interface Env {
  DB: D1Database;
  CONTENT: R2Bucket;
  DEVELOPMENT_API_TOKENS?: string;
  DOWNWRITE_LOCAL_AUTH?: string;
  AUTH_BOOTSTRAP_TOKEN?: string;
  WEBAUTHN_RP_NAME?: string;
  WEBAUTHN_RP_ID?: string;
  INSTANCE_PUBLIC_URL?: string;
}

export interface Identity {
  id: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  accentColor: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  documents: DocumentSummary[];
}

export interface DocumentSummary {
  id: string;
  groupId: string;
  title: string;
  role: Role;
  position: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord extends DocumentSummary {
  content: string;
}

export interface PublicLinkRecord {
  id: string;
  documentId: string;
  token: string;
  label: string | null;
  active: boolean;
  createdAt: string;
}

export interface CollaboratorRecord {
  identityId: string;
  displayName: string | null;
  role: Role;
  createdAt: string;
}

export interface InvitationRecord {
  id: string;
  documentId: string;
  invitedIdentityId: string;
  role: Role;
  token: string;
  status: InvitationStatus;
  createdByIdentityId: string;
  createdAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export interface ShareState {
  documentId: string;
  collaborators: CollaboratorRecord[];
  invitations: InvitationRecord[];
  publicLinks: PublicLinkRecord[];
}

export interface PublicDocumentRecord {
  id: string;
  groupId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publicLink: {
    token: string;
    label: string | null;
  };
}

export interface AuthIdentity {
  id: string;
  displayName: string | null;
  createdAt: string;
}

export interface WebAuthnCredentialRecord {
  id: string;
  identityId: string;
  credentialId: string;
  publicKey: Uint8Array<ArrayBufferLike>;
  counter: number;
  transports: AuthenticatorTransportFuture[];
  createdAt: string;
}

export interface StoredWebAuthnChallenge {
  id: string;
  identityId: string;
  type: WebAuthnChallengeType;
  challenge: string;
  createdAt: string;
}

export interface BootstrapOptions {
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}

export interface LoginOptions {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}

export interface SessionRecord {
  id: string;
  identityId: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthStatus {
  authenticated: boolean;
  bootstrapRequired: boolean;
  configuration: {
    bootstrapTokenConfigured: boolean;
    instancePublicUrl: string | null;
    webauthnRpId: string | null;
    webauthnRpName: string;
  };
  identity?: Identity;
}

export interface VerifiedRegistration {
  response: RegistrationResponseJSON;
  challengeId: string;
  setupToken?: string;
}

export interface VerifiedAuthentication {
  response: AuthenticationResponseJSON;
  challengeId: string;
}

export interface Storage {
  hasAnyIdentity(): Promise<boolean>;
  getIdentity(identityId: string): Promise<AuthIdentity | null>;
  ensureIdentity(input: {
    identityId: string;
    displayName: string;
  }): Promise<AuthIdentity>;
  listCredentialsForIdentity(
    identityId: string,
  ): Promise<WebAuthnCredentialRecord[]>;
  getCredentialByCredentialId(
    credentialId: string,
  ): Promise<WebAuthnCredentialRecord | null>;
  createWebAuthnChallenge(input: {
    identityId: string;
    type: WebAuthnChallengeType;
    challenge: string;
  }): Promise<StoredWebAuthnChallenge>;
  getWebAuthnChallenge(input: {
    challengeId: string;
    type: WebAuthnChallengeType;
  }): Promise<StoredWebAuthnChallenge | null>;
  deleteWebAuthnChallenge(challengeId: string): Promise<void>;
  createIdentityWithCredential(input: {
    identityId: string;
    displayName: string;
    credentialId: string;
    publicKey: Uint8Array<ArrayBufferLike>;
    counter: number;
    transports: AuthenticatorTransportFuture[];
  }): Promise<AuthIdentity>;
  addCredential(input: {
    identityId: string;
    credentialId: string;
    publicKey: Uint8Array<ArrayBufferLike>;
    counter: number;
    transports: AuthenticatorTransportFuture[];
  }): Promise<WebAuthnCredentialRecord>;
  updateCredentialCounter(input: {
    credentialId: string;
    counter: number;
  }): Promise<void>;
  createSession(input: {
    identityId: string;
    tokenHash: string;
    expiresAt: string;
  }): Promise<SessionRecord>;
  getSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  deleteSessionByTokenHash(tokenHash: string): Promise<void>;
  consumeRateLimit(input: {
    key: string;
    limit: number;
    windowSeconds: number;
  }): Promise<boolean>;
  listGroupsForIdentity(identityId: string): Promise<GroupSummary[]>;
  createGroup(input: {
    identityId: string;
    name: string;
    description: string | null;
    accentColor: string | null;
  }): Promise<GroupSummary>;
  updateGroup(input: {
    identityId: string;
    groupId: string;
    name?: string;
    description?: string | null;
    accentColor?: string | null;
  }): Promise<GroupSummary | null>;
  deleteGroup(input: { identityId: string; groupId: string }): Promise<boolean>;
  createDocument(input: {
    identityId: string;
    groupId: string;
    title: string;
    content: string;
  }): Promise<DocumentRecord | null>;
  getDocumentForIdentity(input: {
    identityId: string;
    documentId: string;
  }): Promise<DocumentRecord | null>;
  updateDocument(input: {
    identityId: string;
    documentId: string;
    title?: string;
    content?: string;
  }): Promise<DocumentRecord | null>;
  moveDocument(input: {
    identityId: string;
    documentId: string;
    groupId: string;
    position?: number;
  }): Promise<DocumentRecord | null>;
  positionDocument(input: {
    identityId: string;
    documentId: string;
    position: number;
  }): Promise<DocumentRecord | null>;
  deleteDocument(input: {
    identityId: string;
    documentId: string;
  }): Promise<boolean>;
  addDocumentCollaborator(input: {
    identityId: string;
    documentId: string;
    collaboratorIdentityId: string;
    role: Role;
  }): Promise<void>;
  removeDocumentCollaborator(input: {
    identityId: string;
    documentId: string;
    collaboratorIdentityId: string;
  }): Promise<boolean>;
  createDocumentInvitation(input: {
    identityId: string;
    documentId: string;
    invitedIdentityId: string;
    role: Role;
    token: string;
  }): Promise<InvitationRecord | null>;
  acceptDocumentInvitation(input: {
    identityId: string;
    token: string;
  }): Promise<InvitationRecord | null>;
  revokeDocumentInvitation(input: {
    identityId: string;
    invitationId: string;
  }): Promise<boolean>;
  getDocumentShareState(input: {
    identityId: string;
    documentId: string;
  }): Promise<ShareState | null>;
  createPublicLink(input: {
    identityId: string;
    documentId: string;
    label: string | null;
    token: string;
  }): Promise<PublicLinkRecord | null>;
  updatePublicLink(input: {
    identityId: string;
    publicLinkId: string;
    label?: string | null;
    active?: boolean;
  }): Promise<PublicLinkRecord | null>;
  getDocumentByPublicToken(token: string): Promise<PublicDocumentRecord | null>;
}
