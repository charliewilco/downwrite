ALTER TABLE groups ADD COLUMN description TEXT;
ALTER TABLE groups ADD COLUMN accent_color TEXT;

ALTER TABLE public_links ADD COLUMN revoked_at TEXT;

CREATE TABLE IF NOT EXISTS webauthn_credentials (
	id TEXT PRIMARY KEY,
	identity_id TEXT NOT NULL,
	credential_id TEXT NOT NULL UNIQUE,
	public_key BLOB NOT NULL,
	counter INTEGER NOT NULL DEFAULT 0,
	transports TEXT NOT NULL DEFAULT '[]',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webauthn_challenges (
	id TEXT PRIMARY KEY,
	identity_id TEXT NOT NULL,
	type TEXT NOT NULL CHECK (type IN ('bootstrap', 'registration', 'login')),
	challenge TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	identity_id TEXT NOT NULL,
	token_hash TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	expires_at TEXT NOT NULL,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_invitations (
	id TEXT PRIMARY KEY,
	document_id TEXT NOT NULL,
	invited_identity_id TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
	token TEXT NOT NULL UNIQUE,
	status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
	created_by_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	accepted_at TEXT,
	revoked_at TEXT,
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
	FOREIGN KEY (created_by_identity_id) REFERENCES identities(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_identity
	ON webauthn_credentials(identity_id);

CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_identity
	ON webauthn_challenges(identity_id);

CREATE INDEX IF NOT EXISTS idx_sessions_identity
	ON sessions(identity_id);

CREATE INDEX IF NOT EXISTS idx_document_invitations_document
	ON document_invitations(document_id);

CREATE INDEX IF NOT EXISTS idx_document_invitations_token
	ON document_invitations(token);
