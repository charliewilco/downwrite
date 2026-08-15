CREATE TABLE IF NOT EXISTS identities (
	id TEXT PRIMARY KEY,
	display_name TEXT,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	owner_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (owner_identity_id) REFERENCES identities(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS group_members (
	group_id TEXT NOT NULL,
	identity_id TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (group_id, identity_id),
	FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
	id TEXT PRIMARY KEY,
	group_id TEXT NOT NULL,
	title TEXT NOT NULL,
	content_key TEXT NOT NULL,
	created_by_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
	FOREIGN KEY (created_by_identity_id) REFERENCES identities(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS document_collaborators (
	document_id TEXT NOT NULL,
	identity_id TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('owner', 'editor')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (document_id, identity_id),
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
	FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public_links (
	id TEXT PRIMARY KEY,
	document_id TEXT NOT NULL,
	token TEXT NOT NULL UNIQUE,
	label TEXT,
	active INTEGER NOT NULL DEFAULT 1,
	created_by_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
	FOREIGN KEY (created_by_identity_id) REFERENCES identities(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_group_members_identity
	ON group_members(identity_id);

CREATE INDEX IF NOT EXISTS idx_documents_group
	ON documents(group_id);

CREATE INDEX IF NOT EXISTS idx_document_collaborators_identity
	ON document_collaborators(identity_id);

CREATE INDEX IF NOT EXISTS idx_public_links_token
	ON public_links(token);
