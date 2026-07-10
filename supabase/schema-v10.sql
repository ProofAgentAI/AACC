-- AACC-USA schema v10: billing (invoices and dues). Admin-only.
-- Run AFTER the previous schema files, once, in the Supabase SQL Editor.

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity,
  created_at timestamptz not null default now(),
  billed_name text not null,
  billed_email text not null,
  organization text,
  description text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),
  paid_at timestamptz,
  payment_method text check (payment_method in ('card', 'check', 'cash', 'transfer', 'other')),
  payment_link text,
  notes text,
  created_by text
);

comment on table public.invoices is 'Chamber invoices and dues (administrator only)';

alter table public.invoices enable row level security;

-- Financial records are restricted to the administrator account.
create policy "Admin manages invoices"
  on public.invoices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
