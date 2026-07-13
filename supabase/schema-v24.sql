-- AACC-USA schema v24: Expert Council section.
-- Run AFTER schema-v23, once, in the Supabase SQL Editor. Idempotent.
--
-- A new organization level for subject-matter experts. It starts with a
-- Healthcare & Life Sciences expert seat and is designed to grow: add more
-- specialized experts (and more than one per specialty) from the admin Team
-- tab's "Add role" button on the Expert Council section.

alter table public.team_members drop constraint if exists team_members_tier_check;
alter table public.team_members
  add constraint team_members_tier_check
  check (tier in ('executive', 'board', 'leadership', 'ambassadors', 'advisory', 'experts', 'team'));

insert into public.team_members
  (role_title, role_title_ar, duties, duties_ar, suggested_profile, suggested_profile_ar, tier, sort_order, published, seat_status)
select
  'Healthcare Expert',
  'خبير الرعاية الصحية',
  'Provides specialized guidance on healthcare, life sciences, and medical-sector initiatives and partnerships.',
  'يقدم إرشاداً متخصصاً في الرعاية الصحية وعلوم الحياة ومبادرات القطاع الطبي وشراكاته.',
  'Physician / pharmacist / healthcare researcher or executive',
  'طبيب / صيدلي / باحث أو تنفيذي في الرعاية الصحية',
  'experts', 60, true, 'open'
where not exists (
  select 1 from public.team_members t
  where t.role_title = 'Healthcare Expert' and t.tier = 'experts'
);
