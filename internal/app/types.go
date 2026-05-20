package app

import "time"

type ID string

type Theme string

const (
	ThemeSerif     Theme = "serif"
	ThemeMono      Theme = "mono"
	ThemeSansSerif Theme = "sans-serif"
)

type Color string

const (
	ColorBlush    Color = "blush"
	ColorLavender Color = "lavender"
	ColorMint     Color = "mint"
	ColorSky      Color = "sky"
	ColorPeach    Color = "peach"
)

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Workspace struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

type Membership struct {
	WorkspaceID string `json:"workspace_id"`
	UserID      string `json:"user_id"`
	Role        string `json:"role"`
}

type Session struct {
	ID        string    `json:"-"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type Document struct {
	ID              string    `json:"id"`
	WorkspaceID     string    `json:"workspace_id"`
	StackID         string    `json:"stack_id"`
	Title           string    `json:"title"`
	Slug            string    `json:"slug"`
	Status          string    `json:"status"`
	Public          bool      `json:"public"`
	CreatedBy       string    `json:"created_by"`
	LatestVersionID string    `json:"latest_version_id"`
	StackPosition   int       `json:"stack_position"`
	Color           Color     `json:"color"`
	Theme           Theme     `json:"theme"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Stack struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Public      bool      `json:"public"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DocumentVersion struct {
	ID              string    `json:"id"`
	DocumentID      string    `json:"document_id"`
	VersionNumber   int       `json:"version_number"`
	ContentMarkdown string    `json:"content_markdown"`
	ContentHTML     string    `json:"content_html"`
	ContentText     string    `json:"content_text"`
	ContentHash     string    `json:"content_hash"`
	AuthoredBy      string    `json:"authored_by"`
	IngestSourceID  *string   `json:"ingest_source_id,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type DocumentSummary struct {
	Document
	VersionNumber int    `json:"version_number"`
	Excerpt       string `json:"excerpt"`
}

type StackSummary struct {
	Stack
	DocumentCount       int
	LatestDocumentID    string
	LatestDocumentTitle string
	LatestVersionNumber int
	Excerpt             string
	Color               Color
	Theme               Theme
}

type MDocumentVersion struct {
	ID      ID        `json:"id"`
	Content string    `json:"content"`
	Updated time.Time `json:"updated"`
	Created time.Time `json:"created"`
}

type MDocument struct {
	ID       ID                 `json:"id"`
	Title    string             `json:"title"`
	Public   bool               `json:"public"`
	Theme    Theme              `json:"theme"`
	Color    Color              `json:"color"`
	Versions []MDocumentVersion `json:"versions"`
	Updated  time.Time          `json:"updated"`
	Created  time.Time          `json:"created"`
}

type MStack struct {
	ID      ID          `json:"id"`
	Title   string      `json:"title"`
	Public  bool        `json:"public"`
	Docs    []MDocument `json:"docs"`
	Updated time.Time   `json:"updated"`
	Created time.Time   `json:"created"`
}

type Share struct {
	ID                 string    `json:"id"`
	DocumentID         string    `json:"document_id"`
	DocumentVersionID  string    `json:"document_version_id"`
	Token              string    `json:"token"`
	IncludeAnnotations bool      `json:"include_annotations"`
	CreatedBy          string    `json:"created_by"`
	CreatedAt          time.Time `json:"created_at"`
}

type Annotation struct {
	ID                string    `json:"id"`
	DocumentID        string    `json:"document_id"`
	DocumentVersionID string    `json:"document_version_id"`
	AuthorID          string    `json:"author_id"`
	Quote             string    `json:"quote"`
	Comment           string    `json:"comment"`
	StartOffset       int       `json:"start_offset"`
	EndOffset         int       `json:"end_offset"`
	Prefix            string    `json:"prefix"`
	Suffix            string    `json:"suffix"`
	CreatedAt         time.Time `json:"created_at"`
}

type AnnotationComment struct {
	ID           string    `json:"id"`
	AnnotationID string    `json:"annotation_id"`
	AuthorID     string    `json:"author_id"`
	Body         string    `json:"body"`
	CreatedAt    time.Time `json:"created_at"`
}

type AnnotationThread struct {
	Annotation Annotation          `json:"annotation"`
	Comments   []AnnotationComment `json:"comments"`
}

type ActivityEvent struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	DocumentID  *string   `json:"document_id,omitempty"`
	ActorID     *string   `json:"actor_id,omitempty"`
	EventType   string    `json:"event_type"`
	Summary     string    `json:"summary"`
	CreatedAt   time.Time `json:"created_at"`
}

type IngestSource struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	Kind        string    `json:"kind"`
	Name        string    `json:"name"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

type Chunk struct {
	ID                string    `json:"id"`
	DocumentID        string    `json:"document_id"`
	DocumentVersionID string    `json:"document_version_id"`
	Content           string    `json:"content"`
	SearchText        string    `json:"search_text"`
	Embedding         []float64 `json:"embedding"`
}

type SearchResult struct {
	DocumentID    string           `json:"document_id"`
	DocumentTitle string           `json:"document_title"`
	DocumentSlug  string           `json:"document_slug"`
	VersionID     string           `json:"version_id"`
	VersionNumber int              `json:"version_number"`
	ChunkID       string           `json:"chunk_id"`
	Snippet       string           `json:"snippet"`
	LexicalScore  float64          `json:"lexical_score"`
	SemanticScore float64          `json:"semantic_score"`
	CombinedScore float64          `json:"combined_score"`
	Provenance    SearchProvenance `json:"provenance"`
}

type SearchProvenance struct {
	WorkspaceID       string `json:"workspace_id"`
	DocumentID        string `json:"document_id"`
	DocumentVersionID string `json:"document_version_id"`
	ChunkID           string `json:"chunk_id"`
}

type TraceResult struct {
	Chunk    Chunk           `json:"chunk"`
	Document Document        `json:"document"`
	Version  DocumentVersion `json:"version"`
}

type ContextResult struct {
	Query   string         `json:"query"`
	Results []SearchResult `json:"results"`
}
