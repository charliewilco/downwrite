import type { AuthSession } from "../auth.js";
import type { DiffLine, DiffSummary } from "../diff.js";
import type {
	ActivityEvent,
	AnnotationThread,
	Document,
	DocumentVersion,
	Workspace,
} from "../store.js";

export type Viewer = {
	user: AuthSession["user"];
	session: AuthSession["session"];
	workspace: Workspace;
	workspaces: Workspace[];
};

export function page(title: string, body: string): string {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>${escapeHTML(title)}</title>
		<link rel="stylesheet" href="/static/app.css">
		<script src="https://unpkg.com/htmx.org@2.0.4"></script>
		<script defer src="/static/app.js"></script>
	</head>
	<body>${body}</body>
</html>`;
}

export function home(): string {
	return page(
		"Downwrite",
		`<main class="marketing">
	<section class="hero">
		<p class="eyebrow">Shared document canvas</p>
		<h1>Downwrite</h1>
		<p class="lede">A calm place to collect working notes, shape them into durable documents, compare revisions, and leave context in the margins.</p>
		<div class="actions">
			<a class="button" href="/signup">Create account</a>
			<a class="button button-secondary" href="/login">Login</a>
		</div>
	</section>
</main>`,
	);
}

export function auth(mode: "login" | "signup", error = ""): string {
	const isSignup = mode === "signup";
	return page(
		isSignup ? "Create account" : "Login",
		`<main class="auth-shell">
	<section class="panel auth-panel">
		<p class="eyebrow">${isSignup ? "Create account" : "Welcome back"}</p>
		<h1>${isSignup ? "Create account" : "Login"}</h1>
		${error ? `<p class="error">${escapeHTML(error)}</p>` : ""}
		<form method="post" action="/${mode}" class="stack-form">
			${isSignup ? `<label>Name<input name="name" autocomplete="name" required></label>` : ""}
			<label>Email<input name="email" type="email" autocomplete="email" required></label>
			<label>Password<input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" required></label>
			<button class="button" type="submit">${isSignup ? "Create account" : "Login"}</button>
		</form>
	</section>
</main>`,
	);
}

export function workspace(
	viewer: Viewer,
	documents: Array<Document & { version_number: number; excerpt: string }>,
	results: unknown[],
): string {
	return page(
		"Workspace",
		`<main class="app-shell">
	${topbar(viewer, "Workspace", viewer.workspace.name)}
	<div class="canvas-board">
		<section class="workspace-intake">
			<p class="eyebrow">New canvas item</p>
			<form method="post" action="/app/documents" class="stack-form">
				<label>Title<input name="title" required></label>
				<label>Slug<input name="slug"></label>
				<label>Markdown<textarea name="content" rows="10" required></textarea></label>
				<button class="button" type="submit">Create document</button>
			</form>
		</section>
		<section class="library-index">
			<div class="section-heading-inline">
				<div>
					<p class="eyebrow">Library</p>
					<h2>Documents</h2>
				</div>
				<form method="get" action="/app"><input name="q" placeholder="Search documents"></form>
			</div>
			${documentsList(documents)}
		</section>
	</div>
	${results.length > 0 ? `<section class="workspace-feed"><h2>Search</h2><pre>${escapeHTML(JSON.stringify(results, null, 2))}</pre></section>` : ""}
</main>`,
	);
}

export function newDocument(viewer: Viewer): string {
	return page(
		"New document",
		`<main class="app-shell narrow">
	${topbar(viewer, "New document", "Create document")}
	<section class="form-sheet">
		<form method="post" action="/app/documents" class="stack-form">
			<label>Title<input name="title" required></label>
			<label>Slug<input name="slug"></label>
			<label>Markdown<textarea name="content" rows="18" required></textarea></label>
			<button class="button" type="submit">Create document</button>
		</form>
	</section>
</main>`,
	);
}

export function documentPage(
	viewer: Viewer,
	document: Document,
	version: DocumentVersion,
	versions: DocumentVersion[],
	annotations: AnnotationThread[],
): string {
	return page(
		document.title,
		`<main class="app-shell">
	${topbar(viewer, "Document", document.title, `<a href="/app/documents/${document.id}/diff?to=${version.id}">Diff</a>`)}
	<div class="document-stage">
		<aside class="document-rail document-rail-left">
			<p class="eyebrow">History</p>
			<h2>Versions</h2>
			${versions.map((item) => `<a href="/app/documents/${document.id}?version=${item.id}">v${item.version_number}</a>`).join("")}
			<form method="post" action="/app/documents/${document.id}/shares">
				<input type="hidden" name="version_id" value="${version.id}">
				<button class="button button-secondary" type="submit">Share</button>
			</form>
		</aside>
		<article class="reader-page">
			<div class="reader-panel">${version.content_html}</div>
		</article>
		<aside class="document-rail document-rail-right">
			<p class="eyebrow">Margin</p>
			<h2>Annotations</h2>
			${annotations.map(annotationThread).join("")}
			<form method="post" action="/app/annotations" class="stack-form">
				<input type="hidden" name="document_id" value="${document.id}">
				<input type="hidden" name="version_id" value="${version.id}">
				<label>Quote<input name="quote" required></label>
				<label>Comment<textarea name="comment" required></textarea></label>
				<button class="button button-secondary" type="submit">Annotate</button>
			</form>
		</aside>
	</div>
	<section class="form-sheet">
		<h2>New version</h2>
		<form method="post" action="/app/documents/${document.id}/versions" class="stack-form">
			<textarea name="content" rows="12" required>${escapeHTML(version.content_markdown)}</textarea>
			<button class="button" type="submit">Create version</button>
		</form>
	</section>
</main>`,
	);
}

export function diffPage(
	viewer: Viewer,
	document: Document,
	versions: DocumentVersion[],
	from: DocumentVersion,
	to: DocumentVersion,
	rows: DiffLine[],
	summary: DiffSummary,
): string {
	return page(
		`${document.title} diff`,
		`<main class="app-shell diff-shell">
	${topbar(viewer, "Diff", document.title, `<a href="/app/documents/${document.id}?version=${to.id}">Back to document</a>`)}
	<p class="subdued">Version ${from.version_number} to ${to.version_number} · ${summary.inserted} inserted · ${summary.deleted} deleted</p>
	<form class="diff-toolbar" method="get" action="/app/documents/${document.id}/diff">
		${versionSelect("from", versions, from.id)}
		${versionSelect("to", versions, to.id)}
		<button class="button button-secondary" type="submit">Compare</button>
	</form>
	<section class="diff-meta">
		${versionMeta("Source", from)}
		${versionMeta("Target", to)}
	</section>
	<section class="diff-panel">
		<div class="diff-header"><span>v${from.version_number}</span><span>v${to.version_number}</span></div>
		${rows.map(diffRow).join("")}
	</section>
</main>`,
	);
}

export function sharePage(
	document: Document,
	version: DocumentVersion,
	annotations: AnnotationThread[],
): string {
	return page(
		document.title,
		`<main class="shared-shell">
	<header class="topbar shell-header">
		<div class="topbar-copy"><p class="eyebrow">Shared document</p><h1>${escapeHTML(document.title)}</h1></div>
	</header>
	<article class="reader-page shared-reader"><div class="reader-panel">${version.content_html}</div></article>
	${annotations.length ? `<section class="shared-annotations">${annotations.map(annotationThread).join("")}</section>` : ""}
</main>`,
	);
}

export function activityPage(viewer: Viewer, events: ActivityEvent[]): string {
	return page(
		"Activity",
		`<main class="app-shell narrow">
	${topbar(viewer, "Activity", viewer.workspace.name)}
	<section class="activity-sheet">
		${events.map((event) => `<article><p>${escapeHTML(event.summary)}</p><time>${formatDate(event.created_at)}</time></article>`).join("") || `<p class="subdued">No activity yet.</p>`}
	</section>
</main>`,
	);
}

export function ingestResult(
	document: Document,
	version: DocumentVersion,
	source: { name: string },
): string {
	return `<section class="panel ingest-result">
		<p class="eyebrow">Ingested</p>
		<h2>${escapeHTML(document.title)}</h2>
		<p>${escapeHTML(source.name)} · version ${version.version_number}</p>
		<a href="/app/documents/${document.id}?version=${version.id}">Open document</a>
	</section>`;
}

export function documentsPartial(
	documents: Array<Document & { version_number: number; excerpt: string }>,
): string {
	return documentsList(documents);
}

export function annotationsPartial(annotations: AnnotationThread[]): string {
	return (
		annotations.map(annotationThread).join("") ||
		`<p class="subdued">No annotations yet.</p>`
	);
}

function topbar(
	viewer: Viewer,
	eyebrow: string,
	title: string,
	extraNav = "",
): string {
	return `<header class="topbar shell-header">
		<div class="topbar-copy"><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1><p class="subdued">${escapeHTML(viewer.user.name)}</p></div>
		<nav class="topnav"><a href="/app">Canvas</a><a href="/app/documents/new">New</a><a href="/app/activity">Activity</a>${extraNav}<form method="post" action="/logout"><button class="button button-secondary" type="submit">Logout</button></form></nav>
	</header>`;
}

function documentsList(
	documents: Array<Document & { version_number: number; excerpt: string }>,
): string {
	if (documents.length === 0) {
		return `<p class="subdued">No documents yet.</p>`;
	}
	return documents
		.map(
			(document) => `<article class="document-link">
		<a href="/app/documents/${document.id}"><strong>${escapeHTML(document.title)}</strong><span>v${document.version_number}</span><p>${escapeHTML(document.excerpt)}</p></a>
	</article>`,
		)
		.join("");
}

function annotationThread(thread: AnnotationThread): string {
	return `<article class="annotation-callout">
		<blockquote>${escapeHTML(thread.annotation.quote)}</blockquote>
		<p>${escapeHTML(thread.annotation.comment)}</p>
		${thread.comments.map((comment) => `<p>${escapeHTML(comment.body)}</p>`).join("")}
		<form method="post" action="/app/annotations/${thread.annotation.id}/comments">
			<input name="body" placeholder="Reply">
			<button class="button button-secondary" type="submit">Reply</button>
		</form>
	</article>`;
}

function versionSelect(
	name: string,
	versions: DocumentVersion[],
	selected: string,
): string {
	return `<label><span>${name}</span><select name="${name}">
		${versions.map((version) => `<option value="${version.id}" ${version.id === selected ? "selected" : ""}>v${version.version_number} · ${formatDate(version.created_at)}</option>`).join("")}
	</select></label>`;
}

function versionMeta(label: string, version: DocumentVersion): string {
	return `<div><p class="eyebrow">${label}</p><h2>v${version.version_number}</h2><p>${version.id}</p><p>${version.content_hash}</p></div>`;
}

function diffRow(row: DiffLine): string {
	return `<div class="diff-row diff-row-${row.kind}">
		<div class="diff-cell diff-cell-left"><span class="diff-line-number">${row.left_number ?? ""}</span><pre>${escapeHTML(row.left_text ?? "")}</pre></div>
		<div class="diff-cell diff-cell-right"><span class="diff-line-number">${row.right_number ?? ""}</span><pre>${escapeHTML(row.right_text ?? "")}</pre></div>
	</div>`;
}

function formatDate(value: Date): string {
	return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}

export function escapeHTML(value: unknown): string {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
