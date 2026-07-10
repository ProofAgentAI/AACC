-- AACC-USA schema v9: staff tasks and events management (ChamberMaster-style).
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

-- Common tasks: staff to-dos with assignment and due dates -----------------------
create table public.staff_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  details text,
  assigned_to text,
  due_date date,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'open' check (status in ('open', 'done')),
  created_by text
);

comment on table public.staff_tasks is 'Back-office task list (staff-only)';

alter table public.staff_tasks enable row level security;

create policy "Staff manage tasks"
  on public.staff_tasks for all to authenticated using (true) with check (true);

-- Events: managed in the back office, shown on the public Events page ------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  description text,
  category text,
  location text,
  is_virtual boolean not null default false,
  starts_at timestamptz,
  register_url text,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  published boolean not null default false,
  created_by text
);

comment on table public.events is 'Chamber events managed from the back office';

alter table public.events enable row level security;

-- The public sees only published events.
create policy "Public can view published events"
  on public.events for select to anon using (published = true);

-- Staff can draft; publishing an event requires the administrator,
-- mirroring the content approval rule.
create policy "Staff can read all events"
  on public.events for select to authenticated using (true);
create policy "Staff can create unpublished events"
  on public.events for insert to authenticated
  with check (public.is_admin() or published = false);
create policy "Staff edit own events, admin edits all"
  on public.events for update to authenticated
  using (public.is_admin() or created_by = (auth.jwt() ->> 'email'))
  with check (public.is_admin() or published = false);
create policy "Admin can delete events"
  on public.events for delete to authenticated
  using (public.is_admin());
