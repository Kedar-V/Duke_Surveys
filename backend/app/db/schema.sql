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

create table if not exists client_intake_forms (
  org_name text primary key,
  raw jsonb not null default '{}'::jsonb,
  org_industry text,
  org_industry_other text,
  org_website text,
  contact_name text,
  contact_email text,
  project_title text,
  project_summary text,
  project_description text,
  minimum_deliverables text,
  stretch_goals text,
  long_term_impact text,
  scope_clarity text,
  scope_clarity_other text,
  publication_potential text,
  required_skills jsonb not null default '[]'::jsonb,
  required_skills_other text,
  technical_domains jsonb not null default '[]'::jsonb,
  data_access text,
  project_sector text,
  supplementary_documents jsonb not null default '[]'::jsonb,
  video_links jsonb not null default '[]'::jsonb,
  edit_token text unique,
  edit_url text,
  revisions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_intake_created on client_intake_forms(created_at);
