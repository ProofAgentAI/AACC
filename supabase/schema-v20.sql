-- AACC-USA schema v20: full organization structure (roles with duties).
-- Run AFTER schema-v19 (and v19b), once, in the Supabase SQL Editor.
-- Roles can be vacant (no name yet) and carry short public responsibilities.

alter table public.team_members
  alter column name drop not null;

alter table public.team_members
  add column if not exists duties text,
  add column if not exists duties_ar text,
  add column if not exists suggested_profile text;

comment on column public.team_members.duties is 'Few words on the role''s responsibilities, shown publicly';

-- Four organization levels (legacy value ''team'' maps to leadership).
alter table public.team_members drop constraint if exists team_members_tier_check;
alter table public.team_members
  add constraint team_members_tier_check
  check (tier in ('executive', 'board', 'leadership', 'advisory', 'team'));
update public.team_members set tier = 'leadership' where tier = 'team';

-- The president's role gets its duties from the organization chart.
update public.team_members
   set duties = 'Vision, strategy, public representation, partnerships',
       duties_ar = 'الرؤية والاستراتيجية والتمثيل العام والشراكات',
       suggested_profile = 'Founder',
       sort_order = 1,
       updated_at = now()
 where name = 'Dr. Fouad Bousetouane';

-- Seed every role from AACC-USA_Organization_Structure.xlsx as an open seat.
-- Idempotent: a role is only inserted if its title is not already present.
insert into public.team_members
  (role_title, role_title_ar, duties, duties_ar, suggested_profile, tier, sort_order, published)
select v.* from (values
  -- Executive Committee
  ('Vice President', 'نائب الرئيس', 'Strategic initiatives and executive support', 'المبادرات الاستراتيجية والدعم التنفيذي', 'Senior Executive', 'executive', 2, true),
  ('Treasurer', 'أمين الخزينة', 'Financial oversight, budget, compliance', 'الإشراف المالي والميزانية والامتثال', 'CPA / CFO / Controller', 'executive', 3, true),
  ('Secretary', 'الأمين العام', 'Governance, bylaws, board records', 'الحوكمة واللوائح وسجلات المجلس', 'Attorney', 'executive', 4, true),
  ('General Counsel', 'المستشار القانوني', 'Legal counsel and compliance', 'الاستشارة القانونية والامتثال', 'Attorney', 'executive', 5, true),
  -- Board of Directors
  ('Director – Business Development & Chamber Growth', 'مدير تطوير الأعمال ونمو الغرفة', 'Membership growth, chamber expansion', 'نمو العضوية وتوسع الغرفة', 'MBA / Chamber Executive', 'board', 10, true),
  ('Director – Trade & Investment', 'مدير التجارة والاستثمار', 'Trade, investment, market access', 'التجارة والاستثمار والوصول إلى الأسواق', 'Business Leader', 'board', 11, true),
  ('Director – International Relations, Partnerships & Global Events', 'مدير العلاقات الدولية والشراكات والفعاليات العالمية', 'Global partnerships, conferences, delegations', 'الشراكات العالمية والمؤتمرات والوفود', 'International Relations', 'board', 12, true),
  ('Director – Technology, Innovation & AI', 'مدير التكنولوجيا والابتكار والذكاء الاصطناعي', 'Technology ecosystem and AI', 'منظومة التكنولوجيا والذكاء الاصطناعي', 'Tech Executive', 'board', 13, true),
  ('Director – Energy, Industry & Infrastructure', 'مدير الطاقة والصناعة والبنية التحتية', 'Energy and infrastructure partnerships', 'شراكات الطاقة والبنية التحتية', 'Industry Executive', 'board', 14, true),
  ('Director – Healthcare & Life Sciences', 'مدير الرعاية الصحية وعلوم الحياة', 'Healthcare and pharma partnerships', 'شراكات الرعاية الصحية والأدوية', 'Physician / Pharmacist', 'board', 15, true),
  ('Director – Entrepreneurship & Small Business', 'مدير ريادة الأعمال والأعمال الصغيرة', 'Entrepreneur support and mentoring', 'دعم رواد الأعمال والإرشاد', 'Entrepreneur', 'board', 16, true),
  ('Director – Membership & Community Development', 'مدير العضوية وتنمية المجتمع', 'Community engagement and chapters', 'إشراك المجتمع والفروع', 'Community Leader', 'board', 17, true),
  ('Director – Marketing, Media & Public Engagement', 'مدير التسويق والإعلام والتواصل العام', 'Brand, PR and communications', 'العلامة التجارية والعلاقات العامة والاتصال', 'Marketing Executive', 'board', 18, true),
  ('Director – Sponsorships & Institutional Advancement', 'مدير الرعايات والتطوير المؤسسي', 'Sponsors and fundraising', 'الرعاة وجمع التمويل', 'Business Development', 'board', 19, true),
  -- Leadership Team
  ('Executive Director', 'المدير التنفيذي', 'Daily management and execution', 'الإدارة اليومية والتنفيذ', 'Executive', 'leadership', 20, true),
  ('Director of Operations', 'مدير العمليات', 'Operations and administration', 'العمليات والإدارة', 'Operations', 'leadership', 21, true),
  ('Director of Membership & Community', 'مدير العضوية والمجتمع', 'Membership services', 'خدمات العضوية', 'Membership', 'leadership', 22, true),
  ('Director of Events & Programs', 'مدير الفعاليات والبرامج', 'Events and trade missions', 'الفعاليات والبعثات التجارية', 'Events', 'leadership', 23, true),
  ('Director of Communications & Public Relations', 'مدير الاتصالات والعلاقات العامة', 'Media and communications', 'الإعلام والاتصال', 'Communications', 'leadership', 24, true),
  ('Director of Social Media & Digital Engagement', 'مدير وسائل التواصل والتفاعل الرقمي', 'Manage all social platforms and daily content', 'إدارة منصات التواصل والمحتوى اليومي', 'Social Media', 'leadership', 25, true),
  ('Director of Partnerships & Sponsorships', 'مدير الشراكات والرعايات', 'Corporate partnerships', 'الشراكات المؤسسية', 'Partnerships', 'leadership', 26, true),
  ('Director of Technology & Digital Platforms', 'مدير التكنولوجيا والمنصات الرقمية', 'Website, CRM and IT', 'الموقع الإلكتروني وإدارة العلاقات والأنظمة', 'Technology', 'leadership', 27, true),
  ('Volunteer & Chapter Coordinator', 'منسق المتطوعين والفروع', 'Volunteer and chapter coordination', 'تنسيق المتطوعين والفروع', 'Community', 'leadership', 28, true),
  -- Advisory Council
  ('Senior Advisor – Government & Public Affairs', 'مستشار أول للشؤون الحكومية والعامة', 'Government relations', 'العلاقات الحكومية', 'Senior Leader', 'advisory', 30, true),
  ('Senior Advisor – Investment & Finance', 'مستشار أول للاستثمار والمال', 'Investment guidance', 'التوجيه الاستثماري', 'Investor', 'advisory', 31, true),
  ('Senior Advisor – Academic & Research Partnerships', 'مستشار أول للشراكات الأكاديمية والبحثية', 'University partnerships', 'الشراكات الجامعية', 'Professor', 'advisory', 32, true),
  ('Senior Advisor – Media & Public Influence', 'مستشار أول للإعلام والتأثير العام', 'Media visibility', 'الحضور الإعلامي', 'Influencer', 'advisory', 33, true),
  ('Senior Advisor – Aviation & Transportation', 'مستشار أول للطيران والنقل', 'Transportation initiatives', 'مبادرات النقل', 'Executive', 'advisory', 34, true)
) as v(role_title, role_title_ar, duties, duties_ar, suggested_profile, tier, sort_order, published)
where not exists (
  select 1 from public.team_members t where t.role_title = v.role_title
);
