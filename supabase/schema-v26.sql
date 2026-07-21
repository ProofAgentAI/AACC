-- AACC-USA schema v26: Expert Council directory with public applications.
-- Run AFTER schema-v25, once, in the Supabase SQL Editor. Idempotent.

create table if not exists public.experts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  title text not null,
  organization text,
  email text not null unique,
  phone text,
  linkedin text,
  city_state text,
  domain text not null,
  subdomain text,
  bio text not null,
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  highlighted boolean not null default false,
  locale text not null default 'en'
);

comment on table public.experts is 'Expert Council directory: public applications reviewed in the admin Experts tab; approved experts publish to /experts';

alter table public.experts enable row level security;

-- Anyone may apply; the public sees only approved experts; staff review;
-- the administrator approves, highlights (max 9 enforced in the UI), edits,
-- and removes.
create policy "Public can apply to the expert council"
  on public.experts for insert to anon with check (status = 'pending' and highlighted = false);
create policy "Signed-in can apply to the expert council"
  on public.experts for insert to authenticated
  with check (public.is_staff() or (status = 'pending' and highlighted = false));
create policy "Public can view approved experts"
  on public.experts for select to anon using (status = 'approved');
create policy "Staff read experts, others read approved"
  on public.experts for select to authenticated
  using (public.is_staff() or status = 'approved');
create policy "Admin can update experts"
  on public.experts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete experts"
  on public.experts for delete to authenticated using (public.is_admin());

-- Public bucket for expert photos. Applicants upload before submitting, so
-- anonymous inserts are allowed — capped server-side to 2 MB images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('expert-photos', 'expert-photos', true, 2097152,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view expert photos"
  on storage.objects for select to public using (bucket_id = 'expert-photos');
create policy "Anyone can upload expert photos"
  on storage.objects for insert to anon with check (bucket_id = 'expert-photos');
create policy "Signed-in can upload expert photos"
  on storage.objects for insert to authenticated with check (bucket_id = 'expert-photos');
create policy "Admin can update expert photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'expert-photos' and public.is_admin())
  with check (bucket_id = 'expert-photos' and public.is_admin());
create policy "Admin can delete expert photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'expert-photos' and public.is_admin());
