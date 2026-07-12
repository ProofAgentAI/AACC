-- AACC-USA schema v22: split Communications and Public Relations.
-- Run AFTER schema-v21, once, in the Supabase SQL Editor. Idempotent.
--
-- The Leadership Team's combined "Director of Communications & Public
-- Relations" becomes two roles:
--   - Director of Communications: owns press releases, official communiques,
--     newsletters, announcements, and external communications
--   - Director of Public Relations: owns media and institutional
--     relationships, amplifies the communiques, and grows engagement

update public.team_members
   set role_title = 'Director of Communications',
       role_title_ar = 'مدير الاتصالات',
       duties = 'Manages press releases, official communiques, newsletters, announcements, and external communications.',
       duties_ar = 'يدير البيانات الصحفية والبلاغات الرسمية والنشرات والإعلانات والاتصال الخارجي.',
       suggested_profile = 'Communications professional',
       suggested_profile_ar = 'مختص اتصالات',
       updated_at = now()
 where role_title = 'Director of Communications & Public Relations';

-- Shift the rest of the Leadership Team down one slot so Public Relations
-- sits right after Communications.
update public.team_members set sort_order = 26 where role_title = 'Director of Social Media & Digital Engagement' and sort_order = 25;
update public.team_members set sort_order = 27 where role_title = 'Director of Partnerships & Sponsorships' and sort_order = 26;
update public.team_members set sort_order = 28 where role_title = 'Director of Technology & Digital Platforms' and sort_order = 27;
update public.team_members set sort_order = 29 where role_title = 'Volunteer & Chapter Coordinator' and sort_order = 28;

insert into public.team_members
  (role_title, role_title_ar, duties, duties_ar, suggested_profile, suggested_profile_ar, tier, sort_order, published, seat_status)
select
  'Director of Public Relations',
  'مدير العلاقات العامة',
  'Builds media and institutional relationships, amplifies official communiques, and grows engagement with partners and the community.',
  'يبني العلاقات الإعلامية والمؤسسية، ويوسع صدى البلاغات الرسمية، وينمي التفاعل مع الشركاء والمجتمع.',
  'PR / media-relations professional',
  'مختص علاقات عامة / علاقات إعلامية',
  'leadership', 25, true, 'open'
where not exists (
  select 1 from public.team_members t where t.role_title = 'Director of Public Relations'
);
