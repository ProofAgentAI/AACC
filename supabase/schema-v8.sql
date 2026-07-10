-- AACC-USA schema v8: article author byline.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

alter table public.posts
  add column if not exists author text;

comment on column public.posts.author is 'Public byline shown on cards and articles (e.g. "Fouad Bousetouane"); created_by stays the internal staff email';
