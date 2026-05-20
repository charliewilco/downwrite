package app

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sergi/go-diff/diffmatchpatch"
	"golang.org/x/crypto/bcrypt"
)

//go:embed templates/*.html static/*
var assets embed.FS

type Server struct {
	httpServer *http.Server
	store      *PostgresStore
}

type App struct {
	config    Config
	store     Store
	templates *template.Template
}

type viewer struct {
	User       User
	Workspaces []Workspace
	Workspace  Workspace
}

func NewServer(cfg Config) (*Server, error) {
	ctx := context.Background()

	store, err := NewPostgresStore(ctx, cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	tmpl, err := newTemplates()
	if err != nil {
		store.Close()
		return nil, err
	}

	app := &App{
		config:    cfg,
		store:     store,
		templates: tmpl,
	}

	engine := app.newRouter()

	httpServer := &http.Server{
		Addr:    cfg.Addr,
		Handler: engine,
	}

	return &Server{
		httpServer: httpServer,
		store:      store,
	}, nil
}

func newTemplates() (*template.Template, error) {
	return template.New("").Funcs(template.FuncMap{
		"dict": func(values ...any) map[string]any {
			result := map[string]any{}
			for index := 0; index+1 < len(values); index += 2 {
				key, _ := values[index].(string)
				result[key] = values[index+1]
			}
			return result
		},
		"safeHTML": func(value string) template.HTML {
			return template.HTML(value)
		},
	}).ParseFS(assets, "templates/*.html")
}

func mustSubFS(dir string) http.FileSystem {
	entries, err := assets.ReadDir(dir)
	if err != nil || len(entries) == 0 {
		panic("static assets missing")
	}

	sub, err := fs.Sub(assets, dir)
	if err != nil {
		panic(err)
	}
	return http.FS(sub)
}

func (a *App) newRouter() *gin.Engine {
	engine := gin.Default()
	engine.SetHTMLTemplate(a.templates)
	engine.StaticFS("/static", mustSubFS("static"))
	a.registerRoutes(engine)
	return engine
}

func (s *Server) ListenAndServe() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	defer s.store.Close()
	return s.httpServer.Shutdown(ctx)
}

func (a *App) registerRoutes(router *gin.Engine) {
	router.GET("/", a.home)
	router.GET("/signup", a.showSignup)
	router.POST("/signup", a.signup)
	router.GET("/login", a.showLogin)
	router.POST("/login", a.login)
	router.GET("/new", a.requireAuth, a.newDocumentPage)
	router.POST("/logout", a.requireAuth, a.logout)
	router.GET("/s/:token", a.sharePage)
	router.POST("/mcp", a.mcp)

	app := router.Group("/app")
	app.Use(a.requireAuth)
	{
		app.GET("", a.workspaceHome)
		app.GET("/settings", a.workspaceSettingsPage)
		app.POST("/settings", a.updateWorkspaceSettings)
		app.GET("/stacks/:id", a.stackPage)
		app.GET("/stacks/:id/settings", a.stackSettingsPage)
		app.POST("/stacks/:id/settings", a.updateStackSettings)
		app.GET("/documents/new", a.newDocumentPage)
		app.POST("/documents", a.createDocument)
		app.POST("/ingest", a.ingestDocument)
		app.GET("/documents/:id", a.documentPage)
		app.POST("/documents/:id/versions", a.createVersion)
		app.GET("/documents/:id/diff", a.diffPage)
		app.POST("/documents/:id/shares", a.createShare)
		app.GET("/activity", a.activityPage)
		app.POST("/annotations", a.createAnnotation)
		app.POST("/annotations/:id/comments", a.createAnnotationComment)
		app.GET("/partials/documents/:id/versions/:versionID/annotations", a.annotationsPartial)
		app.GET("/partials/documents", a.documentsPartial)
	}

	api := router.Group("/v1")
	api.Use(a.apiAuth)
	{
		api.POST("/documents", a.apiCreateDocument)
		api.GET("/documents/:id", a.apiGetDocument)
		api.GET("/documents/:id/versions", a.apiListVersions)
		api.GET("/documents/:id/versions/:versionID", a.apiGetVersion)
		api.POST("/documents/:id/versions", a.apiCreateVersion)
		api.GET("/search", a.apiSearch)
		api.POST("/ingest", a.apiIngest)
		api.POST("/annotations", a.apiCreateAnnotation)
		api.GET("/documents/:id/versions/:versionID/annotations", a.apiListAnnotations)
		api.POST("/annotations/:id/comments", a.apiCreateAnnotationComment)
		api.POST("/shares", a.apiCreateShare)
		api.GET("/activity", a.apiActivity)
		api.GET("/trace/:chunkID", a.apiTraceChunk)
	}
}

func (a *App) home(c *gin.Context) {
	if _, ok := a.currentUser(c); ok {
		c.Redirect(http.StatusFound, "/app")
		return
	}

	a.renderPage(c, http.StatusOK, "home.html", gin.H{
		"Title": "Downwrite",
	})
}

func (a *App) showSignup(c *gin.Context) {
	a.renderPage(c, http.StatusOK, "auth.html", gin.H{
		"Title":  "Create account",
		"Action": "/signup",
		"Mode":   "signup",
	})
}

func (a *App) signup(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("name"))
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	if name == "" || email == "" || password == "" {
		a.renderPage(c, http.StatusBadRequest, "auth.html", gin.H{
			"Title":  "Create account",
			"Action": "/signup",
			"Mode":   "signup",
			"Error":  "Name, email, and password are required.",
		})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.String(http.StatusInternalServerError, "hash password")
		return
	}

	user, _, err := a.store.CreateUserWithWorkspace(c.Request.Context(), name, email, string(hash))
	if err != nil {
		a.renderPage(c, http.StatusBadRequest, "auth.html", gin.H{
			"Title":  "Create account",
			"Action": "/signup",
			"Mode":   "signup",
			"Error":  "Could not create account. The email may already be in use.",
		})
		return
	}

	session, err := a.store.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "create session")
		return
	}

	a.writeSessionCookie(c, session.ID)
	c.Redirect(http.StatusFound, "/app")
}

func (a *App) showLogin(c *gin.Context) {
	a.renderPage(c, http.StatusOK, "auth.html", gin.H{
		"Title":  "Login",
		"Action": "/login",
		"Mode":   "login",
	})
}

func (a *App) login(c *gin.Context) {
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	user, err := a.store.GetUserByEmail(c.Request.Context(), email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		a.renderPage(c, http.StatusUnauthorized, "auth.html", gin.H{
			"Title":  "Login",
			"Action": "/login",
			"Mode":   "login",
			"Error":  "Invalid credentials.",
		})
		return
	}

	session, err := a.store.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "create session")
		return
	}

	a.writeSessionCookie(c, session.ID)
	c.Redirect(http.StatusFound, "/app")
}

func (a *App) logout(c *gin.Context) {
	if cookie, err := c.Cookie("downwrite_session"); err == nil {
		if sessionID, ok := verifySignedValue(a.config.SessionSecret, cookie); ok {
			_ = a.store.DeleteSession(c.Request.Context(), sessionID)
		}
	}

	c.SetCookie("downwrite_session", "", -1, "/", "", false, true)
	c.Redirect(http.StatusFound, "/")
}

func (a *App) workspaceHome(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Redirect(http.StatusFound, "/login")
		return
	}

	stacks, err := a.store.ListStacks(c.Request.Context(), viewer.Workspace.ID, "")
	if err != nil {
		c.String(http.StatusInternalServerError, "list stacks")
		return
	}

	events, err := a.store.ListActivity(c.Request.Context(), viewer.Workspace.ID, 12)
	if err != nil {
		c.String(http.StatusInternalServerError, "list activity")
		return
	}

	a.renderPage(c, http.StatusOK, "workspace.html", gin.H{
		"Title":  "Workspace",
		"Viewer": viewer,
		"Stacks": stacks,
		"Events": events,
	})
}

func (a *App) documentsPartial(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	query := c.Query("q")
	stacks, err := a.store.ListStacks(c.Request.Context(), viewer.Workspace.ID, query)
	if err != nil {
		c.String(http.StatusInternalServerError, "list stacks")
		return
	}

	c.HTML(http.StatusOK, "documents_partial", gin.H{
		"Stacks": stacks,
	})
}

func (a *App) workspaceSettingsPage(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	a.renderPage(c, http.StatusOK, "workspace_settings.html", gin.H{
		"Title":  "Workspace settings",
		"Viewer": viewer,
	})
}

func (a *App) updateWorkspaceSettings(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	name := strings.TrimSpace(c.PostForm("name"))
	if name == "" {
		c.String(http.StatusBadRequest, "workspace name is required")
		return
	}

	if _, err := a.store.UpdateWorkspace(c.Request.Context(), viewer.Workspace.ID, name); err != nil {
		c.String(http.StatusInternalServerError, "update workspace")
		return
	}

	c.Redirect(http.StatusFound, "/app")
}

func (a *App) newDocumentPage(c *gin.Context) {
	viewer, _ := a.currentViewer(c)
	var stack Stack
	if stackID := strings.TrimSpace(c.Query("stack")); stackID != "" {
		stack, _ = a.store.GetStack(c.Request.Context(), viewer.Workspace.ID, stackID)
	}
	a.renderPage(c, http.StatusOK, "document_new.html", gin.H{
		"Title":  "New document",
		"Viewer": viewer,
		"Stack":  stack,
	})
}

func (a *App) createDocument(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	title := strings.TrimSpace(c.PostForm("title"))
	stackID := strings.TrimSpace(c.PostForm("stack_id"))
	stackName := strings.TrimSpace(c.PostForm("stack_name"))
	content := strings.TrimSpace(c.PostForm("content"))
	if title == "" || content == "" {
		c.String(http.StatusBadRequest, "title and content are required")
		return
	}

	document, _, err := a.store.CreateDocument(c.Request.Context(), CreateDocumentParams{
		WorkspaceID: viewer.Workspace.ID,
		CreatedBy:   viewer.User.ID,
		StackID:     stackID,
		StackName:   stackName,
		Title:       title,
		Slug:        slugify(title),
		Content:     content,
		Color:       Color(c.PostForm("theme_color")),
		Theme:       Theme(c.PostForm("theme_type")),
	})
	if err != nil {
		c.String(http.StatusInternalServerError, "create document")
		return
	}

	c.Redirect(http.StatusFound, "/app/documents/"+document.ID)
}

func (a *App) stackPage(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	stack, err := a.store.GetStack(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "stack not found")
		return
	}

	documents, err := a.store.ListStackDocuments(c.Request.Context(), viewer.Workspace.ID, stack.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "list stack documents")
		return
	}

	a.renderPage(c, http.StatusOK, "stack.html", gin.H{
		"Title":     stack.Name,
		"Viewer":    viewer,
		"Stack":     stack,
		"Documents": documents,
	})
}

func (a *App) stackSettingsPage(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	stack, err := a.store.GetStack(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "stack not found")
		return
	}

	a.renderPage(c, http.StatusOK, "stack_settings.html", gin.H{
		"Title":  stack.Name + " settings",
		"Viewer": viewer,
		"Stack":  stack,
	})
}

func (a *App) updateStackSettings(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	name := strings.TrimSpace(c.PostForm("name"))
	if name == "" {
		c.String(http.StatusBadRequest, "stack title is required")
		return
	}

	stack, err := a.store.UpdateStack(c.Request.Context(), viewer.Workspace.ID, c.Param("id"), name, c.PostForm("public") == "on")
	if err != nil {
		c.String(http.StatusInternalServerError, "update stack")
		return
	}

	c.Redirect(http.StatusFound, "/app/stacks/"+stack.ID)
}

func (a *App) ingestDocument(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.String(http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		c.String(http.StatusBadRequest, "could not read file")
		return
	}

	title := strings.TrimSpace(c.PostForm("title"))
	if title == "" {
		title = strings.TrimSuffix(header.Filename, ".md")
		title = strings.TrimSuffix(title, ".markdown")
		title = strings.TrimSuffix(title, ".txt")
	}

	document, _, _, err := a.createIngestedDocument(c.Request.Context(), viewer, ingestPayload{
		Title:      fallback(title, "Imported document"),
		Slug:       fallbackSlug(c.PostForm("slug"), title),
		Content:    string(content),
		Kind:       fallback(c.PostForm("kind"), "upload"),
		SourceName: header.Filename,
	})
	if err != nil {
		c.String(http.StatusBadRequest, "could not ingest file")
		return
	}

	c.HTML(http.StatusOK, "ingest_result", gin.H{
		"Document": document,
	})
}

func (a *App) documentPage(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "document not found")
		return
	}

	versionID := c.Query("version")
	version, err := a.resolveVersion(c.Request.Context(), document.ID, versionID)
	if err != nil {
		c.String(http.StatusNotFound, "version not found")
		return
	}

	versions, err := a.store.ListVersions(c.Request.Context(), document.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "list versions")
		return
	}

	annotations, err := a.store.ListAnnotations(c.Request.Context(), version.ID)
	if err != nil {
		c.String(http.StatusInternalServerError, "list annotations")
		return
	}

	a.renderPage(c, http.StatusOK, "document.html", gin.H{
		"Title":       document.Title,
		"Viewer":      viewer,
		"Document":    document,
		"Version":     version,
		"Versions":    versions,
		"Annotations": annotations,
		"CanShare":    true,
	})
}

func (a *App) createVersion(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "document not found")
		return
	}

	content := strings.TrimSpace(c.PostForm("content"))
	if content == "" {
		c.String(http.StatusBadRequest, "content is required")
		return
	}

	version, err := a.store.CreateDocumentVersion(c.Request.Context(), CreateVersionParams{
		DocumentID: document.ID,
		AuthoredBy: viewer.User.ID,
		Content:    content,
	})
	if err != nil {
		c.String(http.StatusInternalServerError, "create version")
		return
	}

	c.Redirect(http.StatusFound, fmt.Sprintf("/app/documents/%s?version=%s", document.ID, version.ID))
}

func (a *App) diffPage(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "document not found")
		return
	}

	versions, err := a.store.ListVersions(c.Request.Context(), document.ID)
	if err != nil || len(versions) == 0 {
		c.String(http.StatusInternalServerError, "list versions")
		return
	}

	fromID := c.Query("from")
	toID := c.Query("to")

	fromVersion, err := a.resolveVersion(c.Request.Context(), document.ID, fromID)
	if err != nil && len(versions) > 1 {
		fromVersion = versions[min(1, len(versions)-1)]
	}

	toVersion, err := a.resolveVersion(c.Request.Context(), document.ID, toID)
	if err != nil {
		toVersion = versions[0]
	}

	dmp := diffmatchpatch.New()
	diffs := dmp.DiffMain(fromVersion.ContentMarkdown, toVersion.ContentMarkdown, false)

	a.renderPage(c, http.StatusOK, "diff.html", gin.H{
		"Title":       document.Title + " diff",
		"Viewer":      viewer,
		"Document":    document,
		"FromVersion": fromVersion,
		"ToVersion":   toVersion,
		"Diffs":       diffs,
	})
}

func (a *App) createShare(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "document not found")
		return
	}

	version, err := a.resolveVersion(c.Request.Context(), document.ID, c.PostForm("version_id"))
	if err != nil {
		c.String(http.StatusBadRequest, "invalid version")
		return
	}

	share, err := a.store.CreateShare(c.Request.Context(), document.ID, version.ID, viewer.User.ID, c.PostForm("include_annotations") == "on")
	if err != nil {
		c.String(http.StatusInternalServerError, "create share")
		return
	}

	c.HTML(http.StatusOK, "share_partial", gin.H{
		"ShareURL": fmt.Sprintf("/s/%s", share.Token),
	})
}

func (a *App) sharePage(c *gin.Context) {
	share, document, version, err := a.store.GetShare(c.Request.Context(), c.Param("token"))
	if err != nil {
		c.String(http.StatusNotFound, "share not found")
		return
	}

	var annotations []AnnotationThread
	if share.IncludeAnnotations {
		annotations, _ = a.store.ListAnnotations(c.Request.Context(), version.ID)
	}

	a.renderPage(c, http.StatusOK, "share.html", gin.H{
		"Title":       document.Title,
		"Document":    document,
		"Version":     version,
		"Annotations": annotations,
		"Share":       share,
	})
}

func (a *App) createAnnotation(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	start, end := atoi(c.PostForm("start_offset")), atoi(c.PostForm("end_offset"))
	annotation, err := a.store.CreateAnnotation(c.Request.Context(), CreateAnnotationParams{
		DocumentID:        c.PostForm("document_id"),
		DocumentVersionID: c.PostForm("document_version_id"),
		AuthorID:          viewer.User.ID,
		Quote:             strings.TrimSpace(c.PostForm("quote")),
		Comment:           strings.TrimSpace(c.PostForm("comment")),
		StartOffset:       start,
		EndOffset:         end,
		Prefix:            c.PostForm("prefix"),
		Suffix:            c.PostForm("suffix"),
	})
	if err != nil {
		c.String(http.StatusBadRequest, "create annotation")
		return
	}

	c.HTML(http.StatusOK, "annotation_item", gin.H{
		"Thread": AnnotationThread{Annotation: annotation},
	})
}

func (a *App) createAnnotationComment(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	comment, err := a.store.CreateAnnotationComment(c.Request.Context(), c.Param("id"), viewer.User.ID, strings.TrimSpace(c.PostForm("body")))
	if err != nil {
		c.String(http.StatusBadRequest, "create annotation comment")
		return
	}

	c.HTML(http.StatusOK, "annotation_comment", gin.H{
		"Comment": comment,
	})
}

func (a *App) annotationsPartial(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.String(http.StatusNotFound, "document not found")
		return
	}

	annotations, err := a.store.ListAnnotations(c.Request.Context(), c.Param("versionID"))
	if err != nil {
		c.String(http.StatusInternalServerError, "list annotations")
		return
	}

	c.HTML(http.StatusOK, "annotations_partial", gin.H{
		"Document":    document,
		"Annotations": annotations,
	})
}

func (a *App) activityPage(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.Status(http.StatusUnauthorized)
		return
	}

	events, err := a.store.ListActivity(c.Request.Context(), viewer.Workspace.ID, 40)
	if err != nil {
		c.String(http.StatusInternalServerError, "list activity")
		return
	}

	a.renderPage(c, http.StatusOK, "activity.html", gin.H{
		"Title":  "Activity",
		"Viewer": viewer,
		"Events": events,
	})
}

func (a *App) apiCreateDocument(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body struct {
		Title     string `json:"title"`
		Slug      string `json:"slug"`
		Content   string `json:"content"`
		StackID   string `json:"stack_id"`
		StackName string `json:"stack_name"`
		Color     Color  `json:"theme_color"`
		Theme     Theme  `json:"theme_type"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	document, version, err := a.store.CreateDocument(c.Request.Context(), CreateDocumentParams{
		WorkspaceID: viewer.Workspace.ID,
		CreatedBy:   viewer.User.ID,
		StackID:     body.StackID,
		StackName:   body.StackName,
		Title:       body.Title,
		Slug:        fallbackSlug(body.Slug, body.Title),
		Content:     body.Content,
		Color:       body.Color,
		Theme:       body.Theme,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"document": document, "version": version})
}

func (a *App) apiGetDocument(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	versionID := c.Query("version")
	version, err := a.resolveVersion(c.Request.Context(), document.ID, versionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "version not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"document": document, "version": version})
}

func (a *App) apiListVersions(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	versions, err := a.store.ListVersions(c.Request.Context(), document.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"versions": versions})
}

func (a *App) apiGetVersion(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	version, err := a.store.GetVersion(c.Request.Context(), document.ID, c.Param("versionID"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "version not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"version": version})
}

func (a *App) apiCreateVersion(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	var body struct {
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	version, err := a.store.CreateDocumentVersion(c.Request.Context(), CreateVersionParams{
		DocumentID: document.ID,
		AuthoredBy: viewer.User.ID,
		Content:    body.Content,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"version": version})
}

func (a *App) apiSearch(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	results, err := a.hybridSearch(c.Request.Context(), viewer.Workspace.ID, c.Query("q"), c.DefaultQuery("latest_only", "true") != "false")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}

func (a *App) apiIngest(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body struct {
		Title      string `json:"title"`
		Slug       string `json:"slug"`
		Content    string `json:"content"`
		Kind       string `json:"kind"`
		SourceName string `json:"source_name"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	document, version, source, err := a.createIngestedDocument(c.Request.Context(), viewer, ingestPayload{
		Title:      body.Title,
		Slug:       body.Slug,
		Content:    body.Content,
		Kind:       body.Kind,
		SourceName: body.SourceName,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"document":      document,
		"version":       version,
		"ingest_source": source,
	})
}

func (a *App) apiCreateAnnotation(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body CreateAnnotationParams
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	body.AuthorID = viewer.User.ID
	annotation, err := a.store.CreateAnnotation(c.Request.Context(), body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"annotation": annotation})
}

func (a *App) apiListAnnotations(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	if _, err := a.store.GetVersion(c.Request.Context(), document.ID, c.Param("versionID")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "version not found"})
		return
	}

	annotations, err := a.store.ListAnnotations(c.Request.Context(), c.Param("versionID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"annotations": annotations})
}

func (a *App) apiCreateAnnotationComment(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body struct {
		Body string `json:"body"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment, err := a.store.CreateAnnotationComment(c.Request.Context(), c.Param("id"), viewer.User.ID, body.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"comment": comment})
}

func (a *App) apiCreateShare(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body struct {
		DocumentID         string `json:"document_id"`
		DocumentVersionID  string `json:"document_version_id"`
		IncludeAnnotations bool   `json:"include_annotations"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	document, err := a.store.GetDocument(c.Request.Context(), viewer.Workspace.ID, body.DocumentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	version, err := a.resolveVersion(c.Request.Context(), document.ID, body.DocumentVersionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "version not found"})
		return
	}

	share, err := a.store.CreateShare(c.Request.Context(), document.ID, version.ID, viewer.User.ID, body.IncludeAnnotations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"share": share, "url": fmt.Sprintf("/s/%s", share.Token)})
}

func (a *App) apiActivity(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	events, err := a.store.ListActivity(c.Request.Context(), viewer.Workspace.ID, 40)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"events": events})
}

func (a *App) apiTraceChunk(c *gin.Context) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	trace, err := a.store.GetChunkTrace(c.Request.Context(), c.Param("chunkID"))
	if err != nil || trace.Document.WorkspaceID != viewer.Workspace.ID {
		c.JSON(http.StatusNotFound, gin.H{"error": "chunk not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"trace": trace})
}

func (a *App) mcp(c *gin.Context) {
	type request struct {
		Method string         `json:"method"`
		ID     any            `json:"id"`
		Params map[string]any `json:"params"`
	}

	type response struct {
		JSONRPC string `json:"jsonrpc"`
		ID      any    `json:"id"`
		Result  any    `json:"result,omitempty"`
		Error   any    `json:"error,omitempty"`
	}

	var req request
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response{JSONRPC: "2.0", Error: gin.H{"message": err.Error()}})
		return
	}

	switch req.Method {
	case "initialize":
		c.JSON(http.StatusOK, response{
			JSONRPC: "2.0",
			ID:      req.ID,
			Result: gin.H{
				"serverInfo": gin.H{"name": "downwrite", "version": "3"},
				"capabilities": gin.H{
					"tools": gin.H{},
				},
			},
		})
	case "tools/list":
		tools := []gin.H{
			{"name": "search_corpus", "description": "Hybrid search over the workspace corpus"},
			{"name": "get_context", "description": "Return top ranked chunks for grounding"},
			{"name": "read_document", "description": "Read a document or specific version"},
			{"name": "list_recent", "description": "List recent documents"},
			{"name": "trace_chunk", "description": "Trace chunk provenance"},
		}
		if a.config.MCPWriteEnabled {
			tools = append(tools,
				gin.H{"name": "write_document", "description": "Create a document or version"},
				gin.H{"name": "create_annotation", "description": "Create an annotation on a quote"},
			)
		}
		c.JSON(http.StatusOK, response{JSONRPC: "2.0", ID: req.ID, Result: gin.H{"tools": tools}})
	case "tools/call":
		toolName, _ := req.Params["name"].(string)
		arguments, _ := req.Params["arguments"].(map[string]any)
		result, err := a.handleMCPTool(c, toolName, arguments)
		if err != nil {
			c.JSON(http.StatusBadRequest, response{JSONRPC: "2.0", ID: req.ID, Error: gin.H{"message": err.Error()}})
			return
		}
		c.JSON(http.StatusOK, response{JSONRPC: "2.0", ID: req.ID, Result: result})
	default:
		c.JSON(http.StatusBadRequest, response{JSONRPC: "2.0", ID: req.ID, Error: gin.H{"message": "unsupported method"}})
	}
}

func (a *App) handleMCPTool(c *gin.Context, name string, arguments map[string]any) (any, error) {
	viewer, ok := a.currentViewer(c)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	switch name {
	case "search_corpus":
		query, _ := arguments["query"].(string)
		return a.hybridSearch(c.Request.Context(), viewer.Workspace.ID, query, true)
	case "get_context":
		query, _ := arguments["query"].(string)
		k := intFromAny(arguments["k"], 5)
		results, err := a.hybridSearch(c.Request.Context(), viewer.Workspace.ID, query, true)
		if err != nil {
			return nil, err
		}
		if len(results) > k {
			results = results[:k]
		}
		return ContextResult{Query: query, Results: results}, nil
	case "read_document":
		id, _ := arguments["id_or_slug"].(string)
		versionID, _ := arguments["version"].(string)
		documents, err := a.store.ListDocuments(c.Request.Context(), viewer.Workspace.ID, "")
		if err != nil {
			return nil, err
		}

		var matched *DocumentSummary
		for index := range documents {
			if documents[index].ID == id || documents[index].Slug == id {
				matched = &documents[index]
				break
			}
		}

		if matched == nil {
			return nil, errors.New("document not found")
		}

		version, err := a.resolveVersion(c.Request.Context(), matched.ID, versionID)
		if err != nil {
			return nil, err
		}

		return gin.H{"document": matched, "version": version}, nil
	case "list_recent":
		limit := intFromAny(arguments["limit"], 10)
		return a.store.ListRecentDocuments(c.Request.Context(), viewer.Workspace.ID, limit, nil)
	case "trace_chunk":
		chunkID, _ := arguments["chunk_id"].(string)
		return a.store.GetChunkTrace(c.Request.Context(), chunkID)
	case "write_document":
		if !a.config.MCPWriteEnabled {
			return nil, errors.New("mcp writes are disabled")
		}

		title, _ := arguments["slug"].(string)
		content, _ := arguments["content"].(string)
		document, version, err := a.store.CreateDocument(c.Request.Context(), CreateDocumentParams{
			WorkspaceID: viewer.Workspace.ID,
			CreatedBy:   viewer.User.ID,
			Title:       fallback(title, "Untitled"),
			Slug:        slugify(title),
			Content:     content,
		})
		if err != nil {
			return nil, err
		}
		return gin.H{"document": document, "version": version}, nil
	case "create_annotation":
		if !a.config.MCPWriteEnabled {
			return nil, errors.New("mcp writes are disabled")
		}

		params := CreateAnnotationParams{
			DocumentID:        stringFromAny(arguments["document"]),
			DocumentVersionID: stringFromAny(arguments["version"]),
			AuthorID:          viewer.User.ID,
			Quote:             stringFromAny(arguments["quote"]),
			Comment:           stringFromAny(arguments["comment"]),
			StartOffset:       0,
			EndOffset:         len(stringFromAny(arguments["quote"])),
		}
		return a.store.CreateAnnotation(c.Request.Context(), params)
	default:
		return nil, errors.New("unknown tool")
	}
}

func (a *App) hybridSearch(ctx context.Context, workspaceID, query string, latestOnly bool) ([]SearchResult, error) {
	if strings.TrimSpace(query) == "" {
		return []SearchResult{}, nil
	}

	results, err := a.store.ListChunks(ctx, workspaceID, latestOnly)
	if err != nil {
		return nil, err
	}

	queryEmbedding := deterministicEmbedding(query)
	filtered := make([]SearchResult, 0, len(results))
	for _, result := range results {
		result.LexicalScore = lexicalScore(query, result.Snippet)
		result.SemanticScore = cosineSimilarity(queryEmbedding, deterministicEmbedding(result.Snippet))
		result.CombinedScore = (result.LexicalScore * 0.55) + (result.SemanticScore * 0.45)

		if result.CombinedScore <= 0 {
			continue
		}

		filtered = append(filtered, result)
	}

	return fuseScores(filtered), nil
}

func (a *App) requireAuth(c *gin.Context) {
	if _, ok := a.currentUser(c); !ok {
		c.Redirect(http.StatusFound, "/login")
		c.Abort()
		return
	}

	c.Next()
}

func (a *App) apiAuth(c *gin.Context) {
	if _, ok := a.currentUser(c); ok {
		c.Next()
		return
	}

	authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
	if strings.HasPrefix(authHeader, "Bearer ") {
		raw := strings.TrimPrefix(authHeader, "Bearer ")
		if sessionID, valid := verifySignedValue(a.config.SessionSecret, raw); valid {
			session, err := a.store.GetSession(c.Request.Context(), sessionID)
			if err == nil {
				user, err := a.store.GetUser(c.Request.Context(), session.UserID)
				if err == nil {
					c.Set("user", user)
					c.Next()
					return
				}
			}
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
	c.Abort()
}

func (a *App) currentUser(c *gin.Context) (User, bool) {
	if cached, ok := c.Get("user"); ok {
		user, typeOK := cached.(User)
		return user, typeOK
	}

	cookie, err := c.Cookie("downwrite_session")
	if err != nil {
		return User{}, false
	}

	sessionID, ok := verifySignedValue(a.config.SessionSecret, cookie)
	if !ok {
		return User{}, false
	}

	session, err := a.store.GetSession(c.Request.Context(), sessionID)
	if err != nil {
		return User{}, false
	}

	user, err := a.store.GetUser(c.Request.Context(), session.UserID)
	if err != nil {
		return User{}, false
	}

	c.Set("user", user)
	return user, true
}

func (a *App) currentViewer(c *gin.Context) (viewer, bool) {
	user, ok := a.currentUser(c)
	if !ok {
		return viewer{}, false
	}

	workspaces, err := a.store.ListWorkspacesForUser(c.Request.Context(), user.ID)
	if err != nil || len(workspaces) == 0 {
		return viewer{}, false
	}

	current := workspaces[0]
	if requested := c.Query("workspace"); requested != "" {
		if index := slices.IndexFunc(workspaces, func(workspace Workspace) bool { return workspace.ID == requested }); index >= 0 {
			current = workspaces[index]
		}
	}

	return viewer{
		User:       user,
		Workspaces: workspaces,
		Workspace:  current,
	}, true
}

func (a *App) writeSessionCookie(c *gin.Context, sessionID string) {
	signed := signValue(a.config.SessionSecret, sessionID)
	c.SetCookie("downwrite_session", signed, 60*60*24*30, "/", "", false, true)
}

func (a *App) resolveVersion(ctx context.Context, documentID, versionID string) (DocumentVersion, error) {
	if versionID == "" {
		return a.store.GetLatestVersion(ctx, documentID)
	}

	return a.store.GetVersion(ctx, documentID, versionID)
}

func fallback(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func fallbackSlug(value, title string) string {
	if strings.TrimSpace(value) != "" {
		return slugify(value)
	}

	return slugify(title)
}

func atoi(value string) int {
	var number int
	fmt.Sscanf(value, "%d", &number)
	return number
}

func intFromAny(value any, fallback int) int {
	switch cast := value.(type) {
	case float64:
		return int(cast)
	case int:
		return cast
	default:
		return fallback
	}
}

func stringFromAny(value any) string {
	if cast, ok := value.(string); ok {
		return cast
	}
	return ""
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func (a *App) renderPage(c *gin.Context, status int, name string, data gin.H) {
	c.HTML(status, name, data)
}

type ingestPayload struct {
	Title      string
	Slug       string
	Content    string
	Kind       string
	SourceName string
}

func (a *App) createIngestedDocument(ctx context.Context, viewer viewer, payload ingestPayload) (Document, DocumentVersion, IngestSource, error) {
	source, err := a.store.CreateIngestSource(ctx, viewer.Workspace.ID, viewer.User.ID, fallback(payload.Kind, "api"), fallback(payload.SourceName, payload.Title))
	if err != nil {
		return Document{}, DocumentVersion{}, IngestSource{}, err
	}

	document, version, err := a.store.CreateDocument(ctx, CreateDocumentParams{
		WorkspaceID: viewer.Workspace.ID,
		CreatedBy:   viewer.User.ID,
		Title:       payload.Title,
		Slug:        fallbackSlug(payload.Slug, payload.Title),
		Content:     payload.Content,
		SourceID:    &source.ID,
	})
	if err != nil {
		return Document{}, DocumentVersion{}, IngestSource{}, err
	}

	return document, version, source, nil
}
