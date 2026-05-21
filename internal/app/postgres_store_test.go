package app

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"
)

func TestPostgresStoreDocumentWorkflow(t *testing.T) {
	databaseURL := os.Getenv("DOWNWRITE_TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("DOWNWRITE_TEST_DATABASE_URL is not set")
	}

	ctx := context.Background()
	store, err := NewPostgresStore(ctx, databaseURL)
	if err != nil {
		t.Fatalf("create postgres store: %v", err)
	}
	t.Cleanup(store.Close)

	suffix := time.Now().UnixNano()
	user, workspace, err := store.CreateUserWithWorkspace(ctx, "CI User", fmt.Sprintf("ci-%d@example.com", suffix), "hashed-password")
	if err != nil {
		t.Fatalf("create user and workspace: %v", err)
	}

	session, err := store.CreateSession(ctx, user.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}
	if _, err := store.GetSession(ctx, session.ID); err != nil {
		t.Fatalf("get session: %v", err)
	}

	document, firstVersion, err := store.CreateDocument(ctx, CreateDocumentParams{
		WorkspaceID: workspace.ID,
		CreatedBy:   user.ID,
		Title:       fmt.Sprintf("CI Document %d", suffix),
		Slug:        fmt.Sprintf("ci-document-%d", suffix),
		Content:     "# Launch note\n\nThis is the first draft.",
		Color:       ColorSky,
		Theme:       ThemeSerif,
	})
	if err != nil {
		t.Fatalf("create document: %v", err)
	}

	secondVersion, err := store.CreateDocumentVersion(ctx, CreateVersionParams{
		DocumentID: document.ID,
		AuthoredBy: user.ID,
		Content:    "# Launch note\n\nThis is the revised draft with provenance.",
	})
	if err != nil {
		t.Fatalf("create version: %v", err)
	}
	if secondVersion.VersionNumber != 2 {
		t.Fatalf("expected second version number to be 2, got %d", secondVersion.VersionNumber)
	}

	share, err := store.CreateShare(ctx, document.ID, firstVersion.ID, user.ID, true)
	if err != nil {
		t.Fatalf("create share: %v", err)
	}
	_, _, sharedVersion, err := store.GetShare(ctx, share.Token)
	if err != nil {
		t.Fatalf("get share: %v", err)
	}
	if sharedVersion.ID != firstVersion.ID {
		t.Fatalf("expected share to point to first version, got %s", sharedVersion.ID)
	}

	annotation, err := store.CreateAnnotation(ctx, CreateAnnotationParams{
		DocumentID:        document.ID,
		DocumentVersionID: secondVersion.ID,
		AuthorID:          user.ID,
		Quote:             "revised draft",
		Comment:           "Ready for review.",
		StartOffset:       26,
		EndOffset:         39,
		Prefix:            "This is the ",
		Suffix:            " with provenance.",
	})
	if err != nil {
		t.Fatalf("create annotation: %v", err)
	}
	if _, err := store.CreateAnnotationComment(ctx, annotation.ID, user.ID, "Confirmed."); err != nil {
		t.Fatalf("create annotation comment: %v", err)
	}

	results, err := store.ListAnnotations(ctx, secondVersion.ID)
	if err != nil {
		t.Fatalf("list annotations: %v", err)
	}
	if len(results) != 1 || len(results[0].Comments) != 1 {
		t.Fatalf("expected annotation thread with one comment, got %#v", results)
	}
}
