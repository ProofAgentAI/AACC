-- AACC-USA schema v12: newsletter campaigns.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

create table public.newsletters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subject text not null,
  intro text,
  items jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'sent')),
  sent_at timestamptz,
  sent_count integer not null default 0,
  created_by text
);

comment on table public.newsletters is 'Newsletter campaigns composed in the back office';

alter table public.newsletters enable row level security;

-- All staff can compose and edit drafts; only the administrator deletes.
-- Sending happens server-side with the service key and marks status=sent.
create policy "Staff can read newsletters"
  on public.newsletters for select to authenticated using (true);
create policy "Staff can create newsletters"
  on public.newsletters for insert to authenticated with check (true);
create policy "Staff can edit draft newsletters"
  on public.newsletters for update to authenticated
  using (status = 'draft') with check (status = 'draft');
create policy "Admin can delete newsletters"
  on public.newsletters for delete to authenticated using (public.is_admin());
