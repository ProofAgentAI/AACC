-- AACC-USA schema v17: password resets, event RSVPs, member listing edits.
-- Run AFTER the previous schema files (through v16), once, in the Supabase SQL Editor.

-- Password reset tokens ------------------------------------------------------------
-- Reset links are emailed from contact@aacc-usa.org (never Supabase's mailer).
-- Only the server (service role) touches this table: RLS is enabled with no
-- policies, so anon/authenticated clients cannot read or write tokens.
create table public.password_resets (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 minutes',
  used_at timestamptz
);

comment on table public.password_resets is 'One-time password reset tokens (server-only)';

alter table public.password_resets enable row level security;

-- Event RSVPs ----------------------------------------------------------------------
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  email text not null,
  name text,
  role text,
  status text not null default 'going' check (status in ('going', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, email)
);

comment on table public.event_rsvps is 'Member RSVPs for chamber events';

alter table public.event_rsvps enable row level security;

-- Members RSVP for themselves, to published events only.
create policy "Members RSVP for themselves"
  on public.event_rsvps for insert to authenticated
  with check (
    email = (auth.jwt() ->> 'email')
    and exists (select 1 from public.events e where e.id = event_id and e.published)
  );

-- Members see and change their own RSVP; staff see and manage all of them.
create policy "Read own RSVPs, staff read all"
  on public.event_rsvps for select to authenticated
  using (public.is_staff() or email = (auth.jwt() ->> 'email'));
create policy "Update own RSVP, staff update all"
  on public.event_rsvps for update to authenticated
  using (public.is_staff() or email = (auth.jwt() ->> 'email'))
  with check (public.is_staff() or email = (auth.jwt() ->> 'email'));
create policy "Staff can delete RSVPs"
  on public.event_rsvps for delete to authenticated
  using (public.is_staff());

-- Members may see how many people are going without seeing who.
create or replace function public.event_rsvp_count(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from event_rsvps
  where event_id = p_event_id and status = 'going';
$$;

grant execute on function public.event_rsvp_count(uuid) to authenticated;

-- Members edit their own business listings ------------------------------------------
-- Any member edit goes back through review: the row returns to 'pending' and
-- cannot self-assign the sponsored flag. Staff edits are covered by v15.
create policy "Members can edit own listings"
  on public.directory_submissions for update to authenticated
  using (submitted_by = (auth.jwt() ->> 'email'))
  with check (
    submitted_by = (auth.jwt() ->> 'email')
    and status = 'pending'
    and featured = false
  );
