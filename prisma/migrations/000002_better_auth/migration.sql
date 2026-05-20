alter table users add column if not exists email_verified boolean not null default false;
alter table users add column if not exists image text;
alter table users add column if not exists updated_at timestamptz not null default now();
alter table users drop column if exists password_hash;

drop table if exists sessions;

create table if not exists sessions (
	id uuid primary key default gen_random_uuid(),
	expires_at timestamptz not null,
	token text not null unique,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	ip_address text,
	user_agent text,
	user_id uuid not null references users(id) on delete cascade
);

create index if not exists idx_sessions_user on sessions(user_id);

create table if not exists accounts (
	id uuid primary key default gen_random_uuid(),
	account_id text not null,
	provider_id text not null,
	user_id uuid not null references users(id) on delete cascade,
	access_token text,
	refresh_token text,
	id_token text,
	access_token_expires_at timestamptz,
	refresh_token_expires_at timestamptz,
	scope text,
	password text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_accounts_user on accounts(user_id);

create table if not exists verifications (
	id uuid primary key default gen_random_uuid(),
	identifier text not null,
	value text not null,
	expires_at timestamptz not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_verifications_identifier on verifications(identifier);
