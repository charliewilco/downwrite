import type { PrismaClient } from "@prisma/client";
import { prisma } from "./db.js";
import { renderMarkdown } from "./markdown.js";
import {
	chunkMarkdown,
	deterministicEmbedding,
	parseVectorLiteral,
	rankSemanticResults,
	reciprocalRankFusion,
	type SearchResult,
	searchTextForChunk,
	snippetForResult,
	vectorLiteral,
} from "./search.js";
import { randomToken, slugify } from "./security.js";

export type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type Workspace = {
	id: string;
	name: string;
	slug: string;
	created_by: string;
	created_at: Date;
};

export type Document = {
	id: string;
	workspace_id: string;
	title: string;
	slug: string;
	status: string;
	created_by: string;
	latest_version_id: string;
	created_at: Date;
	updated_at: Date;
};

export type DocumentVersion = {
	id: string;
	document_id: string;
	version_number: number;
	content_markdown: string;
	content_html: string;
	content_text: string;
	content_hash: string;
	authored_by: string;
	ingest_source_id: string | null;
	created_at: Date;
};

export type Annotation = {
	id: string;
	document_id: string;
	document_version_id: string;
	author_id: string;
	quote: string;
	comment: string;
	start_offset: number;
	end_offset: number;
	prefix_text: string;
	suffix_text: string;
	created_at: Date;
};

export type AnnotationComment = {
	id: string;
	annotation_id: string;
	author_id: string;
	body: string;
	created_at: Date;
};

export type AnnotationThread = {
	annotation: Annotation;
	comments: AnnotationComment[];
};

export type IngestSource = {
	id: string;
	workspace_id: string;
	kind: string;
	name: string;
	created_by: string;
	created_at: Date;
};

export type ActivityEvent = {
	id: string;
	workspace_id: string;
	document_id: string | null;
	actor_id: string | null;
	event_type: string;
	summary: string;
	created_at: Date;
};

type Queryable = Omit<
	PrismaClient,
	"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function ensureWorkspaceForUser(user: {
	id: string;
	name: string;
}) {
	return prisma.$transaction(async (tx) => {
		const existing = await tx.$queryRaw<Workspace[]>`
			select w.id::text, w.name, w.slug, w.created_by::text, w.created_at
			from workspaces w
			join workspace_memberships m on m.workspace_id = w.id
			where m.user_id = ${user.id}::uuid
			order by w.created_at asc
			limit 1
		`;
		if (existing[0]) {
			return existing[0];
		}

		const workspace = await one<Workspace>(tx.$queryRaw`
			insert into workspaces (name, slug, created_by)
			values (${`${user.name} workspace`}, ${slugify(user.name)}, ${user.id}::uuid)
			returning id::text, name, slug, created_by::text, created_at
		`);
		await tx.$executeRaw`
			insert into workspace_memberships (workspace_id, user_id, role)
			values (${workspace.id}::uuid, ${user.id}::uuid, 'owner')
		`;
		return workspace;
	});
}

export async function listWorkspacesForUser(
	userID: string,
): Promise<Workspace[]> {
	return prisma.$queryRaw`
		select w.id::text, w.name, w.slug, w.created_by::text, w.created_at
		from workspaces w
		join workspace_memberships m on m.workspace_id = w.id
		where m.user_id = ${userID}::uuid
		order by w.created_at asc
	`;
}

export async function createDocument(params: {
	workspaceID: string;
	createdBy: string;
	title: string;
	slug: string;
	content: string;
	sourceID?: string | null;
}) {
	const rendered = renderMarkdown(params.content);
	return prisma.$transaction(async (tx) => {
		const document = await one<Document>(tx.$queryRaw`
			insert into documents (workspace_id, title, slug, status, created_by)
			values (${params.workspaceID}::uuid, ${params.title}, ${params.slug}, 'active', ${params.createdBy}::uuid)
			returning id::text, workspace_id::text, title, slug, status, created_by::text, coalesce(latest_version_id::text, '') as latest_version_id, created_at, updated_at
		`);
		const version = await one<DocumentVersion>(tx.$queryRaw`
			insert into document_versions (
				document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id
			)
			values (${document.id}::uuid, 1, ${params.content}, ${rendered.html}, ${rendered.text}, encode(digest(${params.content}, 'sha256'), 'hex'), ${params.createdBy}::uuid, ${params.sourceID ?? null}::uuid)
			returning id::text, document_id::text, version_number, content_markdown, content_html, content_text, content_hash, authored_by::text, ingest_source_id::text, created_at
		`);
		await tx.$executeRaw`update documents set latest_version_id = ${version.id}::uuid, updated_at = now() where id = ${document.id}::uuid`;
		await recordActivity(
			tx,
			document.workspace_id,
			document.id,
			params.createdBy,
			"document.created",
			`Created ${document.title}`,
		);
		await replaceChunks(tx, document.id, version.id, params.content);
		return {
			document: { ...document, latest_version_id: version.id },
			version,
		};
	});
}

export async function createDocumentVersion(params: {
	documentID: string;
	authoredBy: string;
	content: string;
	sourceID?: string | null;
}): Promise<DocumentVersion> {
	const rendered = renderMarkdown(params.content);
	return prisma.$transaction(async (tx) => {
		const meta = await one<{
			workspace_id: string;
			title: string;
			version_number: number;
		}>(tx.$queryRaw`
			select d.workspace_id::text, d.title, coalesce(max(v.version_number), 0) + 1 as version_number
			from documents d
			left join document_versions v on v.document_id = d.id
			where d.id = ${params.documentID}::uuid
			group by d.workspace_id, d.title
		`);
		const version = await one<DocumentVersion>(tx.$queryRaw`
			insert into document_versions (
				document_id, version_number, content_markdown, content_html, content_text, content_hash, authored_by, ingest_source_id
			)
			values (${params.documentID}::uuid, ${meta.version_number}, ${params.content}, ${rendered.html}, ${rendered.text}, encode(digest(${params.content}, 'sha256'), 'hex'), ${params.authoredBy}::uuid, ${params.sourceID ?? null}::uuid)
			returning id::text, document_id::text, version_number, content_markdown, content_html, content_text, content_hash, authored_by::text, ingest_source_id::text, created_at
		`);
		await tx.$executeRaw`update documents set latest_version_id = ${version.id}::uuid, updated_at = now() where id = ${params.documentID}::uuid`;
		await recordActivity(
			tx,
			meta.workspace_id,
			params.documentID,
			params.authoredBy,
			"document.version_created",
			`Created version ${version.version_number} for ${meta.title}`,
		);
		await replaceChunks(tx, params.documentID, version.id, params.content);
		return version;
	});
}

export async function listDocuments(workspaceID: string, query = "") {
	const pattern = query.trim() === "" ? "%" : `%${query.toLowerCase()}%`;
	return prisma.$queryRaw<
		Array<Document & { version_number: number; excerpt: string }>
	>`
		select d.id::text, d.workspace_id::text, d.title, d.slug, d.status, d.created_by::text, coalesce(d.latest_version_id::text, '') as latest_version_id, d.created_at, d.updated_at,
			v.version_number, left(v.content_text, 180) as excerpt
		from documents d
		join document_versions v on v.id = d.latest_version_id
		where d.workspace_id = ${workspaceID}::uuid and (${pattern} = '%' or lower(d.title) like ${pattern} or lower(v.content_text) like ${pattern})
		order by d.updated_at desc
	`;
}

export async function getDocument(
	workspaceID: string,
	documentID: string,
): Promise<Document | null> {
	return maybeOne(prisma.$queryRaw`
		select id::text, workspace_id::text, title, slug, status, created_by::text, coalesce(latest_version_id::text, '') as latest_version_id, created_at, updated_at
		from documents
		where id = ${documentID}::uuid and workspace_id = ${workspaceID}::uuid
	`);
}

export async function getVersion(
	documentID: string,
	versionID: string,
): Promise<DocumentVersion | null> {
	return maybeOne(prisma.$queryRaw`
		select id::text, document_id::text, version_number, content_markdown, content_html, content_text, content_hash, authored_by::text, ingest_source_id::text, created_at
		from document_versions
		where id = ${versionID}::uuid and document_id = ${documentID}::uuid
	`);
}

export async function getLatestVersion(
	documentID: string,
): Promise<DocumentVersion | null> {
	return maybeOne(prisma.$queryRaw`
		select v.id::text, v.document_id::text, v.version_number, v.content_markdown, v.content_html, v.content_text, v.content_hash, v.authored_by::text, v.ingest_source_id::text, v.created_at
		from document_versions v
		join documents d on d.latest_version_id = v.id
		where d.id = ${documentID}::uuid
	`);
}

export async function listVersions(
	documentID: string,
): Promise<DocumentVersion[]> {
	return prisma.$queryRaw`
		select id::text, document_id::text, version_number, content_markdown, content_html, content_text, content_hash, authored_by::text, ingest_source_id::text, created_at
		from document_versions
		where document_id = ${documentID}::uuid
		order by version_number desc
	`;
}

export async function createShare(
	documentID: string,
	versionID: string,
	createdBy: string,
	includeAnnotations: boolean,
) {
	const token = randomToken(14);
	const share = await one<{
		id: string;
		document_id: string;
		document_version_id: string;
		token: string;
		include_annotations: boolean;
		created_by: string;
		created_at: Date;
	}>(prisma.$queryRaw`
		insert into document_shares (document_id, document_version_id, token, include_annotations, created_by)
		values (${documentID}::uuid, ${versionID}::uuid, ${token}, ${includeAnnotations}, ${createdBy}::uuid)
		returning id::text, document_id::text, document_version_id::text, token, include_annotations, created_by::text, created_at
	`);
	return share;
}

export async function getShare(token: string) {
	const rows = await prisma.$queryRaw<
		Array<{ share: unknown; document: unknown; version: unknown }>
	>`
		select
			json_build_object('id', s.id::text, 'document_id', s.document_id::text, 'document_version_id', s.document_version_id::text, 'token', s.token, 'include_annotations', s.include_annotations, 'created_by', s.created_by::text, 'created_at', s.created_at) as share,
			json_build_object('id', d.id::text, 'workspace_id', d.workspace_id::text, 'title', d.title, 'slug', d.slug, 'status', d.status, 'created_by', d.created_by::text, 'latest_version_id', coalesce(d.latest_version_id::text, ''), 'created_at', d.created_at, 'updated_at', d.updated_at) as document,
			json_build_object('id', v.id::text, 'document_id', v.document_id::text, 'version_number', v.version_number, 'content_markdown', v.content_markdown, 'content_html', v.content_html, 'content_text', v.content_text, 'content_hash', v.content_hash, 'authored_by', v.authored_by::text, 'ingest_source_id', v.ingest_source_id::text, 'created_at', v.created_at) as version
		from document_shares s
		join documents d on d.id = s.document_id
		join document_versions v on v.id = s.document_version_id
		where s.token = ${token}
	`;
	return rows[0] ?? null;
}

export async function createAnnotation(params: {
	documentID: string;
	versionID: string;
	authorID: string;
	quote: string;
	comment: string;
	startOffset: number;
	endOffset: number;
	prefix?: string;
	suffix?: string;
}): Promise<Annotation> {
	return one(prisma.$queryRaw`
		insert into annotations (
			document_id, document_version_id, author_id, quote, comment, start_offset, end_offset, prefix_text, suffix_text
		)
		values (${params.documentID}::uuid, ${params.versionID}::uuid, ${params.authorID}::uuid, ${params.quote}, ${params.comment}, ${params.startOffset}, ${params.endOffset}, ${params.prefix ?? ""}, ${params.suffix ?? ""})
		returning id::text, document_id::text, document_version_id::text, author_id::text, quote, comment, start_offset, end_offset, prefix_text, suffix_text, created_at
	`);
}

export async function listAnnotations(
	versionID: string,
): Promise<AnnotationThread[]> {
	const annotations = await prisma.$queryRaw<Annotation[]>`
		select id::text, document_id::text, document_version_id::text, author_id::text, quote, comment, start_offset, end_offset, prefix_text, suffix_text, created_at
		from annotations
		where document_version_id = ${versionID}::uuid
		order by created_at asc
	`;
	return Promise.all(
		annotations.map(async (annotation) => ({
			annotation,
			comments: await prisma.$queryRaw`
			select id::text, annotation_id::text, author_id::text, body, created_at
			from annotation_comments
			where annotation_id = ${annotation.id}::uuid
			order by created_at asc
		`,
		})),
	);
}

export async function createAnnotationComment(
	annotationID: string,
	authorID: string,
	body: string,
): Promise<AnnotationComment> {
	return one(prisma.$queryRaw`
		insert into annotation_comments (annotation_id, author_id, body)
		values (${annotationID}::uuid, ${authorID}::uuid, ${body})
		returning id::text, annotation_id::text, author_id::text, body, created_at
	`);
}

export async function listActivity(
	workspaceID: string,
	limit = 20,
): Promise<ActivityEvent[]> {
	return prisma.$queryRaw`
		select id::text, workspace_id::text, document_id::text, actor_id::text, event_type, summary, created_at
		from activity_events
		where workspace_id = ${workspaceID}::uuid
		order by created_at desc
		limit ${limit}
	`;
}

export async function createIngestSource(
	workspaceID: string,
	createdBy: string,
	kind: string,
	name: string,
): Promise<IngestSource> {
	return one(prisma.$queryRaw`
		insert into ingest_sources (workspace_id, created_by, kind, name)
		values (${workspaceID}::uuid, ${createdBy}::uuid, ${kind}, ${name})
		returning id::text, workspace_id::text, kind, name, created_by::text, created_at
	`);
}

export async function hybridSearch(
	workspaceID: string,
	query: string,
	latestOnly: boolean,
): Promise<SearchResult[]> {
	if (query.trim() === "") {
		return [];
	}
	const lexical = await searchChunksLexical(workspaceID, query, latestOnly, 24);
	const candidates = await listChunks(workspaceID, latestOnly);
	const semantic = rankSemanticResults(query, candidates, 48);
	return reciprocalRankFusion(lexical, semantic, 20);
}

export async function getTrace(chunkID: string) {
	return maybeOne<{
		id: string;
		document_id: string;
		document_version_id: string;
		chunk_index: number;
		chunk_count: number;
		token_count: number;
		content: string;
		search_text: string;
		embedding: string;
	}>(prisma.$queryRaw`
		select c.id::text, c.document_id::text, c.document_version_id::text, c.chunk_index, c.chunk_count, c.token_count, c.content, c.search_text, c.embedding::text
		from document_chunks c
		where c.id = ${chunkID}::uuid
	`);
}

async function searchChunksLexical(
	workspaceID: string,
	query: string,
	latestOnly: boolean,
	limit: number,
): Promise<SearchResult[]> {
	const latestFilter = latestOnly ? "and d.latest_version_id = v.id" : "";
	const rows = await prisma.$queryRawUnsafe<SearchResult[]>(
		`
		select
			d.id::text as document_id,
			d.title as document_title,
			d.slug as document_slug,
			v.id::text as version_id,
			v.version_number,
			c.id::text as chunk_id,
			c.chunk_index,
			c.chunk_count,
			c.content as snippet,
			c.search_text,
			json_build_object('workspace_id', d.workspace_id::text, 'document_id', d.id::text, 'document_version_id', v.id::text, 'chunk_id', c.id::text) as provenance,
			ts_rank_cd(c.search_vector, websearch_to_tsquery('english', $2)) as lexical_score,
			0::float8 as semantic_score,
			0::float8 as combined_score
		from document_chunks c
		join document_versions v on v.id = c.document_version_id
		join documents d on d.id = c.document_id
		where d.workspace_id = $1::uuid
			${latestFilter}
			and c.search_vector @@ websearch_to_tsquery('english', $2)
		order by lexical_score desc, v.version_number desc, c.chunk_index asc
		limit $3
	`,
		workspaceID,
		query,
		limit,
	);
	return rows.map((row) => ({
		...row,
		snippet: snippetForResult(row.snippet, query),
	}));
}

async function listChunks(
	workspaceID: string,
	latestOnly: boolean,
): Promise<SearchResult[]> {
	const latestFilter = latestOnly ? "and d.latest_version_id = v.id" : "";
	const rows = await prisma.$queryRawUnsafe<
		Array<SearchResult & { raw_embedding: string }>
	>(
		`
		select
			d.id::text as document_id,
			d.title as document_title,
			d.slug as document_slug,
			v.id::text as version_id,
			v.version_number,
			c.id::text as chunk_id,
			c.chunk_index,
			c.chunk_count,
			c.content as snippet,
			c.search_text,
			c.embedding::text as raw_embedding,
			json_build_object('workspace_id', d.workspace_id::text, 'document_id', d.id::text, 'document_version_id', v.id::text, 'chunk_id', c.id::text) as provenance,
			0::float8 as lexical_score,
			0::float8 as semantic_score,
			0::float8 as combined_score
		from document_chunks c
		join document_versions v on v.id = c.document_version_id
		join documents d on d.id = c.document_id
		where d.workspace_id = $1::uuid ${latestFilter}
	`,
		workspaceID,
	);
	return rows.map(({ raw_embedding, ...row }) => ({
		...row,
		embedding: parseVectorLiteral(raw_embedding),
		snippet: snippetForResult(row.snippet, ""),
	}));
}

async function replaceChunks(
	tx: Queryable,
	documentID: string,
	versionID: string,
	content: string,
): Promise<void> {
	await tx.$executeRaw`delete from document_chunks where document_version_id = ${versionID}::uuid`;
	const chunks = chunkMarkdown(content);
	for (const chunk of chunks) {
		const searchText = searchTextForChunk(chunk.content);
		const embedding = vectorLiteral(deterministicEmbedding(searchText));
		await tx.$executeRaw`
			insert into document_chunks (
				document_id, document_version_id, chunk_index, chunk_count, token_count, content, search_text, embedding
			)
			values (${documentID}::uuid, ${versionID}::uuid, ${chunk.chunkIndex}, ${chunks.length}, ${chunk.tokenCount}, ${chunk.content}, ${searchText}, ${embedding}::vector)
		`;
	}
}

async function recordActivity(
	tx: Queryable,
	workspaceID: string,
	documentID: string | null,
	actorID: string | null,
	eventType: string,
	summary: string,
): Promise<void> {
	await tx.$executeRaw`
		insert into activity_events (workspace_id, document_id, actor_id, event_type, summary)
		values (${workspaceID}::uuid, ${documentID}::uuid, ${actorID}::uuid, ${eventType}, ${summary})
	`;
}

async function one<T>(promise: Promise<T[]>): Promise<T> {
	const row = (await promise)[0];
	if (!row) {
		throw new Error("record not found");
	}
	return row;
}

async function maybeOne<T>(promise: Promise<T[]>): Promise<T | null> {
	return (await promise)[0] ?? null;
}
