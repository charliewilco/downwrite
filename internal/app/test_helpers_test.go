package app

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http/httptest"
	"net/url"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

type fakeStore struct {
	mu                sync.Mutex
	nextID            int
	users             map[string]User
	usersByEmail      map[string]string
	workspaces        map[string]Workspace
	memberships       map[string][]Workspace
	sessions          map[string]Session
	documents         map[string]Document
	versions          map[string]DocumentVersion
	versionsByDoc     map[string][]DocumentVersion
	shares            map[string]Share
	annotations       map[string][]AnnotationThread
	activity          map[string][]ActivityEvent
	chunks            map[string]Chunk
	chunksByWorkspace map[string][]SearchResult
	defaultUser       User
	defaultWorkspace  Workspace
}

func newFakeStore() *fakeStore {
	store := &fakeStore{
		nextID:            1,
		users:             map[string]User{},
		usersByEmail:      map[string]string{},
		workspaces:        map[string]Workspace{},
		memberships:       map[string][]Workspace{},
		sessions:          map[string]Session{},
		documents:         map[string]Document{},
		versions:          map[string]DocumentVersion{},
		versionsByDoc:     map[string][]DocumentVersion{},
		shares:            map[string]Share{},
		annotations:       map[string][]AnnotationThread{},
		activity:          map[string][]ActivityEvent{},
		chunks:            map[string]Chunk{},
		chunksByWorkspace: map[string][]SearchResult{},
	}

	user, workspace, err := store.CreateUserWithWorkspace(context.Background(), "Charlie", "charlie@example.com", "hashed-password")
	if err != nil {
		panic(err)
	}
	store.defaultUser = user
	store.defaultWorkspace = workspace
	return store
}

func (s *fakeStore) id(prefix string) string {
	value := fmt.Sprintf("%s-%d", prefix, s.nextID)
	s.nextID++
	return value
}

func (s *fakeStore) CreateUserWithWorkspace(_ context.Context, name, email, passwordHash string) (User, Workspace, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	email = strings.ToLower(email)
	if _, exists := s.usersByEmail[email]; exists {
		return User{}, Workspace{}, errors.New("email already exists")
	}

	user := User{
		ID:           s.id("user"),
		Name:         name,
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    time.Now().UTC(),
	}
	workspace := Workspace{
		ID:        s.id("workspace"),
		Name:      fmt.Sprintf("%s workspace", name),
		Slug:      slugify(name),
		CreatedBy: user.ID,
		CreatedAt: time.Now().UTC(),
	}

	s.users[user.ID] = user
	s.usersByEmail[email] = user.ID
	s.workspaces[workspace.ID] = workspace
	s.memberships[user.ID] = append(s.memberships[user.ID], workspace)

	return user, workspace, nil
}

func (s *fakeStore) GetUserByEmail(_ context.Context, email string) (User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	id, ok := s.usersByEmail[strings.ToLower(email)]
	if !ok {
		return User{}, errors.New("not found")
	}

	return s.users[id], nil
}

func (s *fakeStore) CreateSession(_ context.Context, userID string) (Session, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	session := Session{
		ID:        s.id("session"),
		UserID:    userID,
		CreatedAt: time.Now().UTC(),
		ExpiresAt: time.Now().UTC().Add(24 * time.Hour),
	}
	s.sessions[session.ID] = session
	return session, nil
}

func (s *fakeStore) GetSession(_ context.Context, sessionID string) (Session, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[sessionID]
	if !ok {
		return Session{}, errors.New("not found")
	}

	return session, nil
}

func (s *fakeStore) DeleteSession(_ context.Context, sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, sessionID)
	return nil
}

func (s *fakeStore) GetUser(_ context.Context, userID string) (User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.users[userID]
	if !ok {
		return User{}, errors.New("not found")
	}

	return user, nil
}

func (s *fakeStore) ListWorkspacesForUser(_ context.Context, userID string) ([]Workspace, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	return slices.Clone(s.memberships[userID]), nil
}

func (s *fakeStore) CreateDocument(_ context.Context, params CreateDocumentParams) (Document, DocumentVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	html, text, err := renderMarkdown(params.Content)
	if err != nil {
		return Document{}, DocumentVersion{}, err
	}

	document := Document{
		ID:          s.id("doc"),
		WorkspaceID: params.WorkspaceID,
		Title:       params.Title,
		Slug:        params.Slug,
		Status:      "active",
		CreatedBy:   params.CreatedBy,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	version := DocumentVersion{
		ID:              s.id("ver"),
		DocumentID:      document.ID,
		VersionNumber:   1,
		ContentMarkdown: params.Content,
		ContentHTML:     html,
		ContentText:     text,
		ContentHash:     fmt.Sprintf("hash-%s", document.ID),
		AuthoredBy:      params.CreatedBy,
		IngestSourceID:  params.SourceID,
		CreatedAt:       time.Now().UTC(),
	}
	document.LatestVersionID = version.ID

	s.documents[document.ID] = document
	s.versions[version.ID] = version
	s.versionsByDoc[document.ID] = []DocumentVersion{version}
	s.addChunk(document, version, version.ContentText)
	s.recordActivity(document.WorkspaceID, &document.ID, &params.CreatedBy, "document.created", fmt.Sprintf("Created %s", document.Title))

	return document, version, nil
}

func (s *fakeStore) CreateDocumentVersion(_ context.Context, params CreateVersionParams) (DocumentVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	document, ok := s.documents[params.DocumentID]
	if !ok {
		return DocumentVersion{}, errors.New("document not found")
	}

	html, text, err := renderMarkdown(params.Content)
	if err != nil {
		return DocumentVersion{}, err
	}

	number := len(s.versionsByDoc[params.DocumentID]) + 1
	version := DocumentVersion{
		ID:              s.id("ver"),
		DocumentID:      params.DocumentID,
		VersionNumber:   number,
		ContentMarkdown: params.Content,
		ContentHTML:     html,
		ContentText:     text,
		ContentHash:     fmt.Sprintf("hash-%s-%d", params.DocumentID, number),
		AuthoredBy:      params.AuthoredBy,
		IngestSourceID:  params.SourceID,
		CreatedAt:       time.Now().UTC(),
	}

	document.LatestVersionID = version.ID
	document.UpdatedAt = time.Now().UTC()
	s.documents[document.ID] = document
	s.versions[version.ID] = version
	s.versionsByDoc[document.ID] = append([]DocumentVersion{version}, s.versionsByDoc[document.ID]...)
	s.addChunk(document, version, version.ContentText)
	s.recordActivity(document.WorkspaceID, &document.ID, &params.AuthoredBy, "document.version_created", fmt.Sprintf("Created version %d for %s", version.VersionNumber, document.Title))

	return version, nil
}

func (s *fakeStore) ListDocuments(_ context.Context, workspaceID string, query string) ([]DocumentSummary, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	query = strings.ToLower(strings.TrimSpace(query))
	var documents []DocumentSummary
	for _, document := range s.documents {
		if document.WorkspaceID != workspaceID {
			continue
		}
		version := s.versions[document.LatestVersionID]
		if query != "" && !strings.Contains(strings.ToLower(document.Title), query) && !strings.Contains(strings.ToLower(version.ContentText), query) {
			continue
		}
		documents = append(documents, DocumentSummary{
			Document:      document,
			VersionNumber: version.VersionNumber,
			Excerpt:       version.ContentText,
		})
	}

	slices.SortFunc(documents, func(a, b DocumentSummary) int {
		return strings.Compare(b.ID, a.ID)
	})
	return documents, nil
}

func (s *fakeStore) GetDocument(_ context.Context, workspaceID, documentID string) (Document, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	document, ok := s.documents[documentID]
	if !ok || document.WorkspaceID != workspaceID {
		return Document{}, errors.New("not found")
	}
	return document, nil
}

func (s *fakeStore) GetVersion(_ context.Context, documentID, versionID string) (DocumentVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	version, ok := s.versions[versionID]
	if !ok || version.DocumentID != documentID {
		return DocumentVersion{}, errors.New("not found")
	}
	return version, nil
}

func (s *fakeStore) GetLatestVersion(_ context.Context, documentID string) (DocumentVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	versions := s.versionsByDoc[documentID]
	if len(versions) == 0 {
		return DocumentVersion{}, errors.New("not found")
	}
	return versions[0], nil
}

func (s *fakeStore) ListVersions(_ context.Context, documentID string) ([]DocumentVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return slices.Clone(s.versionsByDoc[documentID]), nil
}

func (s *fakeStore) CreateShare(_ context.Context, documentID, versionID, createdBy string, includeAnnotations bool) (Share, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	document, ok := s.documents[documentID]
	if !ok {
		return Share{}, errors.New("document not found")
	}
	version, ok := s.versions[versionID]
	if !ok || version.DocumentID != documentID {
		return Share{}, errors.New("version not found")
	}

	share := Share{
		ID:                 s.id("share"),
		DocumentID:         documentID,
		DocumentVersionID:  versionID,
		Token:              s.id("token"),
		IncludeAnnotations: includeAnnotations,
		CreatedBy:          createdBy,
		CreatedAt:          time.Now().UTC(),
	}
	s.shares[share.Token] = share
	s.recordActivity(document.WorkspaceID, &document.ID, &createdBy, "share.created", fmt.Sprintf("Created share for %s", document.Title))
	return share, nil
}

func (s *fakeStore) GetShare(_ context.Context, token string) (Share, Document, DocumentVersion, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	share, ok := s.shares[token]
	if !ok {
		return Share{}, Document{}, DocumentVersion{}, errors.New("not found")
	}
	document := s.documents[share.DocumentID]
	version := s.versions[share.DocumentVersionID]
	return share, document, version, nil
}

func (s *fakeStore) CreateAnnotation(_ context.Context, params CreateAnnotationParams) (Annotation, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	document, ok := s.documents[params.DocumentID]
	if !ok {
		return Annotation{}, errors.New("document not found")
	}

	annotation := Annotation{
		ID:                s.id("annotation"),
		DocumentID:        params.DocumentID,
		DocumentVersionID: params.DocumentVersionID,
		AuthorID:          params.AuthorID,
		Quote:             params.Quote,
		Comment:           params.Comment,
		StartOffset:       params.StartOffset,
		EndOffset:         params.EndOffset,
		Prefix:            params.Prefix,
		Suffix:            params.Suffix,
		CreatedAt:         time.Now().UTC(),
	}
	s.annotations[params.DocumentVersionID] = append(s.annotations[params.DocumentVersionID], AnnotationThread{Annotation: annotation})
	s.recordActivity(document.WorkspaceID, &document.ID, &params.AuthorID, "annotation.created", fmt.Sprintf("Annotated %s", document.Title))
	return annotation, nil
}

func (s *fakeStore) ListAnnotations(_ context.Context, versionID string) ([]AnnotationThread, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return slices.Clone(s.annotations[versionID]), nil
}

func (s *fakeStore) CreateAnnotationComment(_ context.Context, annotationID, authorID, body string) (AnnotationComment, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	comment := AnnotationComment{
		ID:           s.id("comment"),
		AnnotationID: annotationID,
		AuthorID:     authorID,
		Body:         body,
		CreatedAt:    time.Now().UTC(),
	}

	for versionID, threads := range s.annotations {
		for index := range threads {
			if threads[index].Annotation.ID == annotationID {
				threads[index].Comments = append(threads[index].Comments, comment)
				s.annotations[versionID] = threads
				return comment, nil
			}
		}
	}

	return AnnotationComment{}, errors.New("annotation not found")
}

func (s *fakeStore) ListActivity(_ context.Context, workspaceID string, limit int) ([]ActivityEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	events := slices.Clone(s.activity[workspaceID])
	if limit > 0 && len(events) > limit {
		events = events[:limit]
	}
	return events, nil
}

func (s *fakeStore) CreateIngestSource(_ context.Context, workspaceID, createdBy, kind, name string) (IngestSource, error) {
	return IngestSource{
		ID:          s.id("source"),
		WorkspaceID: workspaceID,
		Kind:        kind,
		Name:        name,
		CreatedBy:   createdBy,
		CreatedAt:   time.Now().UTC(),
	}, nil
}

func (s *fakeStore) ReplaceChunks(_ context.Context, _, _ string, _ []Chunk) error {
	return nil
}

func (s *fakeStore) ListChunks(_ context.Context, workspaceID string, _ bool) ([]SearchResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return slices.Clone(s.chunksByWorkspace[workspaceID]), nil
}

func (s *fakeStore) GetChunkTrace(_ context.Context, chunkID string) (TraceResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	chunk, ok := s.chunks[chunkID]
	if !ok {
		return TraceResult{}, errors.New("not found")
	}
	document := s.documents[chunk.DocumentID]
	version := s.versions[chunk.DocumentVersionID]
	return TraceResult{Chunk: chunk, Document: document, Version: version}, nil
}

func (s *fakeStore) ListRecentDocuments(_ context.Context, workspaceID string, limit int, since *time.Time) ([]DocumentSummary, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var summaries []DocumentSummary
	for _, document := range s.documents {
		if document.WorkspaceID != workspaceID {
			continue
		}
		if since != nil && document.UpdatedAt.Before(*since) {
			continue
		}
		version := s.versions[document.LatestVersionID]
		summaries = append(summaries, DocumentSummary{
			Document:      document,
			VersionNumber: version.VersionNumber,
			Excerpt:       version.ContentText,
		})
	}
	if limit > 0 && len(summaries) > limit {
		summaries = summaries[:limit]
	}
	return summaries, nil
}

func (s *fakeStore) addChunk(document Document, version DocumentVersion, content string) {
	chunk := Chunk{
		ID:                s.id("chunk"),
		DocumentID:        document.ID,
		DocumentVersionID: version.ID,
		Content:           content,
		SearchText:        strings.ToLower(content),
		Embedding:         deterministicEmbedding(content),
	}
	s.chunks[chunk.ID] = chunk
	s.chunksByWorkspace[document.WorkspaceID] = append(s.chunksByWorkspace[document.WorkspaceID], SearchResult{
		DocumentID:    document.ID,
		DocumentTitle: document.Title,
		DocumentSlug:  document.Slug,
		VersionID:     version.ID,
		VersionNumber: version.VersionNumber,
		ChunkID:       chunk.ID,
		Snippet:       chunk.Content,
		Provenance: SearchProvenance{
			WorkspaceID:       document.WorkspaceID,
			DocumentID:        document.ID,
			DocumentVersionID: version.ID,
			ChunkID:           chunk.ID,
		},
	})
}

func (s *fakeStore) recordActivity(workspaceID string, documentID, actorID *string, eventType, summary string) {
	event := ActivityEvent{
		ID:          s.id("event"),
		WorkspaceID: workspaceID,
		DocumentID:  documentID,
		ActorID:     actorID,
		EventType:   eventType,
		Summary:     summary,
		CreatedAt:   time.Now().UTC(),
	}
	s.activity[workspaceID] = append([]ActivityEvent{event}, s.activity[workspaceID]...)
}

func newTestRouter(t *testing.T) (*gin.Engine, *fakeStore, Config) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	templates, err := newTemplates()
	if err != nil {
		t.Fatalf("parse templates: %v", err)
	}

	store := newFakeStore()
	cfg := Config{
		Addr:            ":7878",
		SessionSecret:   "test-secret",
		MCPWriteEnabled: false,
	}
	app := &App{
		config:    cfg,
		store:     store,
		templates: templates,
	}

	return app.newRouter(), store, cfg
}

func form(values map[string]string) string {
	encoded := url.Values{}
	for key, value := range values {
		encoded.Set(key, value)
	}
	return encoded.Encode()
}

func newRecorder() *httptest.ResponseRecorder {
	return httptest.NewRecorder()
}

func multipartBody(name, content string) (*bytes.Buffer, string, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", name)
	if err != nil {
		return nil, "", err
	}

	if _, err := io.Copy(part, strings.NewReader(content)); err != nil {
		return nil, "", err
	}

	if err := writer.Close(); err != nil {
		return nil, "", err
	}

	return &body, writer.FormDataContentType(), nil
}
