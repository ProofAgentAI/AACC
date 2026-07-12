-- AACC-USA schema v19: database-managed team (Our Team page + admin Team tab).
-- Run AFTER the previous schema files (through v18), once, in the Supabase SQL Editor.

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  name_ar text,
  role_title text not null,
  role_title_ar text,
  tier text not null default 'team' check (tier in ('executive', 'board', 'team')),
  photo_url text,
  bio text,
  bio_ar text,
  linkedin text,
  sort_order integer not null default 100,
  published boolean not null default true
);

comment on table public.team_members is 'Chamber leadership and team shown on the public Our Team page; managed from the admin Team tab';

alter table public.team_members enable row level security;

-- The public team page shows published members; staff see everything;
-- only the administrator adds, edits, or removes members.
create policy "Public can view published team members"
  on public.team_members for select to anon using (published = true);
create policy "Staff read team, members read published"
  on public.team_members for select to authenticated
  using (public.is_staff() or published = true);
create policy "Admin can add team members"
  on public.team_members for insert to authenticated with check (public.is_admin());
create policy "Admin can edit team members"
  on public.team_members for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete team members"
  on public.team_members for delete to authenticated using (public.is_admin());

-- Public bucket for team photos: anyone can view, the administrator uploads.
insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do nothing;

create policy "Public can view team photos"
  on storage.objects for select to public using (bucket_id = 'team-photos');
create policy "Admin can upload team photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'team-photos' and public.is_admin());
create policy "Admin can update team photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'team-photos' and public.is_admin())
  with check (bucket_id = 'team-photos' and public.is_admin());
create policy "Admin can delete team photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'team-photos' and public.is_admin());

-- Seed the president so the page is complete from day one.
insert into public.team_members
  (name, name_ar, role_title, role_title_ar, tier, photo_url, bio, bio_ar, linkedin, sort_order)
values (
  'Dr. Fouad Bousetouane',
  'د. فؤاد بوستوان',
  'President & Founder',
  'الرئيس والمؤسس',
  'executive',
  '/images/team/fouad-bousetouane.png',
  'Dr. Fouad Bousetouane is a distinguished AI leader, innovator, author, investor, and entrepreneur specializing in enterprise AI, AI governance, and deep tech. He is the founder of ProofAgent.AI, a company specialized in AI governance, an adjunct associate professor of Generative AI at the University of Chicago, and the author of the book AI Agents for Everyone. He is also a member of Algeria''s Higher Council of Artificial Intelligence.

He holds a Ph.D. accredited by the University of Nevada, Las Vegas, has authored more than 50 AI publications, patents, and trade secrets, and has led AI transformation initiatives for Fortune 500 organizations.

A strong advocate for the responsible adoption of AI, he is a frequent keynote speaker, researcher, and educator, helping organizations and future leaders build trustworthy, scalable, and business-ready AI systems.

Recognition: Timmy Award — Best Tech Manager, Chicago · Top 30 AI Scientists — MIT Technology Review · Marquis Emerging Leaders, United States · Fortune''s America''s Most Innovative Teams · Judge, AWS Generative AI Awards.',
  'الدكتور فؤاد بوستوان قائد بارز في مجال الذكاء الاصطناعي ومبتكر ومؤلف ومستثمر ورائد أعمال، متخصص في الذكاء الاصطناعي المؤسسي وحوكمة الذكاء الاصطناعي والتقنيات العميقة. وهو مؤسس شركة ProofAgent.AI المتخصصة في حوكمة الذكاء الاصطناعي، وأستاذ مساعد مشارك للذكاء الاصطناعي التوليدي في جامعة شيكاغو، ومؤلف كتاب AI Agents for Everyone. وهو أيضاً عضو المجلس الأعلى للذكاء الاصطناعي في الجزائر.

حاصل على درجة الدكتوراه المعتمدة من جامعة نيفادا في لاس فيغاس، وله أكثر من 50 منشوراً علمياً وبراءة اختراع وسراً تجارياً في مجال الذكاء الاصطناعي، وقاد مبادرات التحول بالذكاء الاصطناعي لمؤسسات ضمن قائمة Fortune 500.

بوصفه مدافعاً قوياً عن التبني المسؤول للذكاء الاصطناعي، فهو متحدث رئيسي وباحث ومعلّم، يساعد المؤسسات وقادة المستقبل على بناء أنظمة ذكاء اصطناعي موثوقة وقابلة للتوسع وجاهزة للأعمال.

التكريمات: جائزة Timmy — أفضل مدير تقني في شيكاغو · ضمن أفضل 30 عالِم ذكاء اصطناعي — MIT Technology Review · قادة Marquis الصاعدون، الولايات المتحدة · فرق Fortune الأكثر ابتكاراً في أمريكا · محكّم في جوائز AWS للذكاء الاصطناعي التوليدي.',
  'https://www.linkedin.com/in/fouad-bousetouane-ph-d-83382614/',
  1
);
