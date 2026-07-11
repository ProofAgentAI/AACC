-- AACC-USA schema v18: signed-in visitors can submit the public forms.
-- Run AFTER the previous schema files (through v17), once, in the Supabase SQL Editor.
--
-- The public-form insert policies were written "to anon" before member and
-- staff accounts existed. A signed-in member browsing the public site sends
-- requests as "authenticated", so their form submissions were rejected by RLS
-- (the board application failure seen on mobile). Mirror each public insert
-- policy for authenticated users.

create policy "Signed-in can apply for membership"
  on public.membership_applications for insert to authenticated with check (true);

create policy "Signed-in can apply for the board"
  on public.board_applications for insert to authenticated with check (true);

create policy "Signed-in can subscribe to newsletter"
  on public.newsletter_subscribers for insert to authenticated with check (true);

create policy "Signed-in can send contact messages"
  on public.contact_messages for insert to authenticated with check (true);
