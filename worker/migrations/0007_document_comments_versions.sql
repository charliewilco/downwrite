CREATE TABLE IF NOT EXISTS comment_threads (
	id TEXT PRIMARY KEY,
	document_id TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
	anchor_type TEXT NOT NULL CHECK (anchor_type IN ('document', 'text')),
	start_line INTEGER,
	start_column INTEGER,
	end_line INTEGER,
	end_column INTEGER,
	quote TEXT,
	base_revision INTEGER,
	created_by_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resolved_by_identity_id TEXT,
	resolved_at TEXT,
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
	FOREIGN KEY (created_by_identity_id) REFERENCES identities(id) ON DELETE RESTRICT,
	FOREIGN KEY (resolved_by_identity_id) REFERENCES identities(id) ON DELETE SET NULL,
	CHECK (
		(anchor_type = 'document'
			AND start_line IS NULL
			AND start_column IS NULL
			AND end_line IS NULL
			AND end_column IS NULL
			AND quote IS NULL
			AND base_revision IS NULL)
		OR
		(anchor_type = 'text'
			AND start_line IS NOT NULL
			AND start_column IS NOT NULL
			AND end_line IS NOT NULL
			AND end_column IS NOT NULL
			AND quote IS NOT NULL
			AND base_revision IS NOT NULL)
	)
);

CREATE TABLE IF NOT EXISTS comment_messages (
	id TEXT PRIMARY KEY,
	thread_id TEXT NOT NULL,
	body TEXT NOT NULL,
	created_by_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (thread_id) REFERENCES comment_threads(id) ON DELETE CASCADE,
	FOREIGN KEY (created_by_identity_id) REFERENCES identities(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS document_versions (
	id TEXT PRIMARY KEY,
	document_id TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	source_revision INTEGER NOT NULL,
	title TEXT NOT NULL,
	content_key TEXT NOT NULL,
	created_by_identity_id TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
	FOREIGN KEY (created_by_identity_id) REFERENCES identities(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_comment_threads_document_status
	ON comment_threads(document_id, status, updated_at);

CREATE INDEX IF NOT EXISTS idx_comment_messages_thread
	ON comment_messages(thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_document_versions_document
	ON document_versions(document_id, created_at);
