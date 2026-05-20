package app

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
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
		Content:     "markdown in, context out",
	})
	if err != nil {
		t.Fatalf("create document: %v", err)
	}

	apiReq := httptest.NewRequest(http.MethodGet, "/v1/search?q=context", nil)
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

func TestAPIDiscoveryAndOpenAPIArePublic(t *testing.T) {
	router, _, _ := newTestRouter(t)

	discoveryReq := httptest.NewRequest(http.MethodGet, "/.well-known/downwrite", nil)
	discoveryRecorder := newRecorder()
	router.ServeHTTP(discoveryRecorder, discoveryReq)

	if discoveryRecorder.Code != http.StatusOK {
		t.Fatalf("expected discovery success, got %d", discoveryRecorder.Code)
	}

	var discovery struct {
		Name        string   `json:"name"`
		APIBase     string   `json:"api_base"`
		OpenAPIURL  string   `json:"openapi_url"`
		AuthMethods []string `json:"auth_methods"`
	}
	if err := json.Unmarshal(discoveryRecorder.Body.Bytes(), &discovery); err != nil {
		t.Fatalf("unmarshal discovery: %v", err)
	}
	if discovery.Name != "Downwrite" || discovery.APIBase != "/v1" || discovery.OpenAPIURL != "/v1/openapi.json" {
		t.Fatalf("unexpected discovery payload: %#v", discovery)
	}
	if len(discovery.AuthMethods) != 1 || discovery.AuthMethods[0] != "password" {
		t.Fatalf("unexpected auth methods: %#v", discovery.AuthMethods)
	}

	openAPIReq := httptest.NewRequest(http.MethodGet, "/v1/openapi.json", nil)
	openAPIRecorder := newRecorder()
	router.ServeHTTP(openAPIRecorder, openAPIReq)

	if openAPIRecorder.Code != http.StatusOK {
		t.Fatalf("expected openapi success, got %d", openAPIRecorder.Code)
	}

	var openAPI struct {
		Paths map[string]any `json:"paths"`
	}
	if err := json.Unmarshal(openAPIRecorder.Body.Bytes(), &openAPI); err != nil {
		t.Fatalf("unmarshal openapi: %v", err)
	}
	for _, path := range []string{"/.well-known/downwrite", "/v1/auth/login", "/v1/auth/signup", "/v1/me"} {
		if _, ok := openAPI.Paths[path]; !ok {
			t.Fatalf("expected openapi to include %s", path)
		}
	}
}

func TestAPIAuthLoginMeLogoutFlow(t *testing.T) {
	router, store, _ := newTestRouter(t)
	hash, err := bcrypt.GenerateFromPassword([]byte("supersafe"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	if _, _, err := store.CreateUserWithWorkspace(t.Context(), "Nova", "nova@example.com", string(hash)); err != nil {
		t.Fatalf("create user: %v", err)
	}

	loginReq := httptest.NewRequest(http.MethodPost, "/v1/auth/login", strings.NewReader(`{"email":"nova@example.com","password":"supersafe"}`))
	loginReq.Header.Set("Content-Type", "application/json")
	loginRecorder := newRecorder()
	router.ServeHTTP(loginRecorder, loginReq)

	if loginRecorder.Code != http.StatusOK {
		t.Fatalf("expected login success, got %d body=%q", loginRecorder.Code, loginRecorder.Body.String())
	}

	var loginResponse struct {
		Session struct {
			Token     string `json:"token"`
			ExpiresAt string `json:"expires_at"`
		} `json:"session"`
		User               User        `json:"user"`
		Workspaces         []Workspace `json:"workspaces"`
		DefaultWorkspaceID string      `json:"default_workspace_id"`
	}
	if err := json.Unmarshal(loginRecorder.Body.Bytes(), &loginResponse); err != nil {
		t.Fatalf("unmarshal login: %v", err)
	}
	if loginResponse.Session.Token == "" || loginResponse.Session.ExpiresAt == "" {
		t.Fatalf("expected session token and expiry: %#v", loginResponse.Session)
	}
	if loginResponse.User.PasswordHash != "" {
		t.Fatalf("password hash leaked in auth response")
	}
	if len(loginResponse.Workspaces) != 1 || loginResponse.DefaultWorkspaceID != loginResponse.Workspaces[0].ID {
		t.Fatalf("unexpected workspace response: %#v", loginResponse)
	}

	meReq := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
	meReq.Header.Set("Authorization", "Bearer "+loginResponse.Session.Token)
	meRecorder := newRecorder()
	router.ServeHTTP(meRecorder, meReq)

	if meRecorder.Code != http.StatusOK {
		t.Fatalf("expected me success, got %d body=%q", meRecorder.Code, meRecorder.Body.String())
	}

	logoutReq := httptest.NewRequest(http.MethodPost, "/v1/auth/logout", nil)
	logoutReq.Header.Set("Authorization", "Bearer "+loginResponse.Session.Token)
	logoutRecorder := newRecorder()
	router.ServeHTTP(logoutRecorder, logoutReq)

	if logoutRecorder.Code != http.StatusNoContent {
		t.Fatalf("expected logout success, got %d", logoutRecorder.Code)
	}

	afterLogoutReq := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
	afterLogoutReq.Header.Set("Authorization", "Bearer "+loginResponse.Session.Token)
	afterLogoutRecorder := newRecorder()
	router.ServeHTTP(afterLogoutRecorder, afterLogoutReq)

	if afterLogoutRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected token to be invalid after logout, got %d", afterLogoutRecorder.Code)
	}
}

func TestAPISignupReturnsMobileAuthPayload(t *testing.T) {
	router, _, _ := newTestRouter(t)

	req := httptest.NewRequest(http.MethodPost, "/v1/auth/signup", strings.NewReader(`{"name":"Iris","email":"iris@example.com","password":"supersafe"}`))
	req.Header.Set("Content-Type", "application/json")

	recorder := newRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected signup success, got %d body=%q", recorder.Code, recorder.Body.String())
	}

	var response struct {
		Session            apiSessionBody `json:"session"`
		User               User           `json:"user"`
		Workspaces         []Workspace    `json:"workspaces"`
		DefaultWorkspaceID string         `json:"default_workspace_id"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("unmarshal signup: %v", err)
	}
	if response.Session.Token == "" || response.User.Email != "iris@example.com" || len(response.Workspaces) != 1 {
		t.Fatalf("unexpected signup payload: %#v", response)
	}
}

func TestAPIBearerTokenStillWorksForExistingEndpoints(t *testing.T) {
	router, store, cfg := newTestRouter(t)
	session, err := store.CreateSession(t.Context(), store.defaultUser.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}
	if _, _, err := store.CreateDocument(t.Context(), CreateDocumentParams{
		WorkspaceID: store.defaultWorkspace.ID,
		CreatedBy:   store.defaultUser.ID,
		Title:       "Search Notes",
		Slug:        "search-notes",
		Content:     "markdown in, context out",
	}); err != nil {
		t.Fatalf("create document: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/v1/search?q=context", nil)
	req.Header.Set("Authorization", "Bearer "+signValue(cfg.SessionSecret, session.ID))

	recorder := newRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected bearer search success, got %d body=%q", recorder.Code, recorder.Body.String())
	}
}

func TestAPIErrorEnvelope(t *testing.T) {
	router, _, _ := newTestRouter(t)

	req := httptest.NewRequest(http.MethodGet, "/v1/me", nil)
	recorder := newRecorder()
	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized, got %d", recorder.Code)
	}

	var response struct {
		Error apiErrorBody `json:"error"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if response.Error.Code != apiErrorUnauthorized || response.Error.Message == "" {
		t.Fatalf("unexpected error envelope: %#v", response.Error)
	}
}
