ALTER TABLE documents ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
ALTER TABLE documents ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_documents_group_position
  ON documents(group_id, position, updated_at);
