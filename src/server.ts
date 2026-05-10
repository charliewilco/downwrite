import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { compare, hash } from "bcryptjs";
import { Context, Hono, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { buildTextDiff } from "./diff.js";
import { loadConfig } from "./config.js";
import { signValue, slugify, verifySignedValue } from "./security.js";
import {
	createAnnotation,
	createAnnotationComment,
	createDocument,
	createDocumentVersion,
	createIngestSource,
	createSession,
	createShare,
	createUserWithWorkspace,
	deleteSession,
	Document,
	DocumentVersion,
	getDocument,
	getLatestVersion,
	getSession,
	getShare,
	getTrace,
	getUser,
	getUserByEmail,
	getVersion,
	hybridSearch,
	listActivity,
	listAnnotations,
	listDocuments,
	listVersions,
	listWorkspacesForUser,
	prisma,
	User,
	Workspace,
} from "./store.js";
import * as view from "./views/html.js";

type Variables = {
	user: User;
	viewer: view.Viewer;
};

const config = loadConfig();
const app = new Hono<{ Variables: Variables }>();

app.use("/static/*", serveStatic({ root: "./src" }));

app.get("/", async (c) => {
	const user = await currentUser(c);
	if (user) {
		return c.redirect("/app");
	}
	return c.html(view.home());
});

app.get("/signup", (c) => c.html(view.auth("signup")));
app.post("/signup", async (c) => {
	const body = await c.req.parseBody();
	const name = stringField(body.name);
	const email = stringField(body.email);
	const password = stringField(body.password);
	if (!name || !email || !password) {
		return c.html(view.auth("signup", "Name, email, and password are required."), 400);
	}

	try {
		const result = await createUserWithWorkspace(name, email, await hash(password, 12));
		const session = await createSession(result.user.id);
		writeSessionCookie(c, session.id);
		return c.redirect("/app");
	} catch {
		return c.html(view.auth("signup", "Could not create account. The email may already be in use."), 400);
	}
});

app.get("/login", (c) => c.html(view.auth("login")));
app.post("/login", async (c) => {
	const body = await c.req.parseBody();
	const email = stringField(body.email);
	const password = stringField(body.password);
	const user = email ? await getUserByEmail(email) : null;

	if (!user || !(await compare(password, user.password_hash))) {
		return c.html(view.auth("login", "Invalid credentials."), 401);
	}

	const session = await createSession(user.id);
	writeSessionCookie(c, session.id);
	return c.redirect("/app");
});

app.post("/logout", requireAuth, async (c) => {
	const sessionID = sessionIDFromCookie(c);
	if (sessionID) {
		await deleteSession(sessionID);
	}
	deleteCookie(c, "downwrite_session", { path: "/" });
	return c.redirect("/");
});

app.get("/s/:token", async (c) => {
	const share = await getShare(c.req.param("token"));
	if (!share) {
		return c.text("share not found", 404);
	}
	const annotations = (share.share as { include_annotations?: boolean }).include_annotations
		? await listAnnotations((share.version as DocumentVersion).id)
		: [];
	return c.html(view.sharePage(share.document as Document, share.version as DocumentVersion, annotations));
});

app.post("/mcp", async (c) => {
	const viewer = await currentViewer(c);
	if (!viewer) {
		return c.json({ error: "unauthorized" }, 401);
	}
	const payload = await c.req.json().catch(() => ({}));
	const method = typeof payload.method === "string" ? payload.method : "";
	if (method === "tools/list") {
		return c.json({ tools: toolsList() });
	}
	if (method !== "tools/call") {
		return c.json({ error: "unsupported method" }, 400);
	}

	const name = payload.params?.name;
	const args = payload.params?.arguments ?? {};
	const result = await handleTool(viewer, name, args).catch((error: unknown) => ({ error: error instanceof Error ? error.message : "tool failed" }));
	return c.json({ result });
});

const appRoutes = new Hono<{ Variables: Variables }>();
appRoutes.use("*", requireAuth);
appRoutes.get("/", async (c) => {
	const viewer = c.get("viewer");
	const query = c.req.query("q") ?? "";
	const documents = await listDocuments(viewer.workspace.id, query);
	const results = query ? await hybridSearch(viewer.workspace.id, query, true) : [];
	return c.html(view.workspace(viewer, documents, results));
});
appRoutes.get("/documents/new", (c) => c.html(view.newDocument(c.get("viewer"))));
appRoutes.post("/documents", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.parseBody();
	const title = stringField(body.title) || "Untitled";
	const document = await createDocument({
		workspaceID: viewer.workspace.id,
		createdBy: viewer.user.id,
		title,
		slug: stringField(body.slug) ? slugify(stringField(body.slug)) : slugify(title),
		content: stringField(body.content),
	});
	return c.redirect(`/app/documents/${document.document.id}?version=${document.version.id}`);
});
appRoutes.post("/ingest", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.parseBody();
	const title = stringField(body.title) || "Untitled";
	const source = await createIngestSource(viewer.workspace.id, viewer.user.id, stringField(body.kind) || "form", stringField(body.source_name) || title);
	const result = await createDocument({
		workspaceID: viewer.workspace.id,
		createdBy: viewer.user.id,
		title,
		slug: stringField(body.slug) ? slugify(stringField(body.slug)) : slugify(title),
		content: stringField(body.content),
		sourceID: source.id,
	});
	return c.html(view.ingestResult(result.document, result.version, source));
});
appRoutes.get("/documents/:id", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.text("document not found", 404);
	}
	const version = await resolveVersion(document.id, c.req.query("version"));
	if (!version) {
		return c.text("version not found", 404);
	}
	const [versions, annotations] = await Promise.all([listVersions(document.id), listAnnotations(version.id)]);
	return c.html(view.documentPage(viewer, document, version, versions, annotations));
});
appRoutes.post("/documents/:id/versions", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.text("document not found", 404);
	}
	const body = await c.req.parseBody();
	const version = await createDocumentVersion({ documentID: document.id, authoredBy: viewer.user.id, content: stringField(body.content) });
	return c.redirect(`/app/documents/${document.id}?version=${version.id}`);
});
appRoutes.get("/documents/:id/diff", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.text("document not found", 404);
	}
	const versions = await listVersions(document.id);
	const [from, to] = resolveDiffVersions(versions, c.req.query("from"), c.req.query("to"));
	const diff = buildTextDiff(from.content_markdown, to.content_markdown);
	return c.html(view.diffPage(viewer, document, versions, from, to, diff.rows, diff.summary));
});
appRoutes.post("/documents/:id/shares", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.text("document not found", 404);
	}
	const body = await c.req.parseBody();
	const version = await resolveVersion(document.id, stringField(body.version_id));
	if (!version) {
		return c.text("invalid version", 400);
	}
	const share = await createShare(document.id, version.id, viewer.user.id, Boolean(body.include_annotations));
	return c.html(`<section class="share-box"><code>/s/${share.token}</code><a href="/s/${share.token}">Open share</a></section>`);
});
appRoutes.get("/activity", async (c) => c.html(view.activityPage(c.get("viewer"), await listActivity(c.get("viewer").workspace.id, 40))));
appRoutes.post("/annotations", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.parseBody();
	await createAnnotation({
		documentID: stringField(body.document_id),
		versionID: stringField(body.version_id),
		authorID: viewer.user.id,
		quote: stringField(body.quote),
		comment: stringField(body.comment),
		startOffset: 0,
		endOffset: stringField(body.quote).length,
	});
	return c.redirect(`/app/documents/${stringField(body.document_id)}?version=${stringField(body.version_id)}`);
});
appRoutes.post("/annotations/:id/comments", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.parseBody();
	await createAnnotationComment(c.req.param("id"), viewer.user.id, stringField(body.body));
	return c.redirect(c.req.header("referer") ?? "/app");
});
appRoutes.get("/partials/documents/:id/versions/:versionID/annotations", async (c) => {
	return c.html(view.annotationsPartial(await listAnnotations(c.req.param("versionID"))));
});
appRoutes.get("/partials/documents", async (c) => {
	const viewer = c.get("viewer");
	return c.html(view.documentsPartial(await listDocuments(viewer.workspace.id, c.req.query("q") ?? "")));
});

app.route("/app", appRoutes);

const apiRoutes = new Hono<{ Variables: Variables }>();
apiRoutes.use("*", apiAuth);
apiRoutes.post("/documents", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.json();
	const result = await createDocument({
		workspaceID: viewer.workspace.id,
		createdBy: viewer.user.id,
		title: body.title ?? "Untitled",
		slug: body.slug ? slugify(body.slug) : slugify(body.title ?? "Untitled"),
		content: body.content ?? "",
	});
	return c.json(result, 201);
});
apiRoutes.get("/documents/:id", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.json({ error: "document not found" }, 404);
	}
	return c.json({ document, version: await resolveVersion(document.id, c.req.query("version")) });
});
apiRoutes.get("/documents/:id/versions", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.json({ error: "document not found" }, 404);
	}
	return c.json({ versions: await listVersions(document.id) });
});
apiRoutes.get("/documents/:id/versions/:versionID", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.json({ error: "document not found" }, 404);
	}
	return c.json({ version: await getVersionOr404(document.id, c.req.param("versionID")) });
});
apiRoutes.get("/documents/:id/diff", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.json({ error: "document not found" }, 404);
	}
	const versions = await listVersions(document.id);
	const [from, to] = resolveDiffVersions(versions, c.req.query("from"), c.req.query("to"));
	const diff = buildTextDiff(from.content_markdown, to.content_markdown);
	return c.json({ document, from_version: from, to_version: to, summary: diff.summary, rows: diff.rows });
});
apiRoutes.post("/documents/:id/versions", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.json({ error: "document not found" }, 404);
	}
	const body = await c.req.json();
	return c.json({ version: await createDocumentVersion({ documentID: document.id, authoredBy: viewer.user.id, content: body.content ?? "" }) }, 201);
});
apiRoutes.get("/search", async (c) => c.json({ query: c.req.query("q") ?? "", results: await hybridSearch(c.get("viewer").workspace.id, c.req.query("q") ?? "", c.req.query("latest") !== "false") }));
apiRoutes.post("/ingest", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.json();
	const source = await createIngestSource(viewer.workspace.id, viewer.user.id, body.kind ?? "api", body.source_name ?? body.title ?? "Untitled");
	const result = await createDocument({
		workspaceID: viewer.workspace.id,
		createdBy: viewer.user.id,
		title: body.title ?? "Untitled",
		slug: body.slug ? slugify(body.slug) : slugify(body.title ?? "Untitled"),
		content: body.content ?? "",
		sourceID: source.id,
	});
	return c.json({ ...result, source }, 201);
});
apiRoutes.post("/annotations", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.json();
	return c.json({ annotation: await createAnnotation({
		documentID: body.document_id,
		versionID: body.version_id,
		authorID: viewer.user.id,
		quote: body.quote ?? "",
		comment: body.comment ?? "",
		startOffset: body.start_offset ?? 0,
		endOffset: body.end_offset ?? String(body.quote ?? "").length,
		prefix: body.prefix ?? "",
		suffix: body.suffix ?? "",
	}) }, 201);
});
apiRoutes.get("/documents/:id/versions/:versionID/annotations", async (c) => {
	const viewer = c.get("viewer");
	const document = await getDocument(viewer.workspace.id, c.req.param("id"));
	if (!document) {
		return c.json({ error: "document not found" }, 404);
	}
	const version = await getVersionOr404(document.id, c.req.param("versionID"));
	if (!version) {
		return c.json({ error: "version not found" }, 404);
	}
	return c.json({ annotations: await listAnnotations(version.id) });
});
apiRoutes.post("/annotations/:id/comments", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.json();
	return c.json({ comment: await createAnnotationComment(c.req.param("id"), viewer.user.id, body.body ?? "") }, 201);
});
apiRoutes.post("/shares", async (c) => {
	const viewer = c.get("viewer");
	const body = await c.req.json();
	return c.json({ share: await createShare(body.document_id, body.version_id, viewer.user.id, Boolean(body.include_annotations)) }, 201);
});
apiRoutes.get("/activity", async (c) => c.json({ events: await listActivity(c.get("viewer").workspace.id, Number.parseInt(c.req.query("limit") ?? "20", 10)) }));
apiRoutes.get("/trace/:chunkID", async (c) => c.json({ trace: await getTrace(c.req.param("chunkID")) }));

app.route("/v1", apiRoutes);

async function requireAuth(c: Context<{ Variables: Variables }>, next: Next) {
	const viewer = await currentViewer(c);
	if (!viewer) {
		return c.redirect("/login");
	}
	c.set("user", viewer.user);
	c.set("viewer", viewer);
	await next();
}

async function apiAuth(c: Context<{ Variables: Variables }>, next: Next) {
	const viewer = await currentViewer(c);
	if (!viewer) {
		return c.json({ error: "unauthorized" }, 401);
	}
	c.set("user", viewer.user);
	c.set("viewer", viewer);
	await next();
}

async function currentViewer(c: Context | { req: { header: (name: string) => string | undefined } }): Promise<view.Viewer | null> {
	const user = await currentUser(c);
	if (!user) {
		return null;
	}
	const workspaces = await listWorkspacesForUser(user.id);
	const workspace = workspaces[0];
	if (!workspace) {
		return null;
	}
	return { user, workspaces, workspace };
}

async function currentUser(c: Context | { req: { header: (name: string) => string | undefined } }): Promise<User | null> {
	const sessionID = sessionIDFromCookie(c);
	if (!sessionID) {
		return null;
	}
	const session = await getSession(sessionID);
	return session ? getUser(session.user_id) : null;
}

function sessionIDFromCookie(c: Context | { req: { header: (name: string) => string | undefined } }): string | null {
	const signed = getCookie(c as Context, "downwrite_session");
	return signed ? verifySignedValue(config.sessionSecret, signed) : null;
}

function writeSessionCookie(c: Context, sessionID: string): void {
	setCookie(c, "downwrite_session", signValue(config.sessionSecret, sessionID), {
		path: "/",
		httpOnly: true,
		sameSite: "Lax",
		maxAge: 60 * 60 * 24 * 30,
	});
}

function resolveDiffVersions(versions: DocumentVersion[], fromID?: string, toID?: string): [DocumentVersion, DocumentVersion] {
	const toIndex = Math.max(versions.findIndex((version) => version.id === toID), 0);
	const fallbackFrom = Math.min(toIndex + 1, versions.length - 1);
	const fromIndex = fromID ? Math.max(versions.findIndex((version) => version.id === fromID), fallbackFrom) : fallbackFrom;
	return [versions[fromIndex], versions[toIndex]];
}

async function resolveVersion(documentID: string, versionID?: string): Promise<DocumentVersion | null> {
	return versionID ? getVersionOr404(documentID, versionID) : getLatestVersion(documentID);
}

async function getVersionOr404(documentID: string, versionID: string): Promise<DocumentVersion | null> {
	return getVersion(documentID, versionID);
}

function stringField(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function toolsList() {
	return [
		{ name: "search", description: "Search workspace documents" },
		{ name: "get_document", description: "Read a document version" },
		{ name: "list_recent", description: "List recent documents" },
		{ name: "trace_chunk", description: "Inspect retrieval provenance for a chunk" },
		{ name: "write_document", description: "Create a document when writes are enabled" },
		{ name: "create_annotation", description: "Create an annotation when writes are enabled" },
	];
}

async function handleTool(viewer: view.Viewer, name: string, args: Record<string, unknown>) {
	switch (name) {
		case "search":
			return hybridSearch(viewer.workspace.id, stringField(args.query), args.latest_only !== false);
		case "list_recent":
			return listDocuments(viewer.workspace.id, "");
		case "trace_chunk":
			return getTrace(stringField(args.chunk_id));
		case "write_document": {
			if (!config.mcpWriteEnabled) {
				throw new Error("mcp writes are disabled");
			}
			return createDocument({
				workspaceID: viewer.workspace.id,
				createdBy: viewer.user.id,
				title: stringField(args.title) || "Untitled",
				slug: slugify(stringField(args.slug) || stringField(args.title) || "Untitled"),
				content: stringField(args.content),
			});
		}
		default:
			throw new Error("unknown tool");
	}
}

serve({ fetch: app.fetch, port: config.port }, (info) => {
	console.log(`Downwrite Hono listening on http://127.0.0.1:${info.port}`);
});

process.on("SIGTERM", () => {
	void prisma.$disconnect().finally(() => process.exit(0));
});
