package app

import (
	"context"
	"errors"
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
	chunks := chunkMarkdown("alpha\n\nbeta\n\ngamma")
	if len(chunks) != 3 {
		t.Fatalf("expected 3 chunks, got %d", len(chunks))
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

func TestAuthenticatorSignupLoginAndLogout(t *testing.T) {
	store := newFakeStore()
	auth := NewAuthenticator(store, "auth-secret")

	user, session, err := auth.Signup(context.Background(), "Nova", "nova@example.com", "Supersafe1!")
	if err != nil {
		t.Fatalf("signup: %v", err)
	}
	if user.PasswordHash == "" || user.PasswordHash == "Supersafe1!" {
		t.Fatalf("expected password to be hashed, got %q", user.PasswordHash)
	}
	if session.ID == "" {
		t.Fatal("expected signup to create a session")
	}

	loggedIn, loginSession, err := auth.Login(context.Background(), "nova@example.com", "Supersafe1!")
	if err != nil {
		t.Fatalf("login: %v", err)
	}
	if loggedIn.ID != user.ID || loginSession.ID == "" {
		t.Fatalf("unexpected login result: user=%#v session=%#v", loggedIn, loginSession)
	}

	payload, ok := auth.AuthResponse(context.Background(), loggedIn, loginSession)
	if !ok {
		t.Fatal("expected auth response")
	}
	if payload.Session.Token == "" || payload.DefaultWorkspaceID == "" || len(payload.Workspaces) != 1 {
		t.Fatalf("unexpected auth payload: %#v", payload)
	}

	if err := auth.Logout(context.Background(), loginSession.ID); err != nil {
		t.Fatalf("logout: %v", err)
	}
	if _, err := store.GetSession(context.Background(), loginSession.ID); err == nil {
		t.Fatal("expected logout to delete session")
	}
}

func TestAuthenticatorRejectsInvalidPassword(t *testing.T) {
	store := newFakeStore()
	auth := NewAuthenticator(store, "auth-secret")
	if _, _, err := auth.Signup(context.Background(), "Nova", "nova@example.com", "Supersafe1!"); err != nil {
		t.Fatalf("signup: %v", err)
	}

	_, _, err := auth.Login(context.Background(), "nova@example.com", "wrong")
	if !errors.Is(err, errInvalidCredentials) {
		t.Fatalf("expected invalid credentials, got %v", err)
	}
}

func TestPasswordStandard(t *testing.T) {
	validPasswords := []string{
		"Supersafe1!",
		"n0t Bad!",
		"Åbcdef1!",
	}
	for _, password := range validPasswords {
		if !meetsPasswordStandard(password) {
			t.Fatalf("expected password %q to meet standard", password)
		}
	}

	invalidPasswords := []string{
		"Sh1!",
		"lowercase1!",
		"UPPERCASE1!",
		"NoNumber!",
		"NoSpecial1",
		"Sup3r safe",
	}
	for _, password := range invalidPasswords {
		if meetsPasswordStandard(password) {
			t.Fatalf("expected password %q to fail standard", password)
		}
	}
}

func TestAuthenticatorRejectsWeakSignupPassword(t *testing.T) {
	store := newFakeStore()
	auth := NewAuthenticator(store, "auth-secret")

	_, _, err := auth.Signup(context.Background(), "Nova", "nova@example.com", "supersafe")
	if !errors.Is(err, errWeakPassword) {
		t.Fatalf("expected weak password error, got %v", err)
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
