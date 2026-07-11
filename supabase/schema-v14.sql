-- AACC-USA schema v14: State Ambassador membership tier.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

alter table public.membership_applications
  drop constraint if exists membership_applications_tier_check;
alter table public.membership_applications
  add constraint membership_applications_tier_check
  check (tier in ('individual', 'business', 'state-ambassador', 'corporate', 'founding-sponsor'));
