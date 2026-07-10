-- AACC-USA schema v6: simple CRM (staff-only).
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null,
  last_name text,
  email text not null unique,
  phone text,
  organization text,
  role_title text,
  type text not null default 'other' check (type in ('member', 'business', 'sponsor', 'partner', 'board', 'media', 'community', 'other')),
  status text not null default 'lead' check (status in ('lead', 'contacted', 'engaged', 'active', 'inactive')),
  tags text[] not null default '{}',
  notes text,
  next_action text,
  next_action_date date,
  source text not null default 'manual'
);

comment on table public.crm_contacts is 'Chamber CRM contacts (staff-only)';

create table public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null default 'note' check (kind in ('note', 'call', 'email', 'meeting')),
  note text not null,
  created_by text
);

comment on table public.crm_activities is 'Interaction log per CRM contact';

create index crm_activities_contact_idx on public.crm_activities (contact_id, created_at desc);

alter table public.crm_contacts enable row level security;
alter table public.crm_activities enable row level security;

-- Staff-only in both directions; the public site never touches the CRM.
create policy "Staff manage crm contacts"
  on public.crm_contacts for all to authenticated using (true) with check (true);
create policy "Staff manage crm activities"
  on public.crm_activities for all to authenticated using (true) with check (true);
