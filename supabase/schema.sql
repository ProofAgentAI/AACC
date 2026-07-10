-- AACC-USA database schema
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- Early membership applications ------------------------------------------------
create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null unique,
  phone text,
  organization text,
  city_state text,
  tier text not null check (tier in ('individual', 'business', 'corporate', 'founding-sponsor')),
  message text,
  locale text not null default 'en',
  status text not null default 'new' check (status in ('new', 'contacted', 'approved', 'declined'))
);

comment on table public.membership_applications is 'Early membership list signups from aaccusa.org';

alter table public.membership_applications enable row level security;

-- The public site may only INSERT. Reading/managing rows requires the
-- dashboard or the service-role key (back office).
create policy "Public can apply for membership"
  on public.membership_applications
  for insert
  to anon
  with check (true);

-- Newsletter subscribers --------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  locale text not null default 'en'
);

comment on table public.newsletter_subscribers is 'Newsletter signups from aaccusa.org';

alter table public.newsletter_subscribers enable row level security;

create policy "Public can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  to anon
  with check (true);
