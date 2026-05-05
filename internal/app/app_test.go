package app

import (
	"context"
	"testing"
)

func TestDeterministicEmbeddingAndCosine(t *testing.T) {
	a := deterministicEmbedding("markdown sharing system")
	b := deterministicEmbedding("markdown sharing system")
	c := deterministicEmbedding("totally different phrase")

	if cosineSimilarity(a, b) <= cosineSimilarity(a, c) {
		t.Fatalf("expected similar text to score higher")
	}
}

func TestChunkMarkdown(t *testing.T) {
	chunks := chunkMarkdown("# alpha\n\nbeta paragraph\n\n- gamma")
	if len(chunks) != 2 {
		t.Fatalf("expected 2 chunks, got %d", len(chunks))
	}

	if chunks[1].ChunkIndex != 1 {
		t.Fatalf("expected chunk index 1, got %d", chunks[1].ChunkIndex)
	}

	if chunks[1].TokenCount == 0 {
		t.Fatal("expected token count to be populated")
	}
}

func TestRenderMarkdownProducesHTMLAndText(t *testing.T) {
	html, text, err := renderMarkdown("# Hello\n\nThis is **Downwrite**.")
	if err != nil {
		t.Fatalf("render markdown: %v", err)
	}

	if html == "" {
		t.Fatal("expected html output")
	}

	if text != "Hello This is Downwrite ." {
		t.Fatalf("unexpected text output: %q", text)
	}
}

func TestSignAndVerifyValue(t *testing.T) {
	signed := signValue("secret", "session-id")
	value, ok := verifySignedValue("secret", signed)
	if !ok {
		t.Fatal("expected signature to verify")
	}

	if value != "session-id" {
		t.Fatalf("unexpected signed value: %q", value)
	}

	if _, ok := verifySignedValue("wrong", signed); ok {
		t.Fatal("expected signature mismatch with wrong secret")
	}
}

func TestSharePointsToImmutableVersion(t *testing.T) {
	store := newFakeStore()

	document, firstVersion, err := store.CreateDocument(context.Background(), CreateDocumentParams{
		WorkspaceID: store.defaultWorkspace.ID,
		CreatedBy:   store.defaultUser.ID,
		Title:       "Design notes",
		Slug:        "design-notes",
		Content:     "first",
	})
	if err != nil {
		t.Fatalf("create document: %v", err)
	}

	if _, err := store.CreateDocumentVersion(context.Background(), CreateVersionParams{
		DocumentID: document.ID,
		AuthoredBy: store.defaultUser.ID,
		Content:    "second",
	}); err != nil {
		t.Fatalf("create version: %v", err)
	}

	share, err := store.CreateShare(context.Background(), document.ID, firstVersion.ID, store.defaultUser.ID, false)
	if err != nil {
		t.Fatalf("create share: %v", err)
	}

	_, _, version, err := store.GetShare(context.Background(), share.Token)
	if err != nil {
		t.Fatalf("get share: %v", err)
	}

	if version.ID != firstVersion.ID {
		t.Fatalf("expected share to resolve %s, got %s", firstVersion.ID, version.ID)
	}
}

func TestAnnotationPreservesExactQuoteAndOffsets(t *testing.T) {
	store := newFakeStore()

	document, version, err := store.CreateDocument(context.Background(), CreateDocumentParams{
		WorkspaceID: store.defaultWorkspace.ID,
		CreatedBy:   store.defaultUser.ID,
		Title:       "Spec",
		Slug:        "spec",
		Content:     "alpha beta gamma",
	})
	if err != nil {
		t.Fatalf("create document: %v", err)
	}

	annotation, err := store.CreateAnnotation(context.Background(), CreateAnnotationParams{
		DocumentID:        document.ID,
		DocumentVersionID: version.ID,
		AuthorID:          store.defaultUser.ID,
		Quote:             "beta",
		Comment:           "important",
		StartOffset:       6,
		EndOffset:         10,
	})
	if err != nil {
		t.Fatalf("create annotation: %v", err)
	}

	if annotation.Quote != "beta" || annotation.StartOffset != 6 || annotation.EndOffset != 10 {
		t.Fatalf("annotation did not preserve payload: %#v", annotation)
	}
}

func TestReciprocalRankFusionPrefersChunksSeenByBothRankers(t *testing.T) {
	lexical := []SearchResult{
		{ChunkID: "chunk-a", LexicalScore: 0.9, Snippet: "alpha"},
		{ChunkID: "chunk-b", LexicalScore: 0.7, Snippet: "beta"},
	}
	semantic := []SearchResult{
		{ChunkID: "chunk-b", SemanticScore: 0.95, Snippet: "beta"},
		{ChunkID: "chunk-c", SemanticScore: 0.8, Snippet: "gamma"},
	}

	results := reciprocalRankFusion(lexical, semantic, 3)
	if len(results) != 3 {
		t.Fatalf("expected 3 results, got %d", len(results))
	}

	if results[0].ChunkID != "chunk-b" {
		t.Fatalf("expected chunk-b to rank first, got %s", results[0].ChunkID)
	}

	if results[0].LexicalScore == 0 || results[0].SemanticScore == 0 {
		t.Fatalf("expected fused result to preserve both scores: %#v", results[0])
	}
}
