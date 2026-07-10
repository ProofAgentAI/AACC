-- AACC-USA schema v7: single-admin role and content approval workflow.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

-- Track who wrote a post and where it is in the approval pipeline.
alter table public.posts
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('draft', 'pending', 'approved')),
  add column if not exists created_by text;

-- The one administrator. Everyone else is regular staff.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'contact@aacc-usa.org'
$$;

-- Replace the content policies: staff may write drafts and submit for
-- approval, but only the admin can publish (or edit others' posts, or delete).
drop policy if exists "Staff can create posts" on public.posts;
drop policy if exists "Staff can update posts" on public.posts;
drop policy if exists "Staff can delete posts" on public.posts;

create policy "Staff can create unpublished posts"
  on public.posts for insert to authenticated
  with check (public.is_admin() or published = false);

create policy "Staff can edit own posts, admin edits all"
  on public.posts for update to authenticated
  using (public.is_admin() or created_by = (auth.jwt() ->> 'email'))
  with check (public.is_admin() or published = false);

create policy "Admin can delete posts"
  on public.posts for delete to authenticated
  using (public.is_admin());
