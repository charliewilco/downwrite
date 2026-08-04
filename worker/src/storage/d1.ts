import { bytesFromBase64Url } from "../crypto.js";
import type {
  AuthIdentity,
  CollaboratorRecord,
  DocumentRecord,
  DocumentSummary,
  GroupSummary,
  InvitationRecord,
  InvitationStatus,
  InvitationPreview,
  OAuthAccessTokenRecord,
  OAuthAuthorizationCodeRecord,
  OAuthAuthorizationRequestRecord,
  OAuthRefreshTokenRecord,
  PublicDocumentRecord,
  PublicLinkRecord,
  Role,
  SessionRecord,
  ShareState,
  Storage,
  StoredWebAuthnChallenge,
  WebAuthnChallengeType,
  WebAuthnCredentialRecord,
} from "../types.js";

interface IdentityRow {
  id: string;
  display_name: string | null;
  created_at: string;
}

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  accent_color: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

interface DocumentRow {
  id: string;
  group_id: string;
  title: string;
  content_key: string;
  role: Role;
  position: number;
  revision: number;
  created_at: string;
  updated_at: string;
}

interface PublicLinkRow {
  id: string;
  document_id: string;
  token: string;
  label: string | null;
  active: number;
  created_at: string;
}

interface CollaboratorRow {
  identity_id: string;
  display_name: string | null;
  role: Role;
  created_at: string;
}

interface InvitationRow {
  id: string;
  document_id: string;
  invited_identity_id: string;
  role: Role;
  token: string;
  status: InvitationStatus;
  created_by_identity_id: string;
  created_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
}

interface InvitationPreviewRow {
  token: string;
  status: InvitationStatus;
  invited_identity_id: string;
  role: Role;
  document_id: string;
  group_id: string;
  title: string;
  created_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
}

interface PublicDocumentRow {
  id: string;
  group_id: string;
  title: string;
  content_key: string;
  created_at: string;
  updated_at: string;
  token: string;
  label: string | null;
}

interface CredentialRow {
  id: string;
  identity_id: string;
  credential_id: string;
  public_key: ArrayBuffer;
  counter: number;
  transports: string;
  created_at: string;
}

interface ChallengeRow {
  id: string;
  identity_id: string;
  type: WebAuthnChallengeType;
  challenge: string;
  created_at: string;
}

interface SessionRow {
  id: string;
  identity_id: string;
  created_at: string;
  expires_at: string;
}

interface RateLimitRow {
  count: number;
  reset_at: string;
}

interface OAuthAuthorizationCodeRow {
  id: string;
  code_hash: string;
  identity_id: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: "S256";
  scopes: string;
  resource: string;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
}

interface OAuthAuthorizationRequestRow {
  id: string;
  request_hash: string;
  identity_id: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: "S256";
  scopes: string;
  resource: string;
  state: string | null;
  created_at: string;
  expires_at: string;
  consumed_at: string | null;
}

interface OAuthTokenRow {
  token_hash: string;
  identity_id: string;
  client_id: string;
  scopes: string;
  resource: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
}

async function readMarkdown(bucket: R2Bucket, key: string) {
  const object = await bucket.get(key);
  return object ? object.text() : "";
}

async function documentFromRow(
  bucket: R2Bucket,
  row: DocumentRow,
): Promise<DocumentRecord> {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    content: await readMarkdown(bucket, row.content_key),
    role: row.role,
    position: row.position,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function documentSummaryFromRow(row: DocumentRow): DocumentSummary {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    role: row.role,
    position: row.position,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function groupFromRow(
  row: GroupRow,
  documents: DocumentSummary[],
): GroupSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    accentColor: row.accent_color,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documents,
  };
}

export class D1Storage implements Storage {
  readonly #db: D1Database;
  readonly #bucket: R2Bucket;

  constructor(db: D1Database, bucket: R2Bucket) {
    this.#db = db;
    this.#bucket = bucket;
  }

  async hasAnyIdentity() {
    const row = await this.#db
      .prepare(`SELECT id FROM webauthn_credentials LIMIT 1`)
      .first<{ id: string }>();
    return Boolean(row);
  }

  async getIdentity(identityId: string): Promise<AuthIdentity | null> {
    const row = await this.#db
      .prepare(
        `SELECT id, display_name, created_at FROM identities WHERE id = ?`,
      )
      .bind(identityId)
      .first<IdentityRow>();
    return row ? identityFromRow(row) : null;
  }

  async ensureIdentity(input: {
    identityId: string;
    displayName: string;
  }): Promise<AuthIdentity> {
    await this.#db
      .prepare(
        `INSERT INTO identities (id, display_name)
        VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`,
      )
      .bind(input.identityId, input.displayName)
      .run();

    const identity = await this.getIdentity(input.identityId);
    if (!identity) {
      throw new Error("Failed to ensure identity");
    }
    return identity;
  }

  async listCredentialsForIdentity(identityId: string) {
    const rows = await this.#db
      .prepare(
        `SELECT id, identity_id, credential_id, public_key, counter, transports, created_at
        FROM webauthn_credentials
        WHERE identity_id = ?`,
      )
      .bind(identityId)
      .all<CredentialRow>();
    return (rows.results ?? []).map(credentialFromRow);
  }

  async getCredentialByCredentialId(credentialId: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, identity_id, credential_id, public_key, counter, transports, created_at
        FROM webauthn_credentials
        WHERE credential_id = ?`,
      )
      .bind(credentialId)
      .first<CredentialRow>();
    return row ? credentialFromRow(row) : null;
  }

  async createWebAuthnChallenge(input: {
    identityId: string;
    type: WebAuthnChallengeType;
    challenge: string;
  }): Promise<StoredWebAuthnChallenge> {
    const id = crypto.randomUUID();
    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT OR IGNORE INTO identities (id, display_name) VALUES (?, ?)`,
        )
        .bind(input.identityId, input.identityId),
      this.#db
        .prepare(
          `INSERT INTO webauthn_challenges (id, identity_id, type, challenge)
          VALUES (?, ?, ?, ?)`,
        )
        .bind(id, input.identityId, input.type, input.challenge),
    ]);
    const row = await this.#db
      .prepare(
        `SELECT id, identity_id, type, challenge, created_at
        FROM webauthn_challenges
        WHERE id = ?`,
      )
      .bind(id)
      .first<ChallengeRow>();
    if (!row) {
      throw new Error("Failed to create WebAuthn challenge");
    }
    return challengeFromRow(row);
  }

  async getWebAuthnChallenge(input: {
    challengeId: string;
    type: WebAuthnChallengeType;
  }) {
    const row = await this.#db
      .prepare(
        `SELECT id, identity_id, type, challenge, created_at
        FROM webauthn_challenges
        WHERE id = ? AND type = ?`,
      )
      .bind(input.challengeId, input.type)
      .first<ChallengeRow>();
    return row ? challengeFromRow(row) : null;
  }

  async deleteWebAuthnChallenge(challengeId: string) {
    await this.#db
      .prepare(`DELETE FROM webauthn_challenges WHERE id = ?`)
      .bind(challengeId)
      .run();
  }

  async createIdentityWithCredential(input: {
    identityId: string;
    displayName: string;
    credentialId: string;
    publicKey: Uint8Array;
    counter: number;
    transports: string[];
  }) {
    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT OR REPLACE INTO identities (id, display_name)
          VALUES (?, ?)`,
        )
        .bind(input.identityId, input.displayName),
      this.#db
        .prepare(
          `INSERT INTO webauthn_credentials
            (id, identity_id, credential_id, public_key, counter, transports)
          VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          input.identityId,
          input.credentialId,
          input.publicKey,
          input.counter,
          JSON.stringify(input.transports),
        ),
    ]);
    const identity = await this.getIdentity(input.identityId);
    if (!identity) {
      throw new Error("Failed to create identity");
    }
    return identity;
  }

  async addCredential(input: {
    identityId: string;
    credentialId: string;
    publicKey: Uint8Array;
    counter: number;
    transports: string[];
  }) {
    const id = crypto.randomUUID();
    await this.#db
      .prepare(
        `INSERT INTO webauthn_credentials
          (id, identity_id, credential_id, public_key, counter, transports)
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.identityId,
        input.credentialId,
        input.publicKey,
        input.counter,
        JSON.stringify(input.transports),
      )
      .run();
    const credential = await this.getCredentialByCredentialId(
      input.credentialId,
    );
    if (!credential) {
      throw new Error("Failed to add credential");
    }
    return credential;
  }

  async updateCredentialCounter(input: {
    credentialId: string;
    counter: number;
  }) {
    await this.#db
      .prepare(
        `UPDATE webauthn_credentials
        SET counter = ?
        WHERE credential_id = ?`,
      )
      .bind(input.counter, input.credentialId)
      .run();
  }

  async createSession(input: {
    identityId: string;
    tokenHash: string;
    expiresAt: string;
  }): Promise<SessionRecord> {
    const id = crypto.randomUUID();
    await this.#db
      .prepare(
        `INSERT INTO sessions (id, identity_id, token_hash, expires_at)
        VALUES (?, ?, ?, ?)`,
      )
      .bind(id, input.identityId, input.tokenHash, input.expiresAt)
      .run();
    const session = await this.#db
      .prepare(
        `SELECT id, identity_id, created_at, expires_at
        FROM sessions
        WHERE id = ?`,
      )
      .bind(id)
      .first<SessionRow>();
    if (!session) {
      throw new Error("Failed to create session");
    }
    return sessionFromRow(session);
  }

  async getSessionByTokenHash(tokenHash: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, identity_id, created_at, expires_at
        FROM sessions
        WHERE token_hash = ?`,
      )
      .bind(tokenHash)
      .first<SessionRow>();
    return row ? sessionFromRow(row) : null;
  }

  async deleteSessionByTokenHash(tokenHash: string) {
    await this.#db
      .prepare(`DELETE FROM sessions WHERE token_hash = ?`)
      .bind(tokenHash)
      .run();
  }

  async createOAuthAuthorizationCode(input: {
    codeHash: string;
    identityId: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    scopes: string[];
    resource: string;
    expiresAt: string;
  }): Promise<OAuthAuthorizationCodeRecord> {
    const id = crypto.randomUUID();
    await this.#db
      .prepare(
        `INSERT INTO oauth_authorization_codes
          (id, code_hash, identity_id, client_id, redirect_uri,
            code_challenge, code_challenge_method, scopes, resource, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 'S256', ?, ?, ?)`,
      )
      .bind(
        id,
        input.codeHash,
        input.identityId,
        input.clientId,
        input.redirectUri,
        input.codeChallenge,
        JSON.stringify(input.scopes),
        input.resource,
        input.expiresAt,
      )
      .run();

    const code = await this.getOAuthAuthorizationCodeByHash(input.codeHash);
    if (!code) {
      throw new Error("Failed to create OAuth authorization code");
    }
    return code;
  }

  async getOAuthAuthorizationCodeByHash(codeHash: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, code_hash, identity_id, client_id, redirect_uri,
          code_challenge, code_challenge_method, scopes, resource,
          created_at, expires_at, consumed_at
        FROM oauth_authorization_codes
        WHERE code_hash = ?`,
      )
      .bind(codeHash)
      .first<OAuthAuthorizationCodeRow>();
    return row ? oauthAuthorizationCodeFromRow(row) : null;
  }

  async consumeOAuthAuthorizationCode(codeHash: string) {
    await this.#db
      .prepare(
        `UPDATE oauth_authorization_codes
        SET consumed_at = CURRENT_TIMESTAMP
        WHERE code_hash = ?`,
      )
      .bind(codeHash)
      .run();
  }

  async createOAuthAuthorizationRequest(input: {
    requestHash: string;
    identityId: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    scopes: string[];
    resource: string;
    state: string | null;
    expiresAt: string;
  }): Promise<OAuthAuthorizationRequestRecord> {
    const id = crypto.randomUUID();
    await this.#db
      .prepare(
        `INSERT INTO oauth_authorization_requests
          (id, request_hash, identity_id, client_id, redirect_uri,
            code_challenge, code_challenge_method, scopes, resource, state,
            expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 'S256', ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.requestHash,
        input.identityId,
        input.clientId,
        input.redirectUri,
        input.codeChallenge,
        JSON.stringify(input.scopes),
        input.resource,
        input.state,
        input.expiresAt,
      )
      .run();

    const request = await this.getOAuthAuthorizationRequestByHash(
      input.requestHash,
    );
    if (!request) {
      throw new Error("Failed to create OAuth authorization request");
    }
    return request;
  }

  async getOAuthAuthorizationRequestByHash(requestHash: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, request_hash, identity_id, client_id, redirect_uri,
          code_challenge, code_challenge_method, scopes, resource, state,
          created_at, expires_at, consumed_at
        FROM oauth_authorization_requests
        WHERE request_hash = ?`,
      )
      .bind(requestHash)
      .first<OAuthAuthorizationRequestRow>();
    return row ? oauthAuthorizationRequestFromRow(row) : null;
  }

  async consumeOAuthAuthorizationRequest(requestHash: string) {
    await this.#db
      .prepare(
        `UPDATE oauth_authorization_requests
        SET consumed_at = CURRENT_TIMESTAMP
        WHERE request_hash = ?`,
      )
      .bind(requestHash)
      .run();
  }

  async createOAuthAccessToken(input: {
    tokenHash: string;
    identityId: string;
    clientId: string;
    scopes: string[];
    resource: string;
    expiresAt: string;
  }): Promise<OAuthAccessTokenRecord> {
    await this.#db
      .prepare(
        `INSERT INTO oauth_access_tokens
          (token_hash, identity_id, client_id, scopes, resource, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.tokenHash,
        input.identityId,
        input.clientId,
        JSON.stringify(input.scopes),
        input.resource,
        input.expiresAt,
      )
      .run();

    const token = await this.getOAuthAccessTokenByHash(input.tokenHash);
    if (!token) {
      throw new Error("Failed to create OAuth access token");
    }
    return token;
  }

  async getOAuthAccessTokenByHash(tokenHash: string) {
    const row = await this.#db
      .prepare(
        `SELECT token_hash, identity_id, client_id, scopes, resource,
          created_at, expires_at, revoked_at
        FROM oauth_access_tokens
        WHERE token_hash = ?`,
      )
      .bind(tokenHash)
      .first<OAuthTokenRow>();
    return row ? oauthAccessTokenFromRow(row) : null;
  }

  async createOAuthRefreshToken(input: {
    tokenHash: string;
    identityId: string;
    clientId: string;
    scopes: string[];
    resource: string;
    expiresAt: string;
  }): Promise<OAuthRefreshTokenRecord> {
    await this.#db
      .prepare(
        `INSERT INTO oauth_refresh_tokens
          (token_hash, identity_id, client_id, scopes, resource, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.tokenHash,
        input.identityId,
        input.clientId,
        JSON.stringify(input.scopes),
        input.resource,
        input.expiresAt,
      )
      .run();

    const token = await this.getOAuthRefreshTokenByHash(input.tokenHash);
    if (!token) {
      throw new Error("Failed to create OAuth refresh token");
    }
    return token;
  }

  async getOAuthRefreshTokenByHash(tokenHash: string) {
    const row = await this.#db
      .prepare(
        `SELECT token_hash, identity_id, client_id, scopes, resource,
          created_at, expires_at, revoked_at
        FROM oauth_refresh_tokens
        WHERE token_hash = ?`,
      )
      .bind(tokenHash)
      .first<OAuthTokenRow>();
    return row ? oauthRefreshTokenFromRow(row) : null;
  }

  async revokeOAuthTokenByHash(tokenHash: string) {
    const access = await this.#db
      .prepare(
        `UPDATE oauth_access_tokens
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE token_hash = ? AND revoked_at IS NULL`,
      )
      .bind(tokenHash)
      .run();
    const refresh = await this.#db
      .prepare(
        `UPDATE oauth_refresh_tokens
        SET revoked_at = CURRENT_TIMESTAMP
        WHERE token_hash = ? AND revoked_at IS NULL`,
      )
      .bind(tokenHash)
      .run();

    return Boolean(access.meta.changes || refresh.meta.changes);
  }

  async consumeRateLimit(input: {
    key: string;
    limit: number;
    windowSeconds: number;
  }) {
    const current = await this.#db
      .prepare(`SELECT count, reset_at FROM rate_limits WHERE key = ?`)
      .bind(input.key)
      .first<RateLimitRow>();
    const nowMs = Date.now();
    const resetMs = current ? new Date(current.reset_at).getTime() : 0;
    const nextResetAt = new Date(
      nowMs + input.windowSeconds * 1000,
    ).toISOString();

    if (!current || resetMs <= nowMs) {
      await this.#db
        .prepare(
          `INSERT OR REPLACE INTO rate_limits (key, count, reset_at, updated_at)
          VALUES (?, 1, ?, CURRENT_TIMESTAMP)`,
        )
        .bind(input.key, nextResetAt)
        .run();
      return true;
    }

    if (current.count >= input.limit) {
      return false;
    }

    await this.#db
      .prepare(
        `UPDATE rate_limits
        SET count = count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE key = ?`,
      )
      .bind(input.key)
      .run();

    return true;
  }

  async cleanupExpiredRecords(now: string) {
    const [
      sessions,
      webauthnChallenges,
      oauthAuthorizationCodes,
      oauthAuthorizationRequests,
      oauthAccessTokens,
      oauthRefreshTokens,
      rateLimits,
    ] = await this.#db.batch([
      this.#db.prepare(`DELETE FROM sessions WHERE expires_at <= ?`).bind(now),
      this.#db
        .prepare(
          `DELETE FROM webauthn_challenges
          WHERE datetime(created_at, '+15 minutes') <= datetime(?)`,
        )
        .bind(now),
      this.#db
        .prepare(
          `DELETE FROM oauth_authorization_codes
          WHERE expires_at <= ? OR consumed_at IS NOT NULL`,
        )
        .bind(now),
      this.#db
        .prepare(
          `DELETE FROM oauth_authorization_requests
          WHERE expires_at <= ? OR consumed_at IS NOT NULL`,
        )
        .bind(now),
      this.#db
        .prepare(
          `DELETE FROM oauth_access_tokens
          WHERE expires_at <= ? OR revoked_at IS NOT NULL`,
        )
        .bind(now),
      this.#db
        .prepare(
          `DELETE FROM oauth_refresh_tokens
          WHERE expires_at <= ? OR revoked_at IS NOT NULL`,
        )
        .bind(now),
      this.#db.prepare(`DELETE FROM rate_limits WHERE reset_at <= ?`).bind(now),
    ]);

    return {
      sessions: sessions.meta.changes ?? 0,
      webauthnChallenges: webauthnChallenges.meta.changes ?? 0,
      oauthAuthorizationCodes: oauthAuthorizationCodes.meta.changes ?? 0,
      oauthAuthorizationRequests: oauthAuthorizationRequests.meta.changes ?? 0,
      oauthAccessTokens: oauthAccessTokens.meta.changes ?? 0,
      oauthRefreshTokens: oauthRefreshTokens.meta.changes ?? 0,
      rateLimits: rateLimits.meta.changes ?? 0,
    };
  }

  async listGroupsForIdentity(identityId: string): Promise<GroupSummary[]> {
    const groups = await this.#db
      .prepare(
        `SELECT DISTINCT g.id, g.name, g.description, g.accent_color,
          COALESCE(gm.role, 'editor') AS role,
          g.created_at,
          g.updated_at
        FROM groups g
        LEFT JOIN group_members gm
          ON gm.group_id = g.id AND gm.identity_id = ?
        LEFT JOIN documents d ON d.group_id = g.id
        LEFT JOIN document_collaborators dc
          ON dc.document_id = d.id AND dc.identity_id = ?
        WHERE gm.identity_id IS NOT NULL OR dc.identity_id IS NOT NULL
        ORDER BY g.updated_at DESC`,
      )
      .bind(identityId, identityId)
      .all<GroupRow>();

    const result: GroupSummary[] = [];
    for (const group of groups.results ?? []) {
      const documents = await this.#db
        .prepare(
          `SELECT d.id, d.group_id, d.title, d.content_key,
            d.position, d.revision, d.created_at, d.updated_at,
            COALESCE(dc.role, gm.role) AS role
          FROM documents d
          LEFT JOIN group_members gm
            ON gm.group_id = d.group_id AND gm.identity_id = ?
          LEFT JOIN document_collaborators dc
            ON dc.document_id = d.id AND dc.identity_id = ?
          WHERE d.group_id = ?
            AND (gm.identity_id IS NOT NULL OR dc.identity_id IS NOT NULL)
          ORDER BY d.position ASC, d.updated_at DESC`,
        )
        .bind(identityId, identityId, group.id)
        .all<DocumentRow>();

      result.push(
        groupFromRow(
          group,
          (documents.results ?? []).map(documentSummaryFromRow),
        ),
      );
    }

    return result;
  }

  async createGroup(input: {
    identityId: string;
    name: string;
    description: string | null;
    accentColor: string | null;
  }): Promise<GroupSummary> {
    const id = crypto.randomUUID();

    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT OR IGNORE INTO identities (id, display_name) VALUES (?, ?)`,
        )
        .bind(input.identityId, input.identityId),
      this.#db
        .prepare(
          `INSERT INTO groups
            (id, name, description, accent_color, owner_identity_id)
          VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          input.name,
          input.description,
          input.accentColor,
          input.identityId,
        ),
      this.#db
        .prepare(
          `INSERT INTO group_members (group_id, identity_id, role)
          VALUES (?, ?, 'owner')`,
        )
        .bind(id, input.identityId),
    ]);

    const group = await this.getGroupForIdentity({
      identityId: input.identityId,
      groupId: id,
    });
    if (!group) {
      throw new Error("Failed to create group");
    }
    return group;
  }

  async updateGroup(input: {
    identityId: string;
    groupId: string;
    name?: string;
    description?: string | null;
    accentColor?: string | null;
  }) {
    const role = await this.groupRole(input.identityId, input.groupId);
    if (role !== "owner") {
      return null;
    }
    const current = await this.getGroupForIdentity({
      identityId: input.identityId,
      groupId: input.groupId,
    });
    if (!current) {
      return null;
    }

    await this.#db
      .prepare(
        `UPDATE groups
        SET name = ?, description = ?, accent_color = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      )
      .bind(
        input.name ?? current.name,
        typeof input.description === "undefined"
          ? current.description
          : input.description,
        typeof input.accentColor === "undefined"
          ? current.accentColor
          : input.accentColor,
        input.groupId,
      )
      .run();
    return this.getGroupForIdentity({
      identityId: input.identityId,
      groupId: input.groupId,
    });
  }

  async deleteGroup(input: { identityId: string; groupId: string }) {
    const role = await this.groupRole(input.identityId, input.groupId);
    if (role !== "owner") {
      return false;
    }

    const documents = await this.#db
      .prepare(`SELECT id FROM documents WHERE group_id = ?`)
      .bind(input.groupId)
      .all<{ id: string }>();
    await this.#db
      .prepare(`DELETE FROM groups WHERE id = ?`)
      .bind(input.groupId)
      .run();
    for (const document of documents.results ?? []) {
      await this.#bucket.delete(`documents/${document.id}.md`);
    }
    return true;
  }

  async createDocument(input: {
    identityId: string;
    groupId: string;
    title: string;
    content: string;
  }): Promise<DocumentRecord | null> {
    const access = await this.groupRole(input.identityId, input.groupId);
    if (!access) {
      return null;
    }

    const id = crypto.randomUUID();
    const contentKey = `documents/${id}.md`;
    const position = await this.nextDocumentPosition(input.groupId);

    await this.#bucket.put(contentKey, input.content, {
      httpMetadata: {
        contentType: "text/markdown; charset=utf-8",
      },
    });

    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT INTO documents
            (id, group_id, title, content_key, created_by_identity_id, position)
          VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          input.groupId,
          input.title,
          contentKey,
          input.identityId,
          position,
        ),
      this.#db
        .prepare(
          `INSERT INTO document_collaborators (document_id, identity_id, role)
          VALUES (?, ?, 'owner')`,
        )
        .bind(id, input.identityId),
      this.#db
        .prepare(
          `UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        )
        .bind(input.groupId),
    ]);

    const document = await this.getDocumentForIdentity({
      identityId: input.identityId,
      documentId: id,
    });

    if (!document) {
      throw new Error("Failed to create document");
    }

    return document;
  }

  async getDocumentForIdentity(input: {
    identityId: string;
    documentId: string;
  }): Promise<DocumentRecord | null> {
    const row = await this.documentRowForIdentity(input);
    return row ? documentFromRow(this.#bucket, row) : null;
  }

  async updateDocument(input: {
    identityId: string;
    documentId: string;
    title?: string;
    content?: string;
  }): Promise<DocumentRecord | null> {
    const current = await this.getDocumentForIdentity(input);
    if (!current || !canWrite(current.role)) {
      return null;
    }

    if (typeof input.content !== "undefined") {
      await this.#bucket.put(
        `documents/${input.documentId}.md`,
        input.content,
        {
          httpMetadata: {
            contentType: "text/markdown; charset=utf-8",
          },
        },
      );
    }

    await this.#db.batch([
      this.#db
        .prepare(
          `UPDATE documents
          SET title = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(input.title ?? current.title, input.documentId),
      this.#db
        .prepare(
          `UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        )
        .bind(current.groupId),
    ]);

    return this.getDocumentForIdentity(input);
  }

  async moveDocument(input: {
    identityId: string;
    documentId: string;
    groupId: string;
    position?: number;
  }): Promise<DocumentRecord | null> {
    const current = await this.getDocumentForIdentity(input);
    if (!current || !canWrite(current.role)) {
      return null;
    }

    const targetRole = await this.groupRole(input.identityId, input.groupId);
    if (!targetRole) {
      return null;
    }

    const position =
      typeof input.position === "undefined"
        ? await this.nextDocumentPosition(input.groupId)
        : Math.trunc(input.position);

    await this.#db.batch([
      this.#db
        .prepare(
          `UPDATE documents
          SET group_id = ?, position = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(input.groupId, position, input.documentId),
      this.#db
        .prepare(
          `UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id IN (?, ?)`,
        )
        .bind(current.groupId, input.groupId),
    ]);

    return this.getDocumentForIdentity(input);
  }

  async positionDocument(input: {
    identityId: string;
    documentId: string;
    position: number;
  }): Promise<DocumentRecord | null> {
    const current = await this.getDocumentForIdentity(input);
    if (!current || !canWrite(current.role)) {
      return null;
    }

    await this.#db.batch([
      this.#db
        .prepare(
          `UPDATE documents
          SET position = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(Math.trunc(input.position), input.documentId),
      this.#db
        .prepare(
          `UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        )
        .bind(current.groupId),
    ]);

    return this.getDocumentForIdentity(input);
  }

  async deleteDocument(input: {
    identityId: string;
    documentId: string;
  }): Promise<boolean> {
    const current = await this.getDocumentForIdentity(input);

    if (!current || !canWrite(current.role)) {
      return false;
    }

    await this.#db
      .prepare(`DELETE FROM documents WHERE id = ?`)
      .bind(input.documentId)
      .run();
    await this.#bucket.delete(`documents/${input.documentId}.md`);

    return true;
  }

  async addDocumentCollaborator(input: {
    identityId: string;
    documentId: string;
    collaboratorIdentityId: string;
    role: Role;
  }): Promise<boolean> {
    const current = await this.getDocumentForIdentity(input);
    if (!current || current.role !== "owner") {
      return false;
    }

    if (
      input.identityId === input.collaboratorIdentityId &&
      input.role !== "owner" &&
      (await this.documentOwnerCount(input.documentId)) <= 1
    ) {
      return false;
    }

    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT OR IGNORE INTO identities (id, display_name) VALUES (?, ?)`,
        )
        .bind(input.collaboratorIdentityId, input.collaboratorIdentityId),
      this.#db
        .prepare(
          `INSERT OR REPLACE INTO document_collaborators
            (document_id, identity_id, role)
          VALUES (?, ?, ?)`,
        )
        .bind(input.documentId, input.collaboratorIdentityId, input.role),
    ]);
    return true;
  }

  async removeDocumentCollaborator(input: {
    identityId: string;
    documentId: string;
    collaboratorIdentityId: string;
  }) {
    const current = await this.getDocumentForIdentity(input);
    const selfRemoval = input.identityId === input.collaboratorIdentityId;
    if (!current || (current.role !== "owner" && !selfRemoval)) {
      return false;
    }

    const targetRole = await this.documentCollaboratorRole({
      documentId: input.documentId,
      identityId: input.collaboratorIdentityId,
    });
    if (!targetRole) {
      return false;
    }

    if (
      targetRole === "owner" &&
      (await this.documentOwnerCount(input.documentId)) <= 1
    ) {
      return false;
    }

    await this.#db
      .prepare(
        `DELETE FROM document_collaborators
        WHERE document_id = ? AND identity_id = ?`,
      )
      .bind(input.documentId, input.collaboratorIdentityId)
      .run();
    return true;
  }

  async createDocumentInvitation(input: {
    identityId: string;
    documentId: string;
    invitedIdentityId: string;
    role: Role;
    token: string;
  }) {
    const current = await this.getDocumentForIdentity(input);
    if (!current || current.role !== "owner") {
      return null;
    }

    const id = crypto.randomUUID();
    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT OR IGNORE INTO identities (id, display_name) VALUES (?, ?)`,
        )
        .bind(input.invitedIdentityId, input.invitedIdentityId),
      this.#db
        .prepare(
          `INSERT INTO document_invitations
            (id, document_id, invited_identity_id, role, token, created_by_identity_id)
          VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          input.documentId,
          input.invitedIdentityId,
          input.role,
          input.token,
          input.identityId,
        ),
    ]);
    return this.invitationById(id);
  }

  async acceptDocumentInvitation(input: { identityId: string; token: string }) {
    const invitation = await this.invitationByToken(input.token);
    if (
      !invitation ||
      invitation.status !== "pending" ||
      invitation.invitedIdentityId !== input.identityId
    ) {
      return null;
    }

    await this.#db.batch([
      this.#db
        .prepare(
          `INSERT OR REPLACE INTO document_collaborators
            (document_id, identity_id, role)
          VALUES (?, ?, ?)`,
        )
        .bind(invitation.documentId, input.identityId, invitation.role),
      this.#db
        .prepare(
          `UPDATE document_invitations
          SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(invitation.id),
    ]);
    return this.invitationById(invitation.id);
  }

  async getDocumentInvitationByToken(token: string) {
    const row = await this.#db
      .prepare(
        `SELECT di.token, di.status, di.invited_identity_id, di.role,
          d.id AS document_id, d.group_id, d.title,
          di.created_at, di.accepted_at, di.revoked_at
        FROM document_invitations di
        INNER JOIN documents d ON d.id = di.document_id
        WHERE di.token = ?`,
      )
      .bind(token)
      .first<InvitationPreviewRow>();
    return row ? invitationPreviewFromRow(row) : null;
  }

  async revokeDocumentInvitation(input: {
    identityId: string;
    invitationId: string;
  }) {
    const invitation = await this.invitationById(input.invitationId);
    if (!invitation) {
      return false;
    }

    const current = await this.getDocumentForIdentity({
      identityId: input.identityId,
      documentId: invitation.documentId,
    });
    if (!current || current.role !== "owner") {
      return false;
    }

    await this.#db
      .prepare(
        `UPDATE document_invitations
        SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      )
      .bind(input.invitationId)
      .run();
    return true;
  }

  async getDocumentShareState(input: {
    identityId: string;
    documentId: string;
  }): Promise<ShareState | null> {
    const current = await this.getDocumentForIdentity(input);
    if (!current || current.role !== "owner") {
      return null;
    }

    const collaborators = await this.#db
      .prepare(
        `SELECT dc.identity_id, i.display_name, dc.role, dc.created_at
        FROM document_collaborators dc
        LEFT JOIN identities i ON i.id = dc.identity_id
        WHERE dc.document_id = ?
        ORDER BY dc.created_at ASC`,
      )
      .bind(input.documentId)
      .all<CollaboratorRow>();
    const invitations = await this.#db
      .prepare(
        `SELECT id, document_id, invited_identity_id, role, token, status,
          created_by_identity_id, created_at, accepted_at, revoked_at
        FROM document_invitations
        WHERE document_id = ?
        ORDER BY created_at DESC`,
      )
      .bind(input.documentId)
      .all<InvitationRow>();
    const publicLinks = await this.#db
      .prepare(
        `SELECT id, document_id, token, label, active, created_at
        FROM public_links
        WHERE document_id = ?
        ORDER BY created_at DESC`,
      )
      .bind(input.documentId)
      .all<PublicLinkRow>();

    return {
      documentId: input.documentId,
      collaborators: (collaborators.results ?? []).map(collaboratorFromRow),
      invitations: (invitations.results ?? []).map(invitationFromRow),
      publicLinks: (publicLinks.results ?? []).map(publicLinkFromRow),
    };
  }

  async createPublicLink(input: {
    identityId: string;
    documentId: string;
    label: string | null;
    token: string;
  }): Promise<PublicLinkRecord | null> {
    const current = await this.getDocumentForIdentity(input);
    if (!current || !canWrite(current.role)) {
      return null;
    }

    const id = crypto.randomUUID();
    await this.#db
      .prepare(
        `INSERT INTO public_links
          (id, document_id, token, label, created_by_identity_id)
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id, input.documentId, input.token, input.label, input.identityId)
      .run();

    return this.publicLinkById(id);
  }

  async updatePublicLink(input: {
    identityId: string;
    publicLinkId: string;
    label?: string | null;
    active?: boolean;
  }) {
    const link = await this.publicLinkById(input.publicLinkId);
    if (!link) {
      return null;
    }
    const current = await this.getDocumentForIdentity({
      identityId: input.identityId,
      documentId: link.documentId,
    });
    if (!current || current.role !== "owner") {
      return null;
    }

    await this.#db
      .prepare(
        `UPDATE public_links
        SET label = ?, active = ?, revoked_at = CASE WHEN ? = 0 THEN CURRENT_TIMESTAMP ELSE revoked_at END
        WHERE id = ?`,
      )
      .bind(
        typeof input.label === "undefined" ? link.label : input.label,
        typeof input.active === "undefined"
          ? link.active
            ? 1
            : 0
          : input.active
            ? 1
            : 0,
        typeof input.active === "undefined"
          ? link.active
            ? 1
            : 0
          : input.active
            ? 1
            : 0,
        input.publicLinkId,
      )
      .run();

    return this.publicLinkById(input.publicLinkId);
  }

  async getDocumentByPublicToken(
    token: string,
  ): Promise<PublicDocumentRecord | null> {
    const row = await this.#db
      .prepare(
        `SELECT d.id, d.group_id, d.title, d.content_key, d.created_at, d.updated_at,
          pl.token, pl.label
        FROM public_links pl
        INNER JOIN documents d ON d.id = pl.document_id
        WHERE pl.token = ? AND pl.active = 1`,
      )
      .bind(token)
      .first<PublicDocumentRow>();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      groupId: row.group_id,
      title: row.title,
      content: await readMarkdown(this.#bucket, row.content_key),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publicLink: {
        token: row.token,
        label: row.label,
      },
    };
  }

  async getPublicLinkForIdentity(input: {
    identityId: string;
    publicLinkId: string;
  }) {
    const link = await this.publicLinkById(input.publicLinkId);
    if (!link) {
      return null;
    }

    const current = await this.getDocumentForIdentity({
      identityId: input.identityId,
      documentId: link.documentId,
    });
    if (!current || current.role !== "owner") {
      return null;
    }

    return link;
  }

  async getGroupForIdentity(input: { identityId: string; groupId: string }) {
    const row = await this.#db
      .prepare(
        `SELECT g.id, g.name, g.description, g.accent_color, gm.role,
          g.created_at, g.updated_at
        FROM groups g
        INNER JOIN group_members gm ON gm.group_id = g.id
        WHERE g.id = ? AND gm.identity_id = ?`,
      )
      .bind(input.groupId, input.identityId)
      .first<GroupRow>();
    if (!row) {
      return null;
    }

    const documents = await this.#db
      .prepare(
        `SELECT d.id, d.group_id, d.title, d.content_key,
          d.position, d.revision, d.created_at, d.updated_at,
          COALESCE(dc.role, gm.role) AS role
        FROM documents d
        LEFT JOIN group_members gm
          ON gm.group_id = d.group_id AND gm.identity_id = ?
        LEFT JOIN document_collaborators dc
          ON dc.document_id = d.id AND dc.identity_id = ?
        WHERE d.group_id = ?
          AND (gm.identity_id IS NOT NULL OR dc.identity_id IS NOT NULL)
        ORDER BY d.position ASC, d.updated_at DESC`,
      )
      .bind(input.identityId, input.identityId, input.groupId)
      .all<DocumentRow>();

    return groupFromRow(
      row,
      (documents.results ?? []).map(documentSummaryFromRow),
    );
  }

  private async documentRowForIdentity(input: {
    identityId: string;
    documentId: string;
  }) {
    return this.#db
      .prepare(
        `SELECT d.id, d.group_id, d.title, d.content_key,
          d.position, d.revision, d.created_at, d.updated_at,
          COALESCE(dc.role, gm.role) AS role
        FROM documents d
        LEFT JOIN group_members gm
          ON gm.group_id = d.group_id AND gm.identity_id = ?
        LEFT JOIN document_collaborators dc
          ON dc.document_id = d.id AND dc.identity_id = ?
        WHERE d.id = ?
          AND (gm.identity_id IS NOT NULL OR dc.identity_id IS NOT NULL)`,
      )
      .bind(input.identityId, input.identityId, input.documentId)
      .first<DocumentRow>();
  }

  private async nextDocumentPosition(groupId: string) {
    const row = await this.#db
      .prepare(
        `SELECT MAX(position) AS position FROM documents WHERE group_id = ?`,
      )
      .bind(groupId)
      .first<{ position: number | null }>();
    return (row?.position ?? 0) + 1000;
  }

  private async groupRole(identityId: string, groupId: string) {
    const row = await this.#db
      .prepare(
        `SELECT role FROM group_members
        WHERE group_id = ? AND identity_id = ?`,
      )
      .bind(groupId, identityId)
      .first<{ role: Role }>();

    return row?.role ?? null;
  }

  private async documentCollaboratorRole(input: {
    documentId: string;
    identityId: string;
  }) {
    const row = await this.#db
      .prepare(
        `SELECT role FROM document_collaborators
        WHERE document_id = ? AND identity_id = ?`,
      )
      .bind(input.documentId, input.identityId)
      .first<{ role: Role }>();
    return row?.role ?? null;
  }

  private async documentOwnerCount(documentId: string) {
    const row = await this.#db
      .prepare(
        `SELECT COUNT(*) AS count FROM document_collaborators
        WHERE document_id = ? AND role = 'owner'`,
      )
      .bind(documentId)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }

  private async publicLinkById(publicLinkId: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, document_id, token, label, active, created_at
        FROM public_links
        WHERE id = ?`,
      )
      .bind(publicLinkId)
      .first<PublicLinkRow>();
    return row ? publicLinkFromRow(row) : null;
  }

  private async invitationById(invitationId: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, document_id, invited_identity_id, role, token, status,
          created_by_identity_id, created_at, accepted_at, revoked_at
        FROM document_invitations
        WHERE id = ?`,
      )
      .bind(invitationId)
      .first<InvitationRow>();
    return row ? invitationFromRow(row) : null;
  }

  private async invitationByToken(token: string) {
    const row = await this.#db
      .prepare(
        `SELECT id, document_id, invited_identity_id, role, token, status,
          created_by_identity_id, created_at, accepted_at, revoked_at
        FROM document_invitations
        WHERE token = ?`,
      )
      .bind(token)
      .first<InvitationRow>();
    return row ? invitationFromRow(row) : null;
  }
}

function identityFromRow(row: IdentityRow): AuthIdentity {
  return {
    id: row.id,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

function credentialFromRow(row: CredentialRow): WebAuthnCredentialRecord {
  return {
    id: row.id,
    identityId: row.identity_id,
    credentialId: row.credential_id,
    publicKey: new Uint8Array(row.public_key),
    counter: row.counter,
    transports: JSON.parse(
      row.transports,
    ) as WebAuthnCredentialRecord["transports"],
    createdAt: row.created_at,
  };
}

function challengeFromRow(row: ChallengeRow): StoredWebAuthnChallenge {
  return {
    id: row.id,
    identityId: row.identity_id,
    type: row.type,
    challenge: row.challenge,
    createdAt: row.created_at,
  };
}

function sessionFromRow(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    identityId: row.identity_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function oauthAuthorizationCodeFromRow(
  row: OAuthAuthorizationCodeRow,
): OAuthAuthorizationCodeRecord {
  return {
    id: row.id,
    codeHash: row.code_hash,
    identityId: row.identity_id,
    clientId: row.client_id,
    redirectUri: row.redirect_uri,
    codeChallenge: row.code_challenge,
    codeChallengeMethod: row.code_challenge_method,
    scopes: parseScopes(row.scopes),
    resource: row.resource,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
  };
}

function oauthAuthorizationRequestFromRow(
  row: OAuthAuthorizationRequestRow,
): OAuthAuthorizationRequestRecord {
  return {
    id: row.id,
    requestHash: row.request_hash,
    identityId: row.identity_id,
    clientId: row.client_id,
    redirectUri: row.redirect_uri,
    codeChallenge: row.code_challenge,
    codeChallengeMethod: row.code_challenge_method,
    scopes: parseScopes(row.scopes),
    resource: row.resource,
    state: row.state,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
  };
}

function oauthAccessTokenFromRow(row: OAuthTokenRow): OAuthAccessTokenRecord {
  return {
    tokenHash: row.token_hash,
    identityId: row.identity_id,
    clientId: row.client_id,
    scopes: parseScopes(row.scopes),
    resource: row.resource,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  };
}

function oauthRefreshTokenFromRow(row: OAuthTokenRow): OAuthRefreshTokenRecord {
  return {
    tokenHash: row.token_hash,
    identityId: row.identity_id,
    clientId: row.client_id,
    scopes: parseScopes(row.scopes),
    resource: row.resource,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  };
}

function parseScopes(value: string) {
  const scopes: unknown = JSON.parse(value);
  return Array.isArray(scopes)
    ? scopes.filter((scope): scope is string => typeof scope === "string")
    : [];
}

function publicLinkFromRow(row: PublicLinkRow): PublicLinkRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    token: row.token,
    label: row.label,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

function collaboratorFromRow(row: CollaboratorRow): CollaboratorRecord {
  return {
    identityId: row.identity_id,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

function invitationFromRow(row: InvitationRow): InvitationRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    invitedIdentityId: row.invited_identity_id,
    role: row.role,
    token: row.token,
    status: row.status,
    createdByIdentityId: row.created_by_identity_id,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    revokedAt: row.revoked_at,
  };
}

function invitationPreviewFromRow(
  row: InvitationPreviewRow,
): InvitationPreview {
  return {
    token: row.token,
    status: row.status,
    invitedIdentityId: row.invited_identity_id,
    role: row.role,
    document: {
      id: row.document_id,
      groupId: row.group_id,
      title: row.title,
    },
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    revokedAt: row.revoked_at,
  };
}

function canWrite(role: Role) {
  return role === "owner" || role === "editor";
}
