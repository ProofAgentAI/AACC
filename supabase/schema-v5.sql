-- AACC-USA schema v5: image storage for articles.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

-- Public bucket for article cover images. Anyone can view (they appear on the
-- public site); only signed-in staff can upload, replace, or delete.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Public can view post images"
  on storage.objects for select
  to public
  using (bucket_id = 'post-images');

create policy "Staff can upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

create policy "Staff can update post images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images')
  with check (bucket_id = 'post-images');

create policy "Staff can delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');
