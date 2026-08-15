CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
	id TEXT PRIMARY KEY,
	code_hash TEXT NOT NULL UNIQUE,
	identity_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	redirect_uri TEXT NOT NULL,
	code_challenge TEXT NOT NULL,
	code_challenge_method TEXT NOT NULL CHECK (code_challenge_method = 'S256'),
	scopes TEXT NOT NULL,
	resource TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	expires_at TEXT NOT NULL,
	consumed_at TEXT,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oauth_access_tokens (
	token_hash TEXT PRIMARY KEY,
	identity_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	scopes TEXT NOT NULL,
	resource TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	expires_at TEXT NOT NULL,
	revoked_at TEXT,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
	token_hash TEXT PRIMARY KEY,
	identity_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	scopes TEXT NOT NULL,
	resource TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	expires_at TEXT NOT NULL,
	revoked_at TEXT,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_identity
	ON oauth_authorization_codes(identity_id);

CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_identity
	ON oauth_access_tokens(identity_id);

CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_identity
	ON oauth_refresh_tokens(identity_id);
