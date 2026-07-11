-- AACC-USA schema v16: member business listings, sponsored directory, site settings.
-- Run AFTER the previous schema files (through v15), once, in the Supabase SQL Editor.

-- Richer business listings: logo, size, social media, who submitted, sponsored flag.
alter table public.directory_submissions
  add column if not exists logo_url text,
  add column if not exists company_size text,
  add column if not exists social_links jsonb not null default '{}',
  add column if not exists submitted_by text,
  add column if not exists featured boolean not null default false;

comment on column public.directory_submissions.featured is
  'Sponsored listings shown on the public directory page (capped by directory_public_limit)';

-- A member may list more than one business (e.g. a company and a creator brand).
alter table public.directory_submissions
  drop constraint if exists directory_submissions_email_key;

-- Members submit listings from the portal; they see their own submissions
-- (any status) plus the approved directory. Staff see everything.
create policy "Members can submit listings"
  on public.directory_submissions for insert to authenticated
  with check (
    (public.is_member() or public.is_staff())
    and status = 'pending'
    and featured = false
  );

drop policy if exists "Staff can read directory submissions" on public.directory_submissions;
create policy "Staff can read directory submissions"
  on public.directory_submissions for select to authenticated
  using (
    public.is_staff()
    or status = 'approved'
    or submitted_by = (auth.jwt() ->> 'email')
  );

-- Site settings: tiny key/value store for admin-managed knobs.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is 'Admin-managed site configuration (e.g. public directory listing limit)';

insert into public.site_settings (key, value)
values ('directory_public_limit', '50')
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

-- Everyone may read settings (the public site needs the directory limit);
-- only the administrator writes them.
create policy "Public can read settings"
  on public.site_settings for select to anon using (true);
create policy "Signed-in can read settings"
  on public.site_settings for select to authenticated using (true);
create policy "Admin can insert settings"
  on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "Admin can update settings"
  on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Public bucket for business logos: anyone can view, members and staff upload.
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

create policy "Public can view business logos"
  on storage.objects for select
  to public
  using (bucket_id = 'business-logos');

create policy "Members can upload business logos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'business-logos' and (public.is_member() or public.is_staff()));

create policy "Staff can update business logos"
  on storage.objects for update to authenticated
  using (bucket_id = 'business-logos' and public.is_staff())
  with check (bucket_id = 'business-logos' and public.is_staff());

create policy "Staff can delete business logos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'business-logos' and public.is_staff());
