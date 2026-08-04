export type Role = "owner" | "editor";

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
  status: "pending" | "accepted" | "revoked";
  createdByIdentityId: string;
  createdAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export interface PublicLinkRecord {
  id: string;
  documentId: string;
  token: string;
  label: string | null;
  active: boolean;
  createdAt: string;
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

export interface AuthStatus {
  authenticated: boolean;
  bootstrapRequired: boolean;
  configuration: {
    bootstrapTokenConfigured: boolean;
    instancePublicUrl: string | null;
    webauthnRpId: string | null;
    webauthnRpName: string;
  };
  identity?: { id: string };
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const response = await fetch("/api/v1/auth/status", {
    credentials: "include",
  });
  await assertOk(response, "Auth status request failed");
  return response.json();
}

export async function beginBootstrap(input: {
  setupToken: string;
  identityId: string;
  displayName: string;
}) {
  const response = await fetch("/api/v1/auth/bootstrap/options", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Bootstrap request failed");
  return response.json() as Promise<{ challengeId: string; options: unknown }>;
}

export async function finishBootstrap(input: {
  setupToken: string;
  challengeId: string;
  response: unknown;
}) {
  const response = await fetch("/api/v1/auth/bootstrap/verify", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Bootstrap verification failed");
}

export async function beginPasskeyLogin(identityId: string) {
  const response = await fetch("/api/v1/auth/passkeys/login/options", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify({ identityId }),
  });
  await assertOk(response, "Passkey login request failed");
  return response.json() as Promise<{ challengeId: string; options: unknown }>;
}

export async function finishPasskeyLogin(input: {
  challengeId: string;
  response: unknown;
}) {
  const response = await fetch("/api/v1/auth/passkeys/login/verify", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Passkey login verification failed");
}

export async function signOut() {
  const response = await fetch("/api/v1/auth/session", {
    method: "DELETE",
    credentials: "include",
  });
  await assertOk(response, "Sign out failed");
}

export async function fetchGroups(token: string): Promise<GroupSummary[]> {
  const response = await fetch("/api/v1/groups", {
    headers: authHeaders(token),
    credentials: "include",
  });

  await assertOk(response, "API request failed");

  const body = (await response.json()) as { groups: GroupSummary[] };
  return body.groups;
}

export async function createGroup(
  token: string,
  input: Pick<GroupSummary, "name" | "description" | "accentColor">,
): Promise<GroupSummary> {
  const response = await fetch("/api/v1/groups", {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Create group failed");
  const body = (await response.json()) as { group: GroupSummary };
  return body.group;
}

export async function updateGroup(
  token: string,
  groupId: string,
  input: Partial<Pick<GroupSummary, "name" | "description" | "accentColor">>,
): Promise<GroupSummary> {
  const response = await fetch(`/api/v1/groups/${groupId}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Update group failed");
  const body = (await response.json()) as { group: GroupSummary };
  return body.group;
}

export async function deleteGroup(token: string, groupId: string) {
  const response = await fetch(`/api/v1/groups/${groupId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });
  await assertOk(response, "Delete group failed");
}

export async function fetchDocument(
  token: string,
  documentId: string,
): Promise<DocumentRecord> {
  const response = await fetch(`/api/v1/documents/${documentId}`, {
    headers: authHeaders(token),
    credentials: "include",
  });

  await assertOk(response, "Document request failed");

  const body = (await response.json()) as { document: DocumentRecord };
  return body.document;
}

export async function createDocument(
  token: string,
  groupId: string,
): Promise<DocumentRecord> {
  const response = await fetch(`/api/v1/groups/${groupId}/documents`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({
      title: "Untitled document",
      content: "# Untitled document\n\nStart writing in Markdown.",
    }),
  });

  await assertOk(response, "Create request failed");

  const body = (await response.json()) as { document: DocumentRecord };
  return body.document;
}

export async function updateDocument(
  token: string,
  documentId: string,
  update: Partial<Pick<DocumentRecord, "title" | "content">> & {
    baseRevision?: number;
  },
): Promise<DocumentRecord> {
  const response = await fetch(`/api/v1/documents/${documentId}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(update),
  });

  await assertOk(response, "Save request failed");

  const body = (await response.json()) as { document: DocumentRecord };
  return body.document;
}

export async function moveDocument(
  token: string,
  documentId: string,
  input: { groupId: string; position?: number; baseRevision?: number },
): Promise<DocumentRecord> {
  const response = await fetch(`/api/v1/documents/${documentId}/move`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });

  await assertOk(response, "Move request failed");

  const body = (await response.json()) as { document: DocumentRecord };
  return body.document;
}

export async function positionDocument(
  token: string,
  documentId: string,
  input: { position: number; baseRevision?: number },
): Promise<DocumentRecord> {
  const response = await fetch(`/api/v1/documents/${documentId}/position`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });

  await assertOk(response, "Reorder request failed");

  const body = (await response.json()) as { document: DocumentRecord };
  return body.document;
}

export async function deleteDocument(token: string, documentId: string) {
  const response = await fetch(`/api/v1/documents/${documentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });

  await assertOk(response, "Delete request failed");
}

export async function fetchShareState(
  token: string,
  documentId: string,
): Promise<ShareState> {
  const response = await fetch(`/api/v1/documents/${documentId}/share`, {
    headers: authHeaders(token),
    credentials: "include",
  });
  await assertOk(response, "Share request failed");
  const body = (await response.json()) as { share: ShareState };
  return body.share;
}

export async function createInvitation(
  token: string,
  documentId: string,
  input: { identityId: string; role: Role },
) {
  const response = await fetch(`/api/v1/documents/${documentId}/invitations`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Invitation request failed");
  const body = (await response.json()) as { invitation: InvitationRecord };
  return body.invitation;
}

export async function acceptInvitation(
  token: string,
  invitationToken: string,
): Promise<InvitationRecord> {
  const response = await fetch(
    `/api/v1/invitations/${invitationToken}/accept`,
    {
      method: "POST",
      headers: authHeaders(token),
      credentials: "include",
    },
  );
  await assertOk(response, "Accept invitation failed");
  const body = (await response.json()) as { invitation: InvitationRecord };
  return body.invitation;
}

export async function revokeInvitation(token: string, invitationId: string) {
  const response = await fetch(`/api/v1/invitations/${invitationId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });
  await assertOk(response, "Revoke invitation failed");
}

export async function removeCollaborator(
  token: string,
  documentId: string,
  identityId: string,
) {
  const response = await fetch(
    `/api/v1/documents/${documentId}/collaborators/${identityId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
      credentials: "include",
    },
  );
  await assertOk(response, "Remove collaborator failed");
}

export async function createPublicLink(
  token: string,
  documentId: string,
  label: string | null,
) {
  const response = await fetch(`/api/v1/documents/${documentId}/public-links`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ label }),
  });
  await assertOk(response, "Public link request failed");
  const body = (await response.json()) as { publicLink: PublicLinkRecord };
  return body.publicLink;
}

export async function updatePublicLink(
  token: string,
  publicLinkId: string,
  input: { label?: string | null; active?: boolean },
) {
  const response = await fetch(`/api/v1/public-links/${publicLinkId}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Update public link failed");
  const body = (await response.json()) as { publicLink: PublicLinkRecord };
  return body.publicLink;
}

export async function fetchPublicDocument(
  publicToken: string,
): Promise<PublicDocumentRecord> {
  const response = await fetch(`/api/v1/public-links/${publicToken}`);
  await assertOk(response, "Public document request failed");
  const body = (await response.json()) as { document: PublicDocumentRecord };
  return body.document;
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(token?: string): Record<string, string> {
  return {
    ...authHeaders(token),
    "content-type": "application/json",
  };
}

async function assertOk(response: Response, fallback: string) {
  if (response.ok) {
    return;
  }

  let message = `${fallback} with ${response.status}`;

  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) {
      message = body.error;
    }
  } catch {}

  throw new ApiError(response.status, message);
}
