-- AACC-USA schema v4: content management (news, articles, announcements, podcasts).
-- Run AFTER schema.sql, schema-v2.sql, and schema-v3.sql, once, in the Supabase SQL Editor.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  type text not null default 'article' check (type in ('article', 'news', 'announcement', 'podcast')),
  title text not null,
  excerpt text,
  content_html text not null default '',
  cover_image text,
  category text,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  seo_title text,
  seo_description text,
  seo_keywords text,
  published boolean not null default false,
  published_at timestamptz,
  likes integer not null default 0,
  views integer not null default 0
);

comment on table public.posts is 'CMS content for aacc-usa.org: articles, news, announcements, podcast announcements';

alter table public.posts enable row level security;

-- The public may read only published content.
create policy "Public can read published posts"
  on public.posts
  for select
  to anon
  using (published = true);

-- Staff manage everything.
create policy "Staff can read all posts"
  on public.posts for select to authenticated using (true);
create policy "Staff can create posts"
  on public.posts for insert to authenticated with check (true);
create policy "Staff can update posts"
  on public.posts for update to authenticated using (true) with check (true);
create policy "Staff can delete posts"
  on public.posts for delete to authenticated using (true);

-- Public like/view counters. Anon cannot UPDATE rows directly; these functions
-- are the only write path and only touch the counters of published posts.
create or replace function public.increment_post_likes(post_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update posts set likes = likes + 1 where id = post_id and published = true returning likes;
$$;

create or replace function public.increment_post_views(post_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update posts set views = views + 1 where id = post_id and published = true returning views;
$$;

grant execute on function public.increment_post_likes(uuid) to anon;
grant execute on function public.increment_post_views(uuid) to anon;
