create extension if not exists pgcrypto;

create table if not exists users (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	email text not null unique,
	password_hash text not null,
	created_at timestamptz not null default now()
);

create table if not exists workspaces (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	slug text not null unique,
	created_by uuid not null references users(id) on delete cascade,
	created_at timestamptz not null default now()
);

create table if not exists workspace_memberships (
	workspace_id uuid not null references workspaces(id) on delete cascade,
	user_id uuid not null references users(id) on delete cascade,
	role text not null,
	created_at timestamptz not null default now(),
	primary key (workspace_id, user_id)
);

create table if not exists sessions (
	id text primary key,
	user_id uuid not null references users(id) on delete cascade,
	created_at timestamptz not null default now(),
	expires_at timestamptz not null
);

create table if not exists ingest_sources (
	id uuid primary key default gen_random_uuid(),
	workspace_id uuid not null references workspaces(id) on delete cascade,
	kind text not null,
	name text not null,
	created_by uuid not null references users(id) on delete cascade,
	created_at timestamptz not null default now()
);

create table if not exists documents (
	id uuid primary key default gen_random_uuid(),
	workspace_id uuid not null references workspaces(id) on delete cascade,
	title text not null,
	slug text not null,
	status text not null default 'active',
	created_by uuid not null references users(id) on delete cascade,
	latest_version_id uuid,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique(workspace_id, slug)
);

create table if not exists document_versions (
	id uuid primary key default gen_random_uuid(),
	document_id uuid not null references documents(id) on delete cascade,
	version_number integer not null,
	content_markdown text not null,
	content_html text not null,
	content_text text not null,
	content_hash text not null,
	authored_by uuid not null references users(id) on delete cascade,
	ingest_source_id uuid references ingest_sources(id) on delete set null,
	created_at timestamptz not null default now(),
	unique(document_id, version_number)
);

do $$ begin
	alter table documents add constraint documents_latest_version_id_fkey
	foreign key (latest_version_id) references document_versions(id) on delete set null;
exception when duplicate_object then null;
end $$;

create table if not exists document_shares (
	id uuid primary key default gen_random_uuid(),
	document_id uuid not null references documents(id) on delete cascade,
	document_version_id uuid not null references document_versions(id) on delete cascade,
	token text not null unique,
	include_annotations boolean not null default false,
	created_by uuid not null references users(id) on delete cascade,
	created_at timestamptz not null default now()
);

create table if not exists annotations (
	id uuid primary key default gen_random_uuid(),
	document_id uuid not null references documents(id) on delete cascade,
	document_version_id uuid not null references document_versions(id) on delete cascade,
	author_id uuid not null references users(id) on delete cascade,
	quote text not null,
	comment text not null,
	start_offset integer not null,
	end_offset integer not null,
	prefix_text text not null default '',
	suffix_text text not null default '',
	created_at timestamptz not null default now()
);

create table if not exists annotation_comments (
	id uuid primary key default gen_random_uuid(),
	annotation_id uuid not null references annotations(id) on delete cascade,
	author_id uuid not null references users(id) on delete cascade,
	body text not null,
	created_at timestamptz not null default now()
);

create table if not exists activity_events (
	id uuid primary key default gen_random_uuid(),
	workspace_id uuid not null references workspaces(id) on delete cascade,
	document_id uuid references documents(id) on delete cascade,
	actor_id uuid references users(id) on delete set null,
	event_type text not null,
	summary text not null,
	created_at timestamptz not null default now()
);

create table if not exists tags (
	id uuid primary key default gen_random_uuid(),
	workspace_id uuid not null references workspaces(id) on delete cascade,
	name text not null,
	created_at timestamptz not null default now(),
	unique(workspace_id, name)
);

create table if not exists document_tags (
	document_id uuid not null references documents(id) on delete cascade,
	tag_id uuid not null references tags(id) on delete cascade,
	primary key (document_id, tag_id)
);

create table if not exists document_chunks (
	id uuid primary key default gen_random_uuid(),
	document_id uuid not null references documents(id) on delete cascade,
	document_version_id uuid not null references document_versions(id) on delete cascade,
	content text not null,
	search_text text not null,
	embedding jsonb not null,
	created_at timestamptz not null default now()
);

create index if not exists idx_documents_workspace_updated on documents(workspace_id, updated_at desc);
create index if not exists idx_versions_document on document_versions(document_id, version_number desc);
create index if not exists idx_annotations_version on annotations(document_version_id, created_at asc);
create index if not exists idx_activity_workspace on activity_events(workspace_id, created_at desc);
create index if not exists idx_chunks_document_version on document_chunks(document_version_id);
