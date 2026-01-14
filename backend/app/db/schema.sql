create table if not exists sessions (
  id uuid primary key,
  status text not null,
  team_name text,
  mentor_name text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists instance_responses (
  id uuid primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  instance_id text not null,
  kind text not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, instance_id)
);

create index if not exists idx_instance_responses_session on instance_responses(session_id);
create index if not exists idx_instance_responses_instance on instance_responses(instance_id);
