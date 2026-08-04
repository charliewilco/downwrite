CREATE TABLE IF NOT EXISTS oauth_authorization_requests (
	id TEXT PRIMARY KEY,
	request_hash TEXT NOT NULL UNIQUE,
	identity_id TEXT NOT NULL,
	client_id TEXT NOT NULL,
	redirect_uri TEXT NOT NULL,
	code_challenge TEXT NOT NULL,
	code_challenge_method TEXT NOT NULL CHECK (code_challenge_method = 'S256'),
	scopes TEXT NOT NULL,
	resource TEXT NOT NULL,
	state TEXT,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	expires_at TEXT NOT NULL,
	consumed_at TEXT,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_oauth_authorization_requests_identity
	ON oauth_authorization_requests(identity_id);
