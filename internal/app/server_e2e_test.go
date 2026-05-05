package app

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestHomeRedirectsAuthenticatedUserToApp(t *testing.T) {
	router, store, cfg := newTestRouter(t)
	session, err := store.CreateSession(t.Context(), store.defaultUser.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{
		Name:  "downwrite_session",
		Value: signValue(cfg.SessionSecret, session.ID),
	})

	recorder := newRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusFound {
		t.Fatalf("expected redirect, got %d", recorder.Code)
	}

	if location := recorder.Header().Get("Location"); location != "/app" {
		t.Fatalf("expected redirect to /app, got %q", location)
	}
}

func TestSignupCreatesSessionAndRedirects(t *testing.T) {
	router, _, _ := newTestRouter(t)

	req := httptest.NewRequest(http.MethodPost, "/signup", strings.NewReader(form(map[string]string{
		"name":     "Nova",
		"email":    "nova@example.com",
		"password": "supersafe",
	})))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	recorder := newRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusFound {
		t.Fatalf("expected redirect, got %d", recorder.Code)
	}

	if recorder.Header().Get("Location") != "/app" {
		t.Fatalf("expected redirect to /app")
	}

	cookies := recorder.Result().Cookies()
	if len(cookies) == 0 || cookies[0].Name != "downwrite_session" {
		t.Fatalf("expected session cookie, got %#v", cookies)
	}
}

func TestDocumentLifecycleAndShareFlow(t *testing.T) {
	router, store, cfg := newTestRouter(t)
	session, err := store.CreateSession(t.Context(), store.defaultUser.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	createReq := httptest.NewRequest(http.MethodPost, "/app/documents", strings.NewReader(form(map[string]string{
		"title":   "Roadmap",
		"content": "# V3\n\nBuild the thing.",
	})))
	createReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	createReq.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	createRecorder := newRecorder()
	router.ServeHTTP(createRecorder, createReq)

	if createRecorder.Code != http.StatusFound {
		t.Fatalf("expected document create redirect, got %d", createRecorder.Code)
	}

	location := createRecorder.Header().Get("Location")
	if !strings.HasPrefix(location, "/app/documents/doc-") {
		t.Fatalf("unexpected document redirect: %q", location)
	}

	documentID := strings.TrimPrefix(location, "/app/documents/")
	document := store.documents[documentID]
	version := store.versions[document.LatestVersionID]

	shareReq := httptest.NewRequest(http.MethodPost, "/app/documents/"+documentID+"/shares", strings.NewReader(form(map[string]string{
		"version_id":          version.ID,
		"include_annotations": "on",
	})))
	shareReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	shareReq.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	shareRecorder := newRecorder()
	router.ServeHTTP(shareRecorder, shareReq)

	if shareRecorder.Code != http.StatusOK {
		t.Fatalf("expected share success, got %d", shareRecorder.Code)
	}

	body := shareRecorder.Body.String()
	if !strings.Contains(body, "/s/token-") {
		t.Fatalf("expected share url in response, got %q", body)
	}
}

func TestCreateAnnotationAndReplyFlow(t *testing.T) {
	router, store, cfg := newTestRouter(t)
	session, err := store.CreateSession(t.Context(), store.defaultUser.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	document, version, err := store.CreateDocument(t.Context(), CreateDocumentParams{
		WorkspaceID: store.defaultWorkspace.ID,
		CreatedBy:   store.defaultUser.ID,
		Title:       "Spec",
		Slug:        "spec",
		Content:     "Alpha beta gamma",
	})
	if err != nil {
		t.Fatalf("create document: %v", err)
	}

	annotationReq := httptest.NewRequest(http.MethodPost, "/app/annotations", strings.NewReader(form(map[string]string{
		"document_id":         document.ID,
		"document_version_id": version.ID,
		"quote":               "beta",
		"comment":             "Needs discussion",
		"start_offset":        "6",
		"end_offset":          "10",
		"prefix":              "Alpha ",
		"suffix":              " gamma",
	})))
	annotationReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	annotationReq.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	annotationRecorder := newRecorder()
	router.ServeHTTP(annotationRecorder, annotationReq)

	if annotationRecorder.Code != http.StatusOK {
		t.Fatalf("expected annotation success, got %d", annotationRecorder.Code)
	}

	if !strings.Contains(annotationRecorder.Body.String(), "Needs discussion") {
		t.Fatalf("expected annotation html, got %q", annotationRecorder.Body.String())
	}

	threads := store.annotations[version.ID]
	if len(threads) != 1 {
		t.Fatalf("expected one annotation thread, got %d", len(threads))
	}

	replyReq := httptest.NewRequest(http.MethodPost, "/app/annotations/"+threads[0].Annotation.ID+"/comments", strings.NewReader(form(map[string]string{
		"body": "Agreed",
	})))
	replyReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	replyReq.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	replyRecorder := newRecorder()
	router.ServeHTTP(replyRecorder, replyReq)

	if replyRecorder.Code != http.StatusOK {
		t.Fatalf("expected reply success, got %d", replyRecorder.Code)
	}

	if !strings.Contains(replyRecorder.Body.String(), "Agreed") {
		t.Fatalf("expected reply content in html")
	}
}

func TestAPIAndMCPReadFlows(t *testing.T) {
	router, store, cfg := newTestRouter(t)
	session, err := store.CreateSession(t.Context(), store.defaultUser.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	document, version, err := store.CreateDocument(t.Context(), CreateDocumentParams{
		WorkspaceID: store.defaultWorkspace.ID,
		CreatedBy:   store.defaultUser.ID,
		Title:       "Search Notes",
		Slug:        "search-notes",
		Content:     "markdown in, context out with agent retrieval and grounding",
	})
	if err != nil {
		t.Fatalf("create document: %v", err)
	}

	if _, _, err := store.CreateDocument(t.Context(), CreateDocumentParams{
		WorkspaceID: store.defaultWorkspace.ID,
		CreatedBy:   store.defaultUser.ID,
		Title:       "Loose Notes",
		Slug:        "loose-notes",
		Content:     "context exists here too but without the agent retrieval emphasis",
	}); err != nil {
		t.Fatalf("create document: %v", err)
	}

	apiReq := httptest.NewRequest(http.MethodGet, "/v1/search?q="+url.QueryEscape("agent retrieval context"), nil)
	apiReq.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	apiRecorder := newRecorder()
	router.ServeHTTP(apiRecorder, apiReq)

	if apiRecorder.Code != http.StatusOK {
		t.Fatalf("expected api search success, got %d", apiRecorder.Code)
	}

	var searchResponse struct {
		Results []SearchResult `json:"results"`
	}
	if err := json.Unmarshal(apiRecorder.Body.Bytes(), &searchResponse); err != nil {
		t.Fatalf("unmarshal search: %v", err)
	}
	if len(searchResponse.Results) == 0 {
		t.Fatal("expected search results")
	}
	if searchResponse.Results[0].DocumentID != document.ID {
		t.Fatalf("expected most relevant document first, got %#v", searchResponse.Results[0])
	}

	mcpReq := httptest.NewRequest(http.MethodPost, "/mcp", strings.NewReader(`{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_document","arguments":{"id_or_slug":"`+document.ID+`","version":"`+version.ID+`"}}}`))
	mcpReq.Header.Set("Content-Type", "application/json")
	mcpReq.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	mcpRecorder := newRecorder()
	router.ServeHTTP(mcpRecorder, mcpReq)

	if mcpRecorder.Code != http.StatusOK {
		t.Fatalf("expected mcp success, got %d", mcpRecorder.Code)
	}

	if !strings.Contains(mcpRecorder.Body.String(), "Search Notes") {
		t.Fatalf("expected mcp body to include document title, got %q", mcpRecorder.Body.String())
	}
}

func TestWorkspaceMultipartIngestFlow(t *testing.T) {
	router, store, cfg := newTestRouter(t)
	session, err := store.CreateSession(t.Context(), store.defaultUser.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	body, contentType, err := multipartBody("notes.md", "# Notes\n\nImported from disk.")
	if err != nil {
		t.Fatalf("multipart body: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/app/ingest", body)
	req.Header.Set("Content-Type", contentType)
	req.AddCookie(&http.Cookie{Name: "downwrite_session", Value: signValue(cfg.SessionSecret, session.ID)})

	recorder := newRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected ingest success, got %d body=%q", recorder.Code, recorder.Body.String())
	}

	if !strings.Contains(recorder.Body.String(), "Imported") {
		t.Fatalf("expected ingest confirmation, got %q", recorder.Body.String())
	}

	found := false
	for _, document := range store.documents {
		if document.Title == "notes" {
			found = true
			break
		}
	}

	if !found {
		t.Fatal("expected uploaded document to be created")
	}
}
