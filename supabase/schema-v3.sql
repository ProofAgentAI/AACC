-- AACC-USA schema v3: contact messages.
-- Run AFTER schema.sql and schema-v2.sql, once, in the Supabase SQL Editor.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  organization text,
  city_state text,
  inquiry_type text not null default 'general',
  message text,
  locale text not null default 'en',
  status text not null default 'new' check (status in ('new', 'replied', 'closed'))
);

comment on table public.contact_messages is 'Contact form messages from aacc-usa.org';

alter table public.contact_messages enable row level security;

create policy "Public can send contact messages"
  on public.contact_messages
  for insert
  to anon
  with check (true);

create policy "Staff can read contact messages"
  on public.contact_messages for select to authenticated using (true);
create policy "Staff can update contact messages"
  on public.contact_messages for update to authenticated using (true) with check (true);
create policy "Staff can delete contact messages"
  on public.contact_messages for delete to authenticated using (true);
