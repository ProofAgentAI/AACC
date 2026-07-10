-- AACC-USA schema v13: newsletter sections, headline, main photo, and approval flow.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

alter table public.newsletters
  add column if not exists headline text,
  add column if not exists main_image text,
  add column if not exists main_image_credit text;

-- Newsletters now move draft -> pending (submitted to the administrator) -> sent.
alter table public.newsletters drop constraint if exists newsletters_status_check;
alter table public.newsletters
  add constraint newsletters_status_check check (status in ('draft', 'pending', 'sent'));

-- Staff can keep editing anything not yet sent (drafts and their submissions);
-- sending itself happens server-side with the service key.
drop policy if exists "Staff can edit draft newsletters" on public.newsletters;
create policy "Staff can edit unsent newsletters"
  on public.newsletters for update to authenticated
  using (status in ('draft', 'pending'))
  with check (status in ('draft', 'pending'));
