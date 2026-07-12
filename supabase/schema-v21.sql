-- AACC-USA schema v21: ambassadors level, richer role details, role applications.
-- Run AFTER schema-v20, once, in the Supabase SQL Editor. Idempotent.

-- Seat status + bilingual requirements ---------------------------------------------
alter table public.team_members
  add column if not exists seat_status text not null default 'open',
  add column if not exists suggested_profile_ar text;

alter table public.team_members drop constraint if exists team_members_seat_status_check;
alter table public.team_members
  add constraint team_members_seat_status_check
  check (seat_status in ('confirmed', 'open', 'priority', 'candidate', 'future'));

alter table public.team_members drop constraint if exists team_members_tier_check;
alter table public.team_members
  add constraint team_members_tier_check
  check (tier in ('executive', 'board', 'leadership', 'ambassadors', 'advisory', 'team'));

-- Refresh every role from AACC-USA_Organization_Structure_with_Ambassadors.xlsx ----
update public.team_members set seat_status = 'confirmed',
  duties = 'Sets the vision and strategy; represents AACC-USA publicly; leads major partnerships, fundraising, and institutional relations.',
  duties_ar = 'يضع الرؤية والاستراتيجية؛ يمثل الغرفة علنياً؛ يقود الشراكات الكبرى وجمع التمويل والعلاقات المؤسسية.',
  suggested_profile = 'Founder / senior executive', suggested_profile_ar = 'مؤسس / تنفيذي أول'
  where name = 'Dr. Fouad Bousetouane';

update public.team_members set seat_status = 'open',
  duties = 'Supports the President; coordinates strategic initiatives; helps align board priorities and organizational execution.',
  duties_ar = 'يساند الرئيس؛ ينسق المبادرات الاستراتيجية؛ يساعد على مواءمة أولويات المجلس والتنفيذ المؤسسي.',
  suggested_profile = 'Senior executive / business leader', suggested_profile_ar = 'تنفيذي أول / قائد أعمال'
  where role_title = 'Vice President';

update public.team_members set seat_status = 'priority',
  duties = 'Oversees budgets, financial controls, reporting, banking, tax filings, and coordination with the CPA or accounting firm.',
  duties_ar = 'يشرف على الميزانيات والضوابط المالية والتقارير والخدمات البنكية والإقرارات الضريبية والتنسيق مع مكتب المحاسبة.',
  suggested_profile = 'CPA / CFO / Controller / Senior Accountant', suggested_profile_ar = 'محاسب قانوني CPA / مدير مالي / محاسب أول'
  where role_title = 'Treasurer';

update public.team_members set seat_status = 'open',
  duties = 'Maintains board records, minutes, governance documents, bylaws, notices, and corporate records.',
  duties_ar = 'يحفظ سجلات المجلس والمحاضر ووثائق الحوكمة واللوائح والإشعارات والسجلات المؤسسية.',
  suggested_profile = 'Attorney / governance professional', suggested_profile_ar = 'محامٍ / مختص حوكمة'
  where role_title = 'Secretary';

update public.team_members set seat_status = 'open',
  duties = 'Advises on incorporation, contracts, governance, compliance, conflicts of interest, and legal risk.',
  duties_ar = 'يقدم المشورة في التأسيس والعقود والحوكمة والامتثال وتضارب المصالح والمخاطر القانونية.',
  suggested_profile = 'Licensed attorney; nonprofit or corporate-governance experience preferred', suggested_profile_ar = 'محامٍ مرخّص؛ تُفضَّل خبرة في الجمعيات أو حوكمة الشركات'
  where role_title = 'General Counsel';

update public.team_members set seat_status = 'candidate',
  duties = 'Leads membership growth, corporate outreach, business recruitment, strategic partnerships, and chamber expansion.',
  duties_ar = 'يقود نمو العضوية والتواصل مع الشركات واستقطاب الأعمال والشراكات الاستراتيجية وتوسع الغرفة.',
  suggested_profile = 'MBA / chamber professional / business-development executive', suggested_profile_ar = 'ماجستير إدارة أعمال / مختص غرف تجارية / تنفيذي تطوير أعمال'
  where role_title = 'Director – Business Development & Chamber Growth';

update public.team_members set seat_status = 'open',
  duties = 'Develops U.S.–Algeria trade opportunities, investor connections, market-access programs, and trade delegations.',
  duties_ar = 'يطور فرص التجارة بين أمريكا والجزائر وصلات المستثمرين وبرامج النفاذ إلى الأسواق والوفود التجارية.',
  suggested_profile = 'Trade, investment, banking, export, or economic-development leader', suggested_profile_ar = 'قيادي في التجارة أو الاستثمار أو البنوك أو التصدير أو التنمية الاقتصادية'
  where role_title = 'Director – Trade & Investment';

update public.team_members set seat_status = 'candidate',
  duties = 'Builds relationships with chambers, institutions, embassies, universities, and international partners; leads global events, summits, delegations, and protocol.',
  duties_ar = 'يبني العلاقات مع الغرف والمؤسسات والسفارات والجامعات والشركاء الدوليين؛ يقود الفعاليات العالمية والقمم والوفود والبروتوكول.',
  suggested_profile = 'International relations / global-events leader', suggested_profile_ar = 'قيادي علاقات دولية / فعاليات عالمية'
  where role_title = 'Director – International Relations, Partnerships & Global Events';

update public.team_members set seat_status = 'open',
  duties = 'Develops technology, startup, AI, research, and digital-transformation partnerships.',
  duties_ar = 'يطور شراكات التكنولوجيا والشركات الناشئة والذكاء الاصطناعي والبحث والتحول الرقمي.',
  suggested_profile = 'Technology executive / founder / researcher', suggested_profile_ar = 'تنفيذي تقني / مؤسس / باحث'
  where role_title = 'Director – Technology, Innovation & AI';

update public.team_members set seat_status = 'open',
  duties = 'Builds partnerships across oil and gas, renewable energy, manufacturing, construction, and infrastructure.',
  duties_ar = 'يبني شراكات في النفط والغاز والطاقة المتجددة والتصنيع والبناء والبنية التحتية.',
  suggested_profile = 'Energy or industrial executive', suggested_profile_ar = 'تنفيذي في الطاقة أو الصناعة'
  where role_title = 'Director – Energy, Industry & Infrastructure';

update public.team_members set seat_status = 'candidate',
  duties = 'Engages physicians, pharmacists, hospitals, pharmaceutical companies, researchers, and healthcare organizations.',
  duties_ar = 'يستقطب الأطباء والصيادلة والمستشفيات وشركات الأدوية والباحثين ومؤسسات الرعاية الصحية.',
  suggested_profile = 'Physician / pharmacist / healthcare executive', suggested_profile_ar = 'طبيب / صيدلي / تنفيذي رعاية صحية'
  where role_title = 'Director – Healthcare & Life Sciences';

update public.team_members set seat_status = 'open',
  duties = 'Leads founder support, mentorship, small-business education, accelerators, and entrepreneurship programs.',
  duties_ar = 'يقود دعم المؤسسين والإرشاد وتعليم الأعمال الصغيرة والمسرعات وبرامج ريادة الأعمال.',
  suggested_profile = 'Entrepreneur / small-business leader', suggested_profile_ar = 'رائد أعمال / قائد أعمال صغيرة'
  where role_title = 'Director – Entrepreneurship & Small Business';

update public.team_members set seat_status = 'open',
  duties = 'Strengthens member engagement, community outreach, regional chapters, retention, and volunteer participation.',
  duties_ar = 'يعزز تفاعل الأعضاء والتواصل المجتمعي والفروع الإقليمية والاحتفاظ بالأعضاء ومشاركة المتطوعين.',
  suggested_profile = 'Well-connected community leader', suggested_profile_ar = 'قائد مجتمعي واسع العلاقات'
  where role_title = 'Director – Membership & Community Development';

update public.team_members set seat_status = 'open',
  duties = 'Sets brand, public-relations, media, storytelling, and public-engagement strategy.',
  duties_ar = 'يضع استراتيجية العلامة والعلاقات العامة والإعلام وسرد القصص والتفاعل العام.',
  suggested_profile = 'Marketing / communications / media executive', suggested_profile_ar = 'تنفيذي تسويق / اتصالات / إعلام'
  where role_title = 'Director – Marketing, Media & Public Engagement';

update public.team_members set seat_status = 'open',
  duties = 'Develops sponsorship packages, institutional relationships, corporate support, and revenue-generating partnerships.',
  duties_ar = 'يطور باقات الرعاية والعلاقات المؤسسية ودعم الشركات والشراكات المدرة للإيرادات.',
  suggested_profile = 'Sponsorship / fundraising / partnerships executive', suggested_profile_ar = 'تنفيذي رعايات / جمع تمويل / شراكات'
  where role_title = 'Director – Sponsorships & Institutional Advancement';

update public.team_members set seat_status = 'future',
  duties = 'Runs daily operations and executes the strategy approved by the Board.',
  duties_ar = 'يدير العمليات اليومية وينفذ الاستراتيجية المعتمدة من المجلس.',
  suggested_profile = 'Nonprofit or chamber executive', suggested_profile_ar = 'تنفيذي جمعيات أو غرف تجارية'
  where role_title = 'Executive Director';

update public.team_members set seat_status = 'open',
  duties = 'Manages administration, workflows, vendors, internal processes, and organizational efficiency.',
  duties_ar = 'يدير الشؤون الإدارية وسير العمل والموردين والعمليات الداخلية والكفاءة التنظيمية.',
  suggested_profile = 'Operations manager', suggested_profile_ar = 'مدير عمليات'
  where role_title = 'Director of Operations';

update public.team_members set seat_status = 'open',
  duties = 'Manages member onboarding, benefits, renewals, engagement, and chapter support.',
  duties_ar = 'يدير انضمام الأعضاء والمزايا والتجديدات والتفاعل ودعم الفروع.',
  suggested_profile = 'Membership or community professional', suggested_profile_ar = 'مختص عضوية أو مجتمع'
  where role_title = 'Director of Membership & Community';

update public.team_members set seat_status = 'open',
  duties = 'Plans and executes conferences, webinars, networking events, trade missions, and member programs.',
  duties_ar = 'يخطط وينفذ المؤتمرات والندوات وفعاليات التواصل والبعثات التجارية وبرامج الأعضاء.',
  suggested_profile = 'Events and programs professional', suggested_profile_ar = 'مختص فعاليات وبرامج'
  where role_title = 'Director of Events & Programs';

update public.team_members set seat_status = 'open',
  duties = 'Manages press releases, newsletters, media relations, official announcements, and external communications.',
  duties_ar = 'يدير البيانات الصحفية والنشرات والعلاقات الإعلامية والإعلانات الرسمية والاتصال الخارجي.',
  suggested_profile = 'Communications / PR professional', suggested_profile_ar = 'مختص اتصالات / علاقات عامة'
  where role_title = 'Director of Communications & Public Relations';

update public.team_members set seat_status = 'open',
  duties = 'Manages LinkedIn, Facebook, Instagram, X, YouTube, TikTok, content calendars, daily posting, engagement, and analytics.',
  duties_ar = 'يدير لينكدإن وفيسبوك وإنستغرام وإكس ويوتيوب وتيك توك وتقويم المحتوى والنشر اليومي والتفاعل والتحليلات.',
  suggested_profile = 'Social-media manager / digital-content professional', suggested_profile_ar = 'مدير وسائل تواصل / مختص محتوى رقمي'
  where role_title = 'Director of Social Media & Digital Engagement';

update public.team_members set seat_status = 'open',
  duties = 'Executes partner outreach, sponsor acquisition, proposals, and relationship management.',
  duties_ar = 'ينفذ التواصل مع الشركاء واستقطاب الرعاة وإعداد العروض وإدارة العلاقات.',
  suggested_profile = 'Partnerships or sales professional', suggested_profile_ar = 'مختص شراكات أو مبيعات'
  where role_title = 'Director of Partnerships & Sponsorships';

update public.team_members set seat_status = 'open',
  duties = 'Oversees the website, CRM, member portal, data systems, cybersecurity, and digital tools.',
  duties_ar = 'يشرف على الموقع وإدارة علاقات الأعضاء وبوابة الأعضاء وأنظمة البيانات والأمن السيبراني والأدوات الرقمية.',
  suggested_profile = 'IT / digital-product leader', suggested_profile_ar = 'قائد تقنية معلومات / منتجات رقمية'
  where role_title = 'Director of Technology & Digital Platforms';

update public.team_members set seat_status = 'open',
  duties = 'Coordinates volunteers, local ambassadors, regional chapters, and community activities.',
  duties_ar = 'ينسق المتطوعين والسفراء المحليين والفروع الإقليمية والأنشطة المجتمعية.',
  suggested_profile = 'Community organizer / coordinator', suggested_profile_ar = 'منظم / منسق مجتمعي'
  where role_title = 'Volunteer & Chapter Coordinator';

update public.team_members set seat_status = 'open',
  duties = 'Provides strategic guidance on public institutions, government relations, policy, and stakeholder engagement.',
  duties_ar = 'يقدم توجيهاً استراتيجياً حول المؤسسات العامة والعلاقات الحكومية والسياسات وإشراك أصحاب المصلحة.',
  suggested_profile = 'Former official / public-affairs leader', suggested_profile_ar = 'مسؤول سابق / قائد شؤون عامة'
  where role_title = 'Senior Advisor – Government & Public Affairs';

update public.team_members set seat_status = 'open',
  duties = 'Provides guidance on investment strategy, finance, capital access, and investor engagement.',
  duties_ar = 'يقدم التوجيه في استراتيجية الاستثمار والمال والوصول إلى رأس المال وإشراك المستثمرين.',
  suggested_profile = 'Investor / banker / finance executive', suggested_profile_ar = 'مستثمر / مصرفي / تنفيذي مالي'
  where role_title = 'Senior Advisor – Investment & Finance';

update public.team_members set seat_status = 'open',
  duties = 'Advises on university, research, education, and knowledge-exchange partnerships.',
  duties_ar = 'يقدم المشورة في شراكات الجامعات والبحث والتعليم وتبادل المعرفة.',
  suggested_profile = 'Professor / academic leader', suggested_profile_ar = 'أستاذ / قائد أكاديمي'
  where role_title = 'Senior Advisor – Academic & Research Partnerships';

update public.team_members set seat_status = 'open',
  duties = 'Supports public visibility, storytelling, media reach, and community influence.',
  duties_ar = 'يدعم الحضور العام وسرد القصص والانتشار الإعلامي والتأثير المجتمعي.',
  suggested_profile = 'Influencer / media personality / public figure', suggested_profile_ar = 'مؤثر / شخصية إعلامية / شخصية عامة'
  where role_title = 'Senior Advisor – Media & Public Influence';

update public.team_members set seat_status = 'open',
  duties = 'Advises on air connectivity, logistics, transportation, and related advocacy initiatives.',
  duties_ar = 'يقدم المشورة في الربط الجوي واللوجستيات والنقل ومبادرات المناصرة ذات الصلة.',
  suggested_profile = 'Airline / logistics / transportation executive', suggested_profile_ar = 'تنفيذي طيران / لوجستيات / نقل'
  where role_title = 'Senior Advisor – Aviation & Transportation';

-- Chamber Ambassadors (new level) ---------------------------------------------------
insert into public.team_members
  (role_title, role_title_ar, duties, duties_ar, suggested_profile, suggested_profile_ar, tier, sort_order, published, seat_status)
select v.* from (values
  ('National Ambassador', 'السفير الوطني',
   'Represents AACC-USA nationally; promotes major initiatives; recruits strategic members and partners; supports visibility and outreach.',
   'يمثل الغرفة على المستوى الوطني؛ يروج للمبادرات الكبرى؛ يستقطب أعضاء وشركاء استراتيجيين؛ يدعم الحضور والتواصل.',
   'Recognized national leader / influencer / executive', 'قيادة وطنية معروفة / مؤثر / تنفيذي', 'ambassadors', 40, true, 'open'),
  ('State Ambassador', 'سفير الولاية',
   'Represents AACC-USA within a state; grows membership; develops local partnerships; supports events and local outreach.',
   'يمثل الغرفة داخل الولاية؛ ينمي العضوية؛ يطور الشراكات المحلية؛ يدعم الفعاليات والتواصل المحلي.',
   'Well-connected business or community leader', 'قائد أعمال أو مجتمع واسع العلاقات', 'ambassadors', 41, true, 'open'),
  ('Industry Ambassador – Technology & AI', 'سفير قطاع التكنولوجيا والذكاء الاصطناعي',
   'Promotes AACC-USA within the technology and AI ecosystem and connects relevant companies, founders, and professionals.',
   'يروج للغرفة في منظومة التكنولوجيا والذكاء الاصطناعي ويصل الشركات والمؤسسين والمهنيين المعنيين.',
   'Technology leader / founder / researcher', 'قائد تقني / مؤسس / باحث', 'ambassadors', 42, true, 'open'),
  ('Industry Ambassador – Healthcare & Life Sciences', 'سفير قطاع الرعاية الصحية وعلوم الحياة',
   'Connects healthcare professionals, institutions, pharmaceutical organizations, and researchers.',
   'يصل مهنيي الرعاية الصحية والمؤسسات وشركات الأدوية والباحثين.',
   'Physician / pharmacist / healthcare leader', 'طبيب / صيدلي / قائد رعاية صحية', 'ambassadors', 43, true, 'open'),
  ('Industry Ambassador – Energy & Industry', 'سفير قطاع الطاقة والصناعة',
   'Engages energy, manufacturing, infrastructure, and industrial organizations.',
   'يستقطب مؤسسات الطاقة والتصنيع والبنية التحتية والصناعة.',
   'Energy or industrial professional', 'مختص طاقة أو صناعة', 'ambassadors', 44, true, 'open'),
  ('Industry Ambassador – Entrepreneurship & Small Business', 'سفير قطاع ريادة الأعمال والأعمال الصغيرة',
   'Supports outreach to founders, startups, and small-business owners.',
   'يدعم التواصل مع المؤسسين والشركات الناشئة وأصحاب الأعمال الصغيرة.',
   'Entrepreneur / ecosystem builder', 'رائد أعمال / باني منظومات', 'ambassadors', 45, true, 'open'),
  ('University Ambassador', 'السفير الجامعي',
   'Builds connections with universities, students, researchers, alumni, and academic organizations.',
   'يبني الصلات مع الجامعات والطلبة والباحثين والخريجين والمنظمات الأكاديمية.',
   'Professor / researcher / student leader', 'أستاذ / باحث / قائد طلابي', 'ambassadors', 46, true, 'open')
) as v(role_title, role_title_ar, duties, duties_ar, suggested_profile, suggested_profile_ar, tier, sort_order, published, seat_status)
where not exists (
  select 1 from public.team_members t where t.role_title = v.role_title
);

-- Role applications -----------------------------------------------------------------
create table if not exists public.role_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role_id uuid references public.team_members (id) on delete set null,
  role_title text not null,
  name text not null,
  email text not null,
  phone text,
  linkedin text,
  city_state text,
  motivation text not null,
  background text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'approved', 'declined')),
  locale text not null default 'en',
  unique (role_title, email)
);

comment on table public.role_applications is 'Applications for open organization roles, reviewed in the admin Role Applications tab';

alter table public.role_applications enable row level security;

create policy "Public can apply for roles"
  on public.role_applications for insert to anon with check (true);
create policy "Signed-in can apply for roles"
  on public.role_applications for insert to authenticated with check (true);
create policy "Staff can read role applications"
  on public.role_applications for select to authenticated using (public.is_staff());
create policy "Staff can update role applications"
  on public.role_applications for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "Admin can delete role applications"
  on public.role_applications for delete to authenticated using (public.is_admin());
