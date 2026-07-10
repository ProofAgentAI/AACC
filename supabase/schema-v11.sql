-- AACC-USA schema v11: role-aware administrator check.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

-- The administrator is contact@aacc-usa.org OR any user granted the 'admin'
-- role from the Users screen. Publishing, billing, deletions, and user
-- management policies all flow through this function.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'contact@aacc-usa.org'
      or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
$$;
