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
	ID           string
	Name         string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}

type Workspace struct {
	ID        string
	Name      string
	Slug      string
	CreatedBy string
	CreatedAt time.Time
}

type Membership struct {
	WorkspaceID string
	UserID      string
	Role        string
}

type Session struct {
	ID        string
	UserID    string
	CreatedAt time.Time
	ExpiresAt time.Time
}

type Document struct {
	ID              string
	WorkspaceID     string
	StackID         string
	Title           string
	Slug            string
	Status          string
	Public          bool
	CreatedBy       string
	LatestVersionID string
	StackPosition   int
	Color           Color
	Theme           Theme
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type Stack struct {
	ID          string
	WorkspaceID string
	Name        string
	Slug        string
	Public      bool
	CreatedBy   string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type DocumentVersion struct {
	ID              string
	DocumentID      string
	VersionNumber   int
	ContentMarkdown string
	ContentHTML     string
	ContentText     string
	ContentHash     string
	AuthoredBy      string
	IngestSourceID  *string
	CreatedAt       time.Time
}

type DocumentSummary struct {
	Document
	VersionNumber int
	Excerpt       string
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
	ID                 string
	DocumentID         string
	DocumentVersionID  string
	Token              string
	IncludeAnnotations bool
	CreatedBy          string
	CreatedAt          time.Time
}

type Annotation struct {
	ID                string
	DocumentID        string
	DocumentVersionID string
	AuthorID          string
	Quote             string
	Comment           string
	StartOffset       int
	EndOffset         int
	Prefix            string
	Suffix            string
	CreatedAt         time.Time
}

type AnnotationComment struct {
	ID           string
	AnnotationID string
	AuthorID     string
	Body         string
	CreatedAt    time.Time
}

type AnnotationThread struct {
	Annotation Annotation
	Comments   []AnnotationComment
}

type ActivityEvent struct {
	ID          string
	WorkspaceID string
	DocumentID  *string
	ActorID     *string
	EventType   string
	Summary     string
	CreatedAt   time.Time
}

type IngestSource struct {
	ID          string
	WorkspaceID string
	Kind        string
	Name        string
	CreatedBy   string
	CreatedAt   time.Time
}

type Chunk struct {
	ID                string
	DocumentID        string
	DocumentVersionID string
	Content           string
	SearchText        string
	Embedding         []float64
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
