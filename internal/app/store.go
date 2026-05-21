package app

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schemaSQL string

type Store interface {
	CreateUserWithWorkspace(ctx context.Context, name, email, passwordHash string) (User, Workspace, error)
	GetUserByEmail(ctx context.Context, email string) (User, error)
	CreateSession(ctx context.Context, userID string) (Session, error)
	GetSession(ctx context.Context, sessionID string) (Session, error)
	DeleteSession(ctx context.Context, sessionID string) error
	GetUser(ctx context.Context, userID string) (User, error)
	ListWorkspacesForUser(ctx context.Context, userID string) ([]Workspace, error)
	UpdateWorkspace(ctx context.Context, workspaceID, name string) (Workspace, error)
	CreateDocument(ctx context.Context, params CreateDocumentParams) (Document, DocumentVersion, error)
	CreateDocumentVersion(ctx context.Context, params CreateVersionParams) (DocumentVersion, error)
	ListStacks(ctx context.Context, workspaceID string, query string) ([]StackSummary, error)
	GetStack(ctx context.Context, workspaceID, stackID string) (Stack, error)
	UpdateStack(ctx context.Context, workspaceID, stackID, name string, public bool) (Stack, error)
	ListStackDocuments(ctx context.Context, workspaceID, stackID string) ([]DocumentSummary, error)
	ListDocuments(ctx context.Context, workspaceID string, query string) ([]DocumentSummary, error)
	GetDocument(ctx context.Context, workspaceID, documentID string) (Document, error)
	GetVersion(ctx context.Context, documentID, versionID string) (DocumentVersion, error)
	GetLatestVersion(ctx context.Context, documentID string) (DocumentVersion, error)
	ListVersions(ctx context.Context, documentID string) ([]DocumentVersion, error)
	CreateShare(ctx context.Context, documentID, versionID, createdBy string, includeAnnotations bool) (Share, error)
	GetShare(ctx context.Context, token string) (Share, Document, DocumentVersion, error)
	CreateAnnotation(ctx context.Context, params CreateAnnotationParams) (Annotation, error)
	ListAnnotations(ctx context.Context, versionID string) ([]AnnotationThread, error)
	CreateAnnotationComment(ctx context.Context, annotationID, authorID, body string) (AnnotationComment, error)
	ListActivity(ctx context.Context, workspaceID string, limit int) ([]ActivityEvent, error)
	CreateIngestSource(ctx context.Context, workspaceID, createdBy, kind, name string) (IngestSource, error)
	ReplaceChunks(ctx context.Context, documentID, versionID string, chunks []Chunk) error
	ListChunks(ctx context.Context, workspaceID string, latestOnly bool) ([]SearchResult, error)
	GetChunkTrace(ctx context.Context, chunkID string) (TraceResult, error)
	ListRecentDocuments(ctx context.Context, workspaceID string, limit int, since *time.Time) ([]DocumentSummary, error)
}

type CreateDocumentParams struct {
	WorkspaceID string
	CreatedBy   string
	StackID     string
	StackName   string
	Title       string
	Slug        string
	Content     string
	Color       Color
	Theme       Theme
	SourceID    *string
}

type CreateVersionParams struct {
	DocumentID string
	AuthoredBy string
	Content    string
	SourceID   *string
}

type CreateAnnotationParams struct {
	DocumentID        string `json:"document_id"`
	DocumentVersionID string `json:"document_version_id"`
	AuthorID          string `json:"author_id"`
	Quote             string `json:"quote"`
	Comment           string `json:"comment"`
	StartOffset       int    `json:"start_offset"`
	EndOffset         int    `json:"end_offset"`
	Prefix            string `json:"prefix"`
	Suffix            string `json:"suffix"`
}

type PostgresStore struct {
	pool *pgxpool.Pool
}

func NewPostgresStore(ctx context.Context, databaseURL string) (*PostgresStore, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, err
	}

	store := &PostgresStore{pool: pool}
	if err := store.migrate(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	return store, nil
}

func (s *PostgresStore) Close() {
	s.pool.Close()
}

func (s *PostgresStore) migrate(ctx context.Context) error {
	_, err := s.pool.Exec(ctx, schemaSQL)
	return err
}

func (s *PostgresStore) CreateUserWithWorkspace(ctx context.Context, name, email, passwordHash string) (User, Workspace, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return User{}, Workspace{}, err
	}
	defer tx.Rollback(ctx)

	user := User{}
	if err := tx.QueryRow(ctx, `
		insert into users (name, email, password_hash)
		values ($1, $2, $3)
		returning id, name, email, password_hash, created_at
	`, name, strings.ToLower(email), passwordHash).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.CreatedAt); err != nil {
		return User{}, Workspace{}, err
	}

	workspace := Workspace{}
	slug := slugify(name)
	if err := tx.QueryRow(ctx, `
		insert into workspaces (name, slug, created_by)
		values ($1, $2, $3)
		returning id, name, slug, created_by, created_at
	`, fmt.Sprintf("%s workspace", name), slug, user.ID).Scan(&workspace.ID, &workspace.Name, &workspace.Slug, &workspace.CreatedBy, &workspace.CreatedAt); err != nil {
		return User{}, Workspace{}, err
	}

	if _, err := tx.Exec(ctx, `
		insert into workspace_memberships (workspace_id, user_id, role)
		values ($1, $2, 'owner')
	`, workspace.ID, user.ID); err != nil {
		return User{}, Workspace{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return User{}, Workspace{}, err
	}

	return user, workspace, nil
}

func (s *PostgresStore) GetUserByEmail(ctx context.Context, email string) (User, error) {
	row := s.pool.QueryRow(ctx, `
		select id, name, email, password_hash, created_at
		from users
		where email = $1
	`, strings.ToLower(email))

	return scanUser(row)
}

func (s *PostgresStore) CreateSession(ctx context.Context, userID string) (Session, error) {
	token, err := randomToken(18)
	if err != nil {
		return Session{}, err
	}

	row := s.pool.QueryRow(ctx, `
		insert into sessions (id, user_id, expires_at)
		values ($1, $2, now() + interval '30 days')
		returning id, user_id, created_at, expires_at
	`, token, userID)

	var session Session
	err = row.Scan(&session.ID, &session.UserID, &session.CreatedAt, &session.ExpiresAt)
	return session, err
}

func (s *PostgresStore) GetSession(ctx context.Context, sessionID string) (Session, error) {
	row := s.pool.QueryRow(ctx, `
		select id, user_id, created_at, expires_at
		from sessions
		where id = $1 and expires_at > now()
	`, sessionID)

	var session Session
	err := row.Scan(&session.ID, &session.UserID, &session.CreatedAt, &session.ExpiresAt)
	return session, err
}

func (s *PostgresStore) DeleteSession(ctx context.Context, sessionID string) error {
	_, err := s.pool.Exec(ctx, `delete from sessions where id = $1`, sessionID)
	return err
}

func (s *PostgresStore) GetUser(ctx context.Context, userID string) (User, error) {
	row := s.pool.QueryRow(ctx, `
		select id, name, email, password_hash, created_at
		from users
		where id = $1
	`, userID)

	return scanUser(row)
}

func (s *PostgresStore) ListWorkspacesForUser(ctx context.Context, userID string) ([]Workspace, error) {
	rows, err := s.pool.Query(ctx, `
		select w.id, w.name, w.slug, w.created_by, w.created_at
		from workspaces w
		join workspace_memberships m on m.workspace_id = w.id
		where m.user_id = $1
		order by w.created_at asc
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workspaces []Workspace
	for rows.Next() {
		var workspace Workspace
		if err := rows.Scan(&workspace.ID, &workspace.Name, &workspace.Slug, &workspace.CreatedBy, &workspace.CreatedAt); err != nil {
			return nil, err
		}

		workspaces = append(workspaces, workspace)
	}

	return workspaces, rows.Err()
}

func (s *PostgresStore) UpdateWorkspace(ctx context.Context, workspaceID, name string) (Workspace, error) {
	row := s.pool.QueryRow(ctx, `
		update workspaces
		set name = $2
		where id = $1
		returning id, name, slug, created_by, created_at
	`, workspaceID, name)

	var workspace Workspace
	err := row.Scan(&workspace.ID, &workspace.Name, &workspace.Slug, &workspace.CreatedBy, &workspace.CreatedAt)
	return workspace, err
}

func (s *PostgresStore) CreateDocument(ctx context.Context, params CreateDocumentParams) (Document, DocumentVersion, error) {
	html, text, err := renderMarkdown(params.Content)
	if err != nil {
		return Document{}, DocumentVersion{}, err
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Document{}, DocumentVersion{}, err
	}
	defer tx.Rollback(ctx)

	stackID := params.StackID
	stackName := fallback(params.StackName, params.Title)
	if stackID == "" {
		if err := tx.QueryRow(ctx, `
			insert into stacks (workspace_id, name, slug, created_by)
			values ($1, $2, $3, $4)
			on conflict (workspace_id, slug) do update set name = excluded.name, updated_at = now()
			returning id
		`, params.WorkspaceID, stackName, slugify(stackName), params.CreatedBy).Scan(&stackID); err != nil {
			return Document{}, DocumentVersion{}, err
		}
	}

	var stackPosition int
	if err := tx.QueryRow(ctx, `
		select coalesce(max(stack_position), -1) + 1
		from documents
		where stack_id = $1
	`, stackID).Scan(&stackPosition); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	themeColor := normalizeColor(params.Color)
	themeType := normalizeTheme(params.Theme)

	document := Document{}
	if err := tx.QueryRow(ctx, `
		insert into documents (workspace_id, stack_id, title, slug, status, created_by, stack_position, theme_color, theme_type)
		values ($1, $2, $3, $4, 'active', $5, $6, $7, $8)
		returning id, workspace_id, coalesce(stack_id::text, ''), title, slug, status, public, created_by, coalesce(latest_version_id::text, ''), stack_position, theme_color, theme_type, created_at, updated_at
	`, params.WorkspaceID, stackID, params.Title, params.Slug, params.CreatedBy, stackPosition, themeColor, themeType).Scan(
		&document.ID,
		&document.WorkspaceID,
		&document.StackID,
		&document.Title,
		&document.Slug,
		&document.Status,
		&document.Public,
		&document.CreatedBy,
		&document.LatestVersionID,
		&document.StackPosition,
		&document.Color,
		&document.Theme,
		&document.CreatedAt,
		&document.UpdatedAt,
	); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	version := DocumentVersion{}
	if err := tx.QueryRow(ctx, `
		insert into document_versions (
			document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id
		)
		values ($1, 1, $2, $3, $4, encode(digest($2, 'sha256'), 'hex'), $5, $6)
		returning id, document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id, created_at
	`, document.ID, params.Content, html, text, params.CreatedBy, params.SourceID).Scan(
		&version.ID,
		&version.DocumentID,
		&version.VersionNumber,
		&version.ContentMarkdown,
		&version.ContentHTML,
		&version.ContentText,
		&version.ContentHash,
		&version.AuthoredBy,
		&version.IngestSourceID,
		&version.CreatedAt,
	); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	if _, err := tx.Exec(ctx, `
		update documents
		set latest_version_id = $2, updated_at = now()
		where id = $1
	`, document.ID, version.ID); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	if _, err := tx.Exec(ctx, `
		update stacks
		set updated_at = now()
		where id = $1
	`, stackID); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	if _, err := tx.Exec(ctx, `
		insert into activity_events (workspace_id, document_id, actor_id, event_type, summary)
		values ($1, $2, $3, 'document.created', $4)
	`, document.WorkspaceID, document.ID, params.CreatedBy, fmt.Sprintf("Created %s", document.Title)); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	if err := replaceChunksTx(ctx, tx, document.ID, version.ID, chunkMarkdown(params.Content)); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return Document{}, DocumentVersion{}, err
	}

	document.LatestVersionID = version.ID
	return document, version, nil
}

func (s *PostgresStore) CreateDocumentVersion(ctx context.Context, params CreateVersionParams) (DocumentVersion, error) {
	html, text, err := renderMarkdown(params.Content)
	if err != nil {
		return DocumentVersion{}, err
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return DocumentVersion{}, err
	}
	defer tx.Rollback(ctx)

	var versionNumber int
	var workspaceID, title string
	if err := tx.QueryRow(ctx, `
		select d.workspace_id, d.title, coalesce(max(v.version_number), 0) + 1
		from documents d
		left join document_versions v on v.document_id = d.id
		where d.id = $1
		group by d.workspace_id, d.title
	`, params.DocumentID).Scan(&workspaceID, &title, &versionNumber); err != nil {
		return DocumentVersion{}, err
	}

	version := DocumentVersion{}
	if err := tx.QueryRow(ctx, `
		insert into document_versions (
			document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id
		)
		values ($1, $2, $3, $4, $5, encode(digest($3, 'sha256'), 'hex'), $6, $7)
		returning id, document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id, created_at
	`, params.DocumentID, versionNumber, params.Content, html, text, params.AuthoredBy, params.SourceID).Scan(
		&version.ID,
		&version.DocumentID,
		&version.VersionNumber,
		&version.ContentMarkdown,
		&version.ContentHTML,
		&version.ContentText,
		&version.ContentHash,
		&version.AuthoredBy,
		&version.IngestSourceID,
		&version.CreatedAt,
	); err != nil {
		return DocumentVersion{}, err
	}

	if _, err := tx.Exec(ctx, `
		update documents
		set latest_version_id = $2, updated_at = now()
		where id = $1
	`, params.DocumentID, version.ID); err != nil {
		return DocumentVersion{}, err
	}

	if _, err := tx.Exec(ctx, `
		insert into activity_events (workspace_id, document_id, actor_id, event_type, summary)
		values ($1, $2, $3, 'document.version_created', $4)
	`, workspaceID, params.DocumentID, params.AuthoredBy, fmt.Sprintf("Created version %d for %s", version.VersionNumber, title)); err != nil {
		return DocumentVersion{}, err
	}

	if err := replaceChunksTx(ctx, tx, params.DocumentID, version.ID, chunkMarkdown(params.Content)); err != nil {
		return DocumentVersion{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return DocumentVersion{}, err
	}

	return version, nil
}

func (s *PostgresStore) ListStacks(ctx context.Context, workspaceID string, query string) ([]StackSummary, error) {
	pattern := "%"
	if query != "" {
		pattern = "%" + strings.ToLower(query) + "%"
	}

	rows, err := s.pool.Query(ctx, `
		with stack_docs as (
			select distinct on (d.stack_id)
				d.stack_id,
				d.id as latest_document_id,
				d.title as latest_document_title,
				d.theme_color,
				d.theme_type,
				v.version_number,
				left(v.content_text, 180) as excerpt
			from documents d
			join document_versions v on v.id = d.latest_version_id
			where d.workspace_id = $1
			order by d.stack_id, d.updated_at desc
		)
		select s.id, s.workspace_id, s.name, s.slug, s.public, s.created_by, s.created_at, s.updated_at,
			count(d.id), coalesce(sd.latest_document_id::text, ''), coalesce(sd.latest_document_title, ''),
			coalesce(sd.version_number, 0), coalesce(sd.excerpt, ''), coalesce(sd.theme_color, 'sky'), coalesce(sd.theme_type, 'sans-serif')
		from stacks s
		left join documents d on d.stack_id = s.id
		left join document_versions v on v.id = d.latest_version_id
		left join stack_docs sd on sd.stack_id = s.id
		where s.workspace_id = $1 and ($2 = '%' or lower(s.name) like $2 or lower(coalesce(d.title, '')) like $2 or lower(coalesce(v.content_text, '')) like $2)
		group by s.id, sd.latest_document_id, sd.latest_document_title, sd.version_number, sd.excerpt, sd.theme_color, sd.theme_type
		order by s.updated_at desc
	`, workspaceID, pattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stacks []StackSummary
	for rows.Next() {
		var summary StackSummary
		if err := rows.Scan(
			&summary.ID,
			&summary.WorkspaceID,
			&summary.Name,
			&summary.Slug,
			&summary.Public,
			&summary.CreatedBy,
			&summary.CreatedAt,
			&summary.UpdatedAt,
			&summary.DocumentCount,
			&summary.LatestDocumentID,
			&summary.LatestDocumentTitle,
			&summary.LatestVersionNumber,
			&summary.Excerpt,
			&summary.Color,
			&summary.Theme,
		); err != nil {
			return nil, err
		}
		stacks = append(stacks, summary)
	}

	return stacks, rows.Err()
}

func (s *PostgresStore) GetStack(ctx context.Context, workspaceID, stackID string) (Stack, error) {
	row := s.pool.QueryRow(ctx, `
		select id, workspace_id, name, slug, public, created_by, created_at, updated_at
		from stacks
		where id = $1 and workspace_id = $2
	`, stackID, workspaceID)

	var stack Stack
	err := row.Scan(&stack.ID, &stack.WorkspaceID, &stack.Name, &stack.Slug, &stack.Public, &stack.CreatedBy, &stack.CreatedAt, &stack.UpdatedAt)
	return stack, err
}

func (s *PostgresStore) UpdateStack(ctx context.Context, workspaceID, stackID, name string, public bool) (Stack, error) {
	row := s.pool.QueryRow(ctx, `
		update stacks
		set name = $3, public = $4, updated_at = now()
		where id = $1 and workspace_id = $2
		returning id, workspace_id, name, slug, public, created_by, created_at, updated_at
	`, stackID, workspaceID, name, public)

	var stack Stack
	err := row.Scan(&stack.ID, &stack.WorkspaceID, &stack.Name, &stack.Slug, &stack.Public, &stack.CreatedBy, &stack.CreatedAt, &stack.UpdatedAt)
	return stack, err
}

func (s *PostgresStore) ListStackDocuments(ctx context.Context, workspaceID, stackID string) ([]DocumentSummary, error) {
	rows, err := s.pool.Query(ctx, `
		select d.id, d.workspace_id, coalesce(d.stack_id::text, ''), d.title, d.slug, d.status, d.public, d.created_by, coalesce(d.latest_version_id::text, ''),
			d.stack_position, d.theme_color, d.theme_type, d.created_at, d.updated_at,
			v.version_number, left(v.content_text, 180)
		from documents d
		join document_versions v on v.id = d.latest_version_id
		where d.workspace_id = $1 and d.stack_id = $2
		order by d.stack_position asc, d.created_at asc
	`, workspaceID, stackID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []DocumentSummary
	for rows.Next() {
		summary, err := scanDocumentSummary(rows)
		if err != nil {
			return nil, err
		}
		documents = append(documents, summary)
	}

	return documents, rows.Err()
}

func (s *PostgresStore) ListDocuments(ctx context.Context, workspaceID string, query string) ([]DocumentSummary, error) {
	pattern := "%"
	if query != "" {
		pattern = "%" + strings.ToLower(query) + "%"
	}

	rows, err := s.pool.Query(ctx, `
		select d.id, d.workspace_id, coalesce(d.stack_id::text, ''), d.title, d.slug, d.status, d.public, d.created_by, coalesce(d.latest_version_id::text, ''),
			d.stack_position, d.theme_color, d.theme_type, d.created_at, d.updated_at,
			v.version_number, left(v.content_text, 180)
		from documents d
		join document_versions v on v.id = d.latest_version_id
		where d.workspace_id = $1 and ($2 = '%' or lower(d.title) like $2 or lower(v.content_text) like $2)
		order by d.updated_at desc
	`, workspaceID, pattern)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []DocumentSummary
	for rows.Next() {
		summary, err := scanDocumentSummary(rows)
		if err != nil {
			return nil, err
		}

		documents = append(documents, summary)
	}

	return documents, rows.Err()
}

func (s *PostgresStore) GetDocument(ctx context.Context, workspaceID, documentID string) (Document, error) {
	row := s.pool.QueryRow(ctx, `
		select id, workspace_id, coalesce(stack_id::text, ''), title, slug, status, public, created_by, coalesce(latest_version_id::text, ''),
			stack_position, theme_color, theme_type, created_at, updated_at
		from documents
		where id = $1 and workspace_id = $2
	`, documentID, workspaceID)

	return scanDocument(row)
}

func (s *PostgresStore) GetVersion(ctx context.Context, documentID, versionID string) (DocumentVersion, error) {
	row := s.pool.QueryRow(ctx, `
		select id, document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id, created_at
		from document_versions
		where id = $1 and document_id = $2
	`, versionID, documentID)
	return scanVersion(row)
}

func (s *PostgresStore) GetLatestVersion(ctx context.Context, documentID string) (DocumentVersion, error) {
	row := s.pool.QueryRow(ctx, `
		select v.id, v.document_id, v.version_number, v.content_markdown, v.content_html, v.content_text, v.content_hash, v.authored_by, v.ingest_source_id, v.created_at
		from document_versions v
		join documents d on d.latest_version_id = v.id
		where d.id = $1
	`, documentID)
	return scanVersion(row)
}

func (s *PostgresStore) ListVersions(ctx context.Context, documentID string) ([]DocumentVersion, error) {
	rows, err := s.pool.Query(ctx, `
		select id, document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id, created_at
		from document_versions
		where document_id = $1
		order by version_number desc
	`, documentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []DocumentVersion
	for rows.Next() {
		version, err := scanVersion(rows)
		if err != nil {
			return nil, err
		}
		versions = append(versions, version)
	}

	return versions, rows.Err()
}

func (s *PostgresStore) CreateShare(ctx context.Context, documentID, versionID, createdBy string, includeAnnotations bool) (Share, error) {
	token, err := randomToken(14)
	if err != nil {
		return Share{}, err
	}

	var workspaceID, title string
	if err := s.pool.QueryRow(ctx, `
		select workspace_id, title from documents where id = $1
	`, documentID).Scan(&workspaceID, &title); err != nil {
		return Share{}, err
	}

	row := s.pool.QueryRow(ctx, `
		insert into document_shares (document_id, document_version_id, token, include_annotations, created_by)
		values ($1, $2, $3, $4, $5)
		returning id, document_id, document_version_id, token, include_annotations, created_by, created_at
	`, documentID, versionID, token, includeAnnotations, createdBy)

	var share Share
	if err := row.Scan(&share.ID, &share.DocumentID, &share.DocumentVersionID, &share.Token, &share.IncludeAnnotations, &share.CreatedBy, &share.CreatedAt); err != nil {
		return Share{}, err
	}

	_, _ = s.pool.Exec(ctx, `
		insert into activity_events (workspace_id, document_id, actor_id, event_type, summary)
		values ($1, $2, $3, 'share.created', $4)
	`, workspaceID, documentID, createdBy, fmt.Sprintf("Created share for %s", title))

	return share, nil
}

func (s *PostgresStore) GetShare(ctx context.Context, token string) (Share, Document, DocumentVersion, error) {
	row := s.pool.QueryRow(ctx, `
		select s.id, s.document_id, s.document_version_id, s.token, s.include_annotations, s.created_by, s.created_at,
			d.id, d.workspace_id, coalesce(d.stack_id::text, ''), d.title, d.slug, d.status, d.public, d.created_by, coalesce(d.latest_version_id::text, ''),
			d.stack_position, d.theme_color, d.theme_type, d.created_at, d.updated_at,
			v.id, v.document_id, v.version_number, v.content_markdown, v.content_html, v.content_text, v.content_hash, v.authored_by, v.ingest_source_id, v.created_at
		from document_shares s
		join documents d on d.id = s.document_id
		join document_versions v on v.id = s.document_version_id
		where s.token = $1
	`, token)

	var share Share
	var document Document
	var version DocumentVersion

	err := row.Scan(
		&share.ID, &share.DocumentID, &share.DocumentVersionID, &share.Token, &share.IncludeAnnotations, &share.CreatedBy, &share.CreatedAt,
		&document.ID, &document.WorkspaceID, &document.StackID, &document.Title, &document.Slug, &document.Status, &document.Public, &document.CreatedBy, &document.LatestVersionID, &document.StackPosition, &document.Color, &document.Theme, &document.CreatedAt, &document.UpdatedAt,
		&version.ID, &version.DocumentID, &version.VersionNumber, &version.ContentMarkdown, &version.ContentHTML, &version.ContentText, &version.ContentHash, &version.AuthoredBy, &version.IngestSourceID, &version.CreatedAt,
	)

	return share, document, version, err
}

func (s *PostgresStore) CreateAnnotation(ctx context.Context, params CreateAnnotationParams) (Annotation, error) {
	row := s.pool.QueryRow(ctx, `
		insert into annotations (
			document_id, document_version_id, author_id, quote, comment, start_offset, end_offset, prefix_text, suffix_text
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		returning id, document_id, document_version_id, author_id, quote, comment, start_offset, end_offset, prefix_text, suffix_text, created_at
	`, params.DocumentID, params.DocumentVersionID, params.AuthorID, params.Quote, params.Comment, params.StartOffset, params.EndOffset, params.Prefix, params.Suffix)

	var annotation Annotation
	if err := row.Scan(
		&annotation.ID,
		&annotation.DocumentID,
		&annotation.DocumentVersionID,
		&annotation.AuthorID,
		&annotation.Quote,
		&annotation.Comment,
		&annotation.StartOffset,
		&annotation.EndOffset,
		&annotation.Prefix,
		&annotation.Suffix,
		&annotation.CreatedAt,
	); err != nil {
		return Annotation{}, err
	}

	var workspaceID, title string
	_ = s.pool.QueryRow(ctx, `select workspace_id, title from documents where id = $1`, params.DocumentID).Scan(&workspaceID, &title)
	_, _ = s.pool.Exec(ctx, `
		insert into activity_events (workspace_id, document_id, actor_id, event_type, summary)
		values ($1, $2, $3, 'annotation.created', $4)
	`, workspaceID, params.DocumentID, params.AuthorID, fmt.Sprintf("Annotated %s", title))

	return annotation, nil
}

func (s *PostgresStore) ListAnnotations(ctx context.Context, versionID string) ([]AnnotationThread, error) {
	rows, err := s.pool.Query(ctx, `
		select id, document_id, document_version_id, author_id, quote, comment, start_offset, end_offset, prefix_text, suffix_text, created_at
		from annotations
		where document_version_id = $1
		order by created_at asc
	`, versionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []AnnotationThread
	for rows.Next() {
		var annotation Annotation
		if err := rows.Scan(
			&annotation.ID,
			&annotation.DocumentID,
			&annotation.DocumentVersionID,
			&annotation.AuthorID,
			&annotation.Quote,
			&annotation.Comment,
			&annotation.StartOffset,
			&annotation.EndOffset,
			&annotation.Prefix,
			&annotation.Suffix,
			&annotation.CreatedAt,
		); err != nil {
			return nil, err
		}

		comments, err := s.annotationComments(ctx, annotation.ID)
		if err != nil {
			return nil, err
		}

		threads = append(threads, AnnotationThread{
			Annotation: annotation,
			Comments:   comments,
		})
	}

	return threads, rows.Err()
}

func (s *PostgresStore) annotationComments(ctx context.Context, annotationID string) ([]AnnotationComment, error) {
	rows, err := s.pool.Query(ctx, `
		select id, annotation_id, author_id, body, created_at
		from annotation_comments
		where annotation_id = $1
		order by created_at asc
	`, annotationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []AnnotationComment
	for rows.Next() {
		var comment AnnotationComment
		if err := rows.Scan(&comment.ID, &comment.AnnotationID, &comment.AuthorID, &comment.Body, &comment.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, rows.Err()
}

func (s *PostgresStore) CreateAnnotationComment(ctx context.Context, annotationID, authorID, body string) (AnnotationComment, error) {
	row := s.pool.QueryRow(ctx, `
		insert into annotation_comments (annotation_id, author_id, body)
		values ($1, $2, $3)
		returning id, annotation_id, author_id, body, created_at
	`, annotationID, authorID, body)

	var comment AnnotationComment
	if err := row.Scan(&comment.ID, &comment.AnnotationID, &comment.AuthorID, &comment.Body, &comment.CreatedAt); err != nil {
		return AnnotationComment{}, err
	}

	var documentID, workspaceID string
	_ = s.pool.QueryRow(ctx, `
		select a.document_id, d.workspace_id
		from annotations a
		join documents d on d.id = a.document_id
		where a.id = $1
	`, annotationID).Scan(&documentID, &workspaceID)
	_, _ = s.pool.Exec(ctx, `
		insert into activity_events (workspace_id, document_id, actor_id, event_type, summary)
		values ($1, $2, $3, 'annotation.reply_created', 'Replied to an annotation')
	`, workspaceID, documentID, authorID)

	return comment, nil
}

func (s *PostgresStore) ListActivity(ctx context.Context, workspaceID string, limit int) ([]ActivityEvent, error) {
	rows, err := s.pool.Query(ctx, `
		select id, workspace_id, document_id, actor_id, event_type, summary, created_at
		from activity_events
		where workspace_id = $1
		order by created_at desc
		limit $2
	`, workspaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []ActivityEvent
	for rows.Next() {
		var event ActivityEvent
		if err := rows.Scan(&event.ID, &event.WorkspaceID, &event.DocumentID, &event.ActorID, &event.EventType, &event.Summary, &event.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, rows.Err()
}

func (s *PostgresStore) CreateIngestSource(ctx context.Context, workspaceID, createdBy, kind, name string) (IngestSource, error) {
	row := s.pool.QueryRow(ctx, `
		insert into ingest_sources (workspace_id, kind, name, created_by)
		values ($1, $2, $3, $4)
		returning id, workspace_id, kind, name, created_by, created_at
	`, workspaceID, kind, name, createdBy)

	var source IngestSource
	err := row.Scan(&source.ID, &source.WorkspaceID, &source.Kind, &source.Name, &source.CreatedBy, &source.CreatedAt)
	return source, err
}

func (s *PostgresStore) ReplaceChunks(ctx context.Context, documentID, versionID string, chunks []Chunk) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if err := replaceChunksTx(ctx, tx, documentID, versionID, chunkContents(chunks)); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func replaceChunksTx(ctx context.Context, tx pgx.Tx, documentID, versionID string, contents []string) error {
	if _, err := tx.Exec(ctx, `
		delete from document_chunks where document_version_id = $1
	`, versionID); err != nil {
		return err
	}

	for _, content := range contents {
		embedding, err := json.Marshal(deterministicEmbedding(content))
		if err != nil {
			return err
		}

		if _, err := tx.Exec(ctx, `
			insert into document_chunks (document_id, document_version_id, content, search_text, embedding)
			values ($1, $2, $3, $4, $5::jsonb)
		`, documentID, versionID, content, strings.ToLower(content), string(embedding)); err != nil {
			return err
		}
	}

	return nil
}

func chunkContents(chunks []Chunk) []string {
	values := make([]string, 0, len(chunks))
	for _, chunk := range chunks {
		values = append(values, chunk.Content)
	}
	return values
}

func (s *PostgresStore) ListChunks(ctx context.Context, workspaceID string, latestOnly bool) ([]SearchResult, error) {
	latestFilter := ""
	if latestOnly {
		latestFilter = "and d.latest_version_id = v.id"
	}

	rows, err := s.pool.Query(ctx, `
		select d.id, d.title, d.slug, v.id, v.version_number, c.id, c.content, d.workspace_id
		from document_chunks c
		join document_versions v on v.id = c.document_version_id
		join documents d on d.id = c.document_id
		where d.workspace_id = $1 `+latestFilter+`
	`, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var result SearchResult
		if err := rows.Scan(
			&result.DocumentID,
			&result.DocumentTitle,
			&result.DocumentSlug,
			&result.VersionID,
			&result.VersionNumber,
			&result.ChunkID,
			&result.Snippet,
			&result.Provenance.WorkspaceID,
		); err != nil {
			return nil, err
		}

		result.Provenance.DocumentID = result.DocumentID
		result.Provenance.DocumentVersionID = result.VersionID
		result.Provenance.ChunkID = result.ChunkID
		results = append(results, result)
	}

	return results, rows.Err()
}

func (s *PostgresStore) GetChunkTrace(ctx context.Context, chunkID string) (TraceResult, error) {
	row := s.pool.QueryRow(ctx, `
		select c.id, c.document_id, c.document_version_id, c.content, c.search_text, c.embedding,
			d.id, d.workspace_id, coalesce(d.stack_id::text, ''), d.title, d.slug, d.status, d.public, d.created_by, coalesce(d.latest_version_id::text, ''),
			d.stack_position, d.theme_color, d.theme_type, d.created_at, d.updated_at,
			v.id, v.document_id, v.version_number, v.content_markdown, v.content_html, v.content_text, v.content_hash, v.authored_by, v.ingest_source_id, v.created_at
		from document_chunks c
		join documents d on d.id = c.document_id
		join document_versions v on v.id = c.document_version_id
		where c.id = $1
	`, chunkID)

	var trace TraceResult
	var rawEmbedding []byte
	if err := row.Scan(
		&trace.Chunk.ID, &trace.Chunk.DocumentID, &trace.Chunk.DocumentVersionID, &trace.Chunk.Content, &trace.Chunk.SearchText, &rawEmbedding,
		&trace.Document.ID, &trace.Document.WorkspaceID, &trace.Document.StackID, &trace.Document.Title, &trace.Document.Slug, &trace.Document.Status, &trace.Document.Public, &trace.Document.CreatedBy, &trace.Document.LatestVersionID, &trace.Document.StackPosition, &trace.Document.Color, &trace.Document.Theme, &trace.Document.CreatedAt, &trace.Document.UpdatedAt,
		&trace.Version.ID, &trace.Version.DocumentID, &trace.Version.VersionNumber, &trace.Version.ContentMarkdown, &trace.Version.ContentHTML, &trace.Version.ContentText, &trace.Version.ContentHash, &trace.Version.AuthoredBy, &trace.Version.IngestSourceID, &trace.Version.CreatedAt,
	); err != nil {
		return TraceResult{}, err
	}

	_ = json.Unmarshal(rawEmbedding, &trace.Chunk.Embedding)
	return trace, nil
}

func (s *PostgresStore) ListRecentDocuments(ctx context.Context, workspaceID string, limit int, since *time.Time) ([]DocumentSummary, error) {
	if limit <= 0 {
		limit = 10
	}

	when := time.Time{}
	if since != nil {
		when = *since
	}

	rows, err := s.pool.Query(ctx, `
		select d.id, d.workspace_id, coalesce(d.stack_id::text, ''), d.title, d.slug, d.status, d.public, d.created_by, coalesce(d.latest_version_id::text, ''),
			d.stack_position, d.theme_color, d.theme_type, d.created_at, d.updated_at,
			v.version_number, left(v.content_text, 180)
		from documents d
		join document_versions v on v.id = d.latest_version_id
		where d.workspace_id = $1 and ($2::timestamptz = '0001-01-01 00:00:00+00'::timestamptz or d.updated_at >= $2)
		order by d.updated_at desc
		limit $3
	`, workspaceID, when, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []DocumentSummary
	for rows.Next() {
		summary, err := scanDocumentSummary(rows)
		if err != nil {
			return nil, err
		}

		documents = append(documents, summary)
	}

	return documents, rows.Err()
}

func scanUser(row interface{ Scan(dest ...any) error }) (User, error) {
	var user User
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.CreatedAt)
	return user, err
}

func scanDocument(row interface{ Scan(dest ...any) error }) (Document, error) {
	var document Document
	err := row.Scan(
		&document.ID,
		&document.WorkspaceID,
		&document.StackID,
		&document.Title,
		&document.Slug,
		&document.Status,
		&document.Public,
		&document.CreatedBy,
		&document.LatestVersionID,
		&document.StackPosition,
		&document.Color,
		&document.Theme,
		&document.CreatedAt,
		&document.UpdatedAt,
	)
	return document, err
}

func scanDocumentSummary(row interface{ Scan(dest ...any) error }) (DocumentSummary, error) {
	var summary DocumentSummary
	err := row.Scan(
		&summary.ID,
		&summary.WorkspaceID,
		&summary.StackID,
		&summary.Title,
		&summary.Slug,
		&summary.Status,
		&summary.Public,
		&summary.CreatedBy,
		&summary.LatestVersionID,
		&summary.StackPosition,
		&summary.Color,
		&summary.Theme,
		&summary.CreatedAt,
		&summary.UpdatedAt,
		&summary.VersionNumber,
		&summary.Excerpt,
	)
	return summary, err
}

func scanVersion(row interface{ Scan(dest ...any) error }) (DocumentVersion, error) {
	var version DocumentVersion
	err := row.Scan(
		&version.ID,
		&version.DocumentID,
		&version.VersionNumber,
		&version.ContentMarkdown,
		&version.ContentHTML,
		&version.ContentText,
		&version.ContentHash,
		&version.AuthoredBy,
		&version.IngestSourceID,
		&version.CreatedAt,
	)
	return version, err
}

func normalizeColor(value Color) Color {
	switch Color(strings.ToLower(strings.TrimSpace(string(value)))) {
	case ColorBlush, ColorLavender, ColorMint, ColorSky, ColorPeach:
		return Color(strings.ToLower(strings.TrimSpace(string(value))))
	case "blue":
		return ColorSky
	case "pink":
		return ColorBlush
	case "yellow":
		return ColorPeach
	case "green":
		return ColorMint
	default:
		return ColorSky
	}
}

func normalizeTheme(value Theme) Theme {
	switch Theme(strings.ToLower(strings.TrimSpace(string(value)))) {
	case ThemeSerif, ThemeMono, ThemeSansSerif:
		return Theme(strings.ToLower(strings.TrimSpace(string(value))))
	case "sans":
		return ThemeSansSerif
	default:
		return ThemeSansSerif
	}
}

func slugify(input string) string {
	value := strings.ToLower(strings.TrimSpace(input))
	replacer := strings.NewReplacer(" ", "-", "_", "-", "/", "-", ".", "-")
	value = replacer.Replace(value)
	for strings.Contains(value, "--") {
		value = strings.ReplaceAll(value, "--", "-")
	}
	value = strings.Trim(value, "-")
	if value == "" {
		return "downwrite"
	}
	return value
}

var errNotFound = errors.New("not found")
