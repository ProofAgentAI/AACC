-- AACC-USA schema v23: task history and comments.
-- Run AFTER schema-v22, once, in the Supabase SQL Editor. Idempotent.

-- Completed tasks keep their completion date for the Previous Tasks list.
alter table public.staff_tasks
  add column if not exists completed_at timestamptz;

update public.staff_tasks set completed_at = now()
 where status = 'done' and completed_at is null;

-- Comment thread per task: the assignee (or any staff member) can discuss a
-- task before marking it done.
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.staff_tasks (id) on delete cascade,
  created_at timestamptz not null default now(),
  author text not null,
  comment text not null
);

comment on table public.task_comments is 'Discussion thread per back-office task';

create index if not exists task_comments_task_idx
  on public.task_comments (task_id, created_at asc);

alter table public.task_comments enable row level security;

drop policy if exists "Staff read task comments" on public.task_comments;
drop policy if exists "Staff write own task comments" on public.task_comments;
drop policy if exists "Authors and admin delete task comments" on public.task_comments;

create policy "Staff read task comments"
  on public.task_comments for select to authenticated using (public.is_staff());
create policy "Staff write own task comments"
  on public.task_comments for insert to authenticated
  with check (public.is_staff() and author = (auth.jwt() ->> 'email'));
create policy "Authors and admin delete task comments"
  on public.task_comments for delete to authenticated
  using (public.is_admin() or author = (auth.jwt() ->> 'email'));
