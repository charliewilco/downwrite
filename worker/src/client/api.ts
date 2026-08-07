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

export type CommentThreadStatus = "open" | "resolved";
export type CommentAnchorKind = "document" | "text";

export interface DocumentCommentAnchor {
  type: CommentAnchorKind;
  startLine: number | null;
  startColumn: number | null;
  endLine: number | null;
  endColumn: number | null;
  quote: string | null;
  baseRevision: number | null;
}

export interface DocumentCommentMessage {
  id: string;
  threadId: string;
  body: string;
  createdByIdentityId: string;
  createdAt: string;
}

export interface DocumentCommentThread {
  id: string;
  documentId: string;
  status: CommentThreadStatus;
  anchor: DocumentCommentAnchor;
  outdated: boolean;
  createdByIdentityId: string;
  createdAt: string;
  updatedAt: string;
  resolvedByIdentityId: string | null;
  resolvedAt: string | null;
  comments: DocumentCommentMessage[];
}

export interface DocumentVersionSummary {
  id: string;
  documentId: string;
  name: string;
  description: string | null;
  sourceRevision: number;
  title: string;
  createdByIdentityId: string;
  createdAt: string;
}

export interface DocumentVersionRecord extends DocumentVersionSummary {
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

export interface ListPage<T> {
  items: T[];
  nextCursor?: string;
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
    localDevelopmentAuthEnabled: boolean;
    registrationMode: "closed" | "open" | "email_domain";
    allowedEmailDomains: string[];
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

export async function beginPasskeyRegistration(input: {
  identityId: string;
  displayName: string;
}) {
  const response = await fetch("/api/v1/auth/passkeys/registration/options", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Passkey registration request failed");
  return response.json() as Promise<{ challengeId: string; options: unknown }>;
}

export async function finishPasskeyRegistration(input: {
  challengeId: string;
  response: unknown;
}) {
  const response = await fetch("/api/v1/auth/passkeys/registration/verify", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Passkey registration verification failed");
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

export async function startDevelopmentSession(input: {
  identityId: string;
  displayName: string;
}) {
  const response = await fetch("/api/v1/auth/development/session", {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Local development sign-in failed");
}

export async function fetchGroups(
  token?: string,
  page?: { limit?: number; cursor?: string },
): Promise<GroupSummary[]> {
  const response = await fetch(pathWithPage("/api/v1/groups", page), {
    headers: authHeaders(token),
    credentials: "include",
  });

  await assertOk(response, "API request failed");

  const body = (await response.json()) as { groups: GroupSummary[] };
  return body.groups;
}

export async function createGroup(
  token: string | undefined,
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
  token: string | undefined,
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

export async function deleteGroup(token: string | undefined, groupId: string) {
  const response = await fetch(`/api/v1/groups/${groupId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });
  await assertOk(response, "Delete group failed");
}

export async function fetchDocument(
  token: string | undefined,
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

export async function fetchGroupDocuments(
  token: string | undefined,
  groupId: string,
  page?: { limit?: number; cursor?: string },
): Promise<ListPage<DocumentSummary>> {
  const response = await fetch(
    pathWithPage(`/api/v1/groups/${groupId}/documents`, page),
    {
      headers: authHeaders(token),
      credentials: "include",
    },
  );

  await assertOk(response, "Document list request failed");

  const body = (await response.json()) as {
    documents: DocumentSummary[];
    nextCursor?: string;
  };
  return { items: body.documents, nextCursor: body.nextCursor };
}

function pathWithPage(
  path: string,
  page?: { limit?: number; cursor?: string },
) {
  if (!page?.limit && !page?.cursor) {
    return path;
  }

  const params = new URLSearchParams();
  if (typeof page.limit !== "undefined") {
    params.set("limit", String(page.limit));
  }
  if (page.cursor) {
    params.set("cursor", page.cursor);
  }

  return `${path}?${params}`;
}

export async function createDocument(
  token: string | undefined,
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
  token: string | undefined,
  documentId: string,
  update: Partial<Pick<DocumentRecord, "title" | "content">> & {
    baseRevision: number;
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
  token: string | undefined,
  documentId: string,
  input: { groupId: string; position?: number; baseRevision: number },
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
  token: string | undefined,
  documentId: string,
  input: { position: number; baseRevision: number },
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

export async function deleteDocument(
  token: string | undefined,
  documentId: string,
) {
  const response = await fetch(`/api/v1/documents/${documentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });

  await assertOk(response, "Delete request failed");
}

export async function fetchCommentThreads(
  token: string | undefined,
  documentId: string,
  filters?: {
    status?: CommentThreadStatus | "all";
    anchor?: CommentAnchorKind | "all";
  },
): Promise<DocumentCommentThread[]> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set("status", filters.status);
  }
  if (filters?.anchor) {
    params.set("anchor", filters.anchor);
  }
  const suffix = params.toString() ? `?${params}` : "";
  const response = await fetch(
    `/api/v1/documents/${documentId}/comment-threads${suffix}`,
    {
      headers: authHeaders(token),
      credentials: "include",
    },
  );
  await assertOk(response, "Comment threads request failed");
  const body = (await response.json()) as {
    commentThreads: DocumentCommentThread[];
  };
  return body.commentThreads;
}

export async function createCommentThread(
  token: string | undefined,
  documentId: string,
  input: { anchor: DocumentCommentAnchor; body: string },
): Promise<DocumentCommentThread> {
  const response = await fetch(
    `/api/v1/documents/${documentId}/comment-threads`,
    {
      method: "POST",
      headers: jsonHeaders(token),
      credentials: "include",
      body: JSON.stringify(input),
    },
  );
  await assertOk(response, "Create comment thread failed");
  const body = (await response.json()) as {
    commentThread: DocumentCommentThread;
  };
  return body.commentThread;
}

export async function addCommentMessage(
  token: string | undefined,
  threadId: string,
  bodyText: string,
): Promise<DocumentCommentThread> {
  const response = await fetch(`/api/v1/comment-threads/${threadId}/comments`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ body: bodyText }),
  });
  await assertOk(response, "Add comment failed");
  const body = (await response.json()) as {
    commentThread: DocumentCommentThread;
  };
  return body.commentThread;
}

export async function updateCommentThreadStatus(
  token: string | undefined,
  threadId: string,
  status: CommentThreadStatus,
): Promise<DocumentCommentThread> {
  const response = await fetch(`/api/v1/comment-threads/${threadId}`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  await assertOk(response, "Update comment thread failed");
  const body = (await response.json()) as {
    commentThread: DocumentCommentThread;
  };
  return body.commentThread;
}

export async function fetchDocumentVersions(
  token: string | undefined,
  documentId: string,
): Promise<DocumentVersionSummary[]> {
  const response = await fetch(`/api/v1/documents/${documentId}/versions`, {
    headers: authHeaders(token),
    credentials: "include",
  });
  await assertOk(response, "Document versions request failed");
  const body = (await response.json()) as {
    versions: DocumentVersionSummary[];
  };
  return body.versions;
}

export async function createDocumentVersion(
  token: string | undefined,
  documentId: string,
  input: { name: string; description?: string | null; baseRevision: number },
): Promise<DocumentVersionRecord> {
  const response = await fetch(`/api/v1/documents/${documentId}/versions`, {
    method: "POST",
    headers: jsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(input),
  });
  await assertOk(response, "Create checkpoint failed");
  const body = (await response.json()) as { version: DocumentVersionRecord };
  return body.version;
}

export async function fetchDocumentVersion(
  token: string | undefined,
  documentId: string,
  versionId: string,
): Promise<DocumentVersionRecord> {
  const response = await fetch(
    `/api/v1/documents/${documentId}/versions/${versionId}`,
    {
      headers: authHeaders(token),
      credentials: "include",
    },
  );
  await assertOk(response, "Document version request failed");
  const body = (await response.json()) as { version: DocumentVersionRecord };
  return body.version;
}

export async function restoreDocumentVersion(
  token: string | undefined,
  documentId: string,
  versionId: string,
  baseRevision: number,
): Promise<DocumentRecord> {
  const response = await fetch(
    `/api/v1/documents/${documentId}/versions/${versionId}/restore`,
    {
      method: "POST",
      headers: jsonHeaders(token),
      credentials: "include",
      body: JSON.stringify({ baseRevision }),
    },
  );
  await assertOk(response, "Restore checkpoint failed");
  const body = (await response.json()) as { document: DocumentRecord };
  return body.document;
}

export async function deleteDocumentVersion(
  token: string | undefined,
  documentId: string,
  versionId: string,
) {
  const response = await fetch(
    `/api/v1/documents/${documentId}/versions/${versionId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
      credentials: "include",
    },
  );
  await assertOk(response, "Delete checkpoint failed");
}

export async function fetchShareState(
  token: string | undefined,
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
  token: string | undefined,
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
  token: string | undefined,
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

export async function revokeInvitation(
  token: string | undefined,
  invitationId: string,
) {
  const response = await fetch(`/api/v1/invitations/${invitationId}`, {
    method: "DELETE",
    headers: authHeaders(token),
    credentials: "include",
  });
  await assertOk(response, "Revoke invitation failed");
}

export async function removeCollaborator(
  token: string | undefined,
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
  token: string | undefined,
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
  token: string | undefined,
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
