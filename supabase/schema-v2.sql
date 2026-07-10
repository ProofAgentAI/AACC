-- AACC-USA schema v2: business directory submissions + back-office access.
-- Run AFTER schema.sql, once, in the Supabase SQL Editor.

-- Directory inclusion requests ---------------------------------------------------
create table public.directory_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_name text not null,
  category text not null,
  business_type text,
  city text,
  state text,
  description text not null,
  website text,
  services text[] not null default '{}',
  contact_name text not null,
  email text not null unique,
  phone text,
  algeria_interest boolean not null default false,
  us_interest boolean not null default false,
  locale text not null default 'en',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

comment on table public.directory_submissions is 'Business directory inclusion requests from aacc-usa.org';

alter table public.directory_submissions enable row level security;

-- Anyone may submit a request.
create policy "Public can request directory inclusion"
  on public.directory_submissions
  for insert
  to anon
  with check (true);

-- Approved listings are public (this is what the directory page shows).
create policy "Public can view approved listings"
  on public.directory_submissions
  for select
  to anon
  using (status = 'approved');

-- Back-office access (any signed-in staff account) --------------------------------
-- Staff accounts are created from the back office (or the Supabase dashboard);
-- public visitors can never sign in because sign-ups are disabled by default.

create policy "Staff can read membership applications"
  on public.membership_applications for select to authenticated using (true);
create policy "Staff can update membership applications"
  on public.membership_applications for update to authenticated using (true) with check (true);
create policy "Staff can delete membership applications"
  on public.membership_applications for delete to authenticated using (true);

create policy "Staff can read board applications"
  on public.board_applications for select to authenticated using (true);
create policy "Staff can update board applications"
  on public.board_applications for update to authenticated using (true) with check (true);
create policy "Staff can delete board applications"
  on public.board_applications for delete to authenticated using (true);

create policy "Staff can read directory submissions"
  on public.directory_submissions for select to authenticated using (true);
create policy "Staff can update directory submissions"
  on public.directory_submissions for update to authenticated using (true) with check (true);
create policy "Staff can delete directory submissions"
  on public.directory_submissions for delete to authenticated using (true);

create policy "Staff can read newsletter subscribers"
  on public.newsletter_subscribers for select to authenticated using (true);
create policy "Staff can delete newsletter subscribers"
  on public.newsletter_subscribers for delete to authenticated using (true);
