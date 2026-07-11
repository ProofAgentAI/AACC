-- AACC-USA schema v15: member portal roles and tightened row-level security.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.
-- IMPORTANT: run this BEFORE inviting any member (individual, business, or
-- ambassador). Until now every authenticated account counted as staff; this
-- migration restricts staff-only tables to staff roles so member accounts
-- only ever see published events, published posts, sent newsletters, and
-- approved directory listings.

-- Role helpers -------------------------------------------------------------------
-- Staff = the administrator mailbox, or role admin/board/staff. Accounts
-- created before roles existed have no metadata and default to board (staff);
-- member accounts are always created with an explicit member role.
create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'contact@aacc-usa.org'
      or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'board') in ('admin', 'board', 'staff')
$$;

create or replace function public.is_member()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('individual', 'business', 'ambassador')
$$;

-- State Ambassadors get CRM access alongside staff.
create or replace function public.is_ambassador()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'ambassador'
$$;

-- Form inboxes: staff only -------------------------------------------------------
drop policy if exists "Staff can read membership applications" on public.membership_applications;
drop policy if exists "Staff can update membership applications" on public.membership_applications;
drop policy if exists "Staff can delete membership applications" on public.membership_applications;
create policy "Staff can read membership applications"
  on public.membership_applications for select to authenticated using (public.is_staff());
create policy "Staff can update membership applications"
  on public.membership_applications for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete membership applications"
  on public.membership_applications for delete to authenticated using (public.is_staff());

drop policy if exists "Staff can read board applications" on public.board_applications;
drop policy if exists "Staff can update board applications" on public.board_applications;
drop policy if exists "Staff can delete board applications" on public.board_applications;
create policy "Staff can read board applications"
  on public.board_applications for select to authenticated using (public.is_staff());
create policy "Staff can update board applications"
  on public.board_applications for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete board applications"
  on public.board_applications for delete to authenticated using (public.is_staff());

drop policy if exists "Staff can read directory submissions" on public.directory_submissions;
drop policy if exists "Staff can update directory submissions" on public.directory_submissions;
drop policy if exists "Staff can delete directory submissions" on public.directory_submissions;
create policy "Staff can read directory submissions"
  on public.directory_submissions for select to authenticated
  using (public.is_staff() or status = 'approved');
create policy "Staff can update directory submissions"
  on public.directory_submissions for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete directory submissions"
  on public.directory_submissions for delete to authenticated using (public.is_staff());

drop policy if exists "Staff can read newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Staff can delete newsletter subscribers" on public.newsletter_subscribers;
create policy "Staff can read newsletter subscribers"
  on public.newsletter_subscribers for select to authenticated using (public.is_staff());
create policy "Staff can delete newsletter subscribers"
  on public.newsletter_subscribers for delete to authenticated using (public.is_staff());

drop policy if exists "Staff can read contact messages" on public.contact_messages;
drop policy if exists "Staff can update contact messages" on public.contact_messages;
drop policy if exists "Staff can delete contact messages" on public.contact_messages;
create policy "Staff can read contact messages"
  on public.contact_messages for select to authenticated using (public.is_staff());
create policy "Staff can update contact messages"
  on public.contact_messages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete contact messages"
  on public.contact_messages for delete to authenticated using (public.is_staff());

-- Content: members read published, staff manage ----------------------------------
drop policy if exists "Staff can read all posts" on public.posts;
drop policy if exists "Staff can create posts" on public.posts;
drop policy if exists "Staff can update posts" on public.posts;
drop policy if exists "Staff can create unpublished posts" on public.posts;
drop policy if exists "Staff can edit own posts, admin edits all" on public.posts;
create policy "Staff read all posts, members read published"
  on public.posts for select to authenticated
  using (public.is_staff() or published = true);
create policy "Staff can create unpublished posts"
  on public.posts for insert to authenticated
  with check (public.is_staff() and (public.is_admin() or published = false));
create policy "Staff can edit own posts, admin edits all"
  on public.posts for update to authenticated
  using (public.is_staff() and (public.is_admin() or created_by = (auth.jwt() ->> 'email')))
  with check (public.is_staff() and (public.is_admin() or published = false));

-- Events: members read published, staff manage ------------------------------------
drop policy if exists "Staff can read all events" on public.events;
drop policy if exists "Staff can create unpublished events" on public.events;
drop policy if exists "Staff edit own events, admin edits all" on public.events;
create policy "Staff read all events, members read published"
  on public.events for select to authenticated
  using (public.is_staff() or published = true);
create policy "Staff can create unpublished events"
  on public.events for insert to authenticated
  with check (public.is_staff() and (public.is_admin() or published = false));
create policy "Staff edit own events, admin edits all"
  on public.events for update to authenticated
  using (public.is_staff() and (public.is_admin() or created_by = (auth.jwt() ->> 'email')))
  with check (public.is_staff() and (public.is_admin() or published = false));

-- Newsletters: members read sent campaigns, staff compose -------------------------
drop policy if exists "Staff can read newsletters" on public.newsletters;
drop policy if exists "Staff can create newsletters" on public.newsletters;
drop policy if exists "Staff can edit unsent newsletters" on public.newsletters;
create policy "Staff read all newsletters, members read sent"
  on public.newsletters for select to authenticated
  using (public.is_staff() or status = 'sent');
create policy "Staff can create newsletters"
  on public.newsletters for insert to authenticated with check (public.is_staff());
create policy "Staff can edit unsent newsletters"
  on public.newsletters for update to authenticated
  using (public.is_staff() and status in ('draft', 'pending'))
  with check (public.is_staff() and status in ('draft', 'pending'));

-- Tasks: staff only ---------------------------------------------------------------
drop policy if exists "Staff manage tasks" on public.staff_tasks;
create policy "Staff manage tasks"
  on public.staff_tasks for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- CRM: staff and State Ambassadors -------------------------------------------------
drop policy if exists "Staff manage crm contacts" on public.crm_contacts;
drop policy if exists "Staff manage crm activities" on public.crm_activities;
create policy "Staff and ambassadors manage crm contacts"
  on public.crm_contacts for all to authenticated
  using (public.is_staff() or public.is_ambassador())
  with check (public.is_staff() or public.is_ambassador());
create policy "Staff and ambassadors manage crm activities"
  on public.crm_activities for all to authenticated
  using (public.is_staff() or public.is_ambassador())
  with check (public.is_staff() or public.is_ambassador());

-- Post images: uploads are staff only ----------------------------------------------
drop policy if exists "Staff can upload post images" on storage.objects;
drop policy if exists "Staff can update post images" on storage.objects;
drop policy if exists "Staff can delete post images" on storage.objects;
create policy "Staff can upload post images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images' and public.is_staff());
create policy "Staff can update post images"
  on storage.objects for update to authenticated
  using (bucket_id = 'post-images' and public.is_staff())
  with check (bucket_id = 'post-images' and public.is_staff());
create policy "Staff can delete post images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'post-images' and public.is_staff());
