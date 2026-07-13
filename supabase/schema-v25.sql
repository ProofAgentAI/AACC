-- AACC-USA schema v25: merge the Expert Council into the Advisory Council.
-- Run AFTER schema-v23 (v24 optional — this works whether or not it ran).

-- Move any expert seats into the Advisory Council.
update public.team_members set tier = 'advisory', sort_order = 55
 where tier = 'experts';

-- Retire the experts tier.
alter table public.team_members drop constraint if exists team_members_tier_check;
alter table public.team_members
  add constraint team_members_tier_check
  check (tier in ('executive', 'board', 'leadership', 'ambassadors', 'advisory', 'team'));

-- Ensure the Healthcare Expert seat exists inside the Advisory Council.
insert into public.team_members
  (role_title, role_title_ar, duties, duties_ar, suggested_profile, suggested_profile_ar, tier, sort_order, published, seat_status)
select
  'Healthcare Expert', 'خبير الرعاية الصحية',
  'Provides specialized guidance on healthcare, life sciences, and medical-sector initiatives and partnerships.',
  'يقدم إرشاداً متخصصاً في الرعاية الصحية وعلوم الحياة ومبادرات القطاع الطبي وشراكاته.',
  'Physician / pharmacist / healthcare researcher or executive',
  'طبيب / صيدلي / باحث أو تنفيذي في الرعاية الصحية',
  'advisory', 55, true, 'open'
where not exists (
  select 1 from public.team_members t where t.role_title = 'Healthcare Expert'
);
