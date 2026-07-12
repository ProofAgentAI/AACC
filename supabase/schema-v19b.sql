-- AACC-USA schema v19b: upgrade the seeded president bio to HTML.
-- For projects that already ran the original schema-v19.sql (the table,
-- policies, and bucket exist). Run once in the Supabase SQL Editor.
-- Safe to re-run: it only updates (or re-inserts) the president's row.

do $$
declare
  bio_en text := '<p>Dr. Fouad Bousetouane is a distinguished AI leader, innovator, author, investor, and entrepreneur specializing in enterprise AI, AI governance, and deep tech. He is the founder of ProofAgent.AI, a company specialized in AI governance, an adjunct associate professor of Generative AI at the University of Chicago, and the author of the book <em>AI Agents for Everyone</em>. He is also a member of Algeria''s Higher Council of Artificial Intelligence.</p>
<p>He holds a Ph.D. accredited by the University of Nevada, Las Vegas, has authored more than 50 AI publications, patents, and trade secrets, and has led AI transformation initiatives for Fortune 500 organizations.</p>
<p>A strong advocate for the responsible adoption of AI, he is a frequent keynote speaker, researcher, and educator, helping organizations and future leaders build trustworthy, scalable, and business-ready AI systems.</p>
<h3>Recognition</h3>
<ul>
<li>Timmy Award — Best Tech Manager, Chicago</li>
<li>Top 30 AI Scientists — MIT Technology Review</li>
<li>Marquis Emerging Leaders, United States</li>
<li>Fortune''s America''s Most Innovative Teams</li>
<li>Judge, AWS Generative AI Awards</li>
</ul>';
  bio_arabic text := '<p>الدكتور فؤاد بوستوان قائد بارز في مجال الذكاء الاصطناعي ومبتكر ومؤلف ومستثمر ورائد أعمال، متخصص في الذكاء الاصطناعي المؤسسي وحوكمة الذكاء الاصطناعي والتقنيات العميقة. وهو مؤسس شركة ProofAgent.AI المتخصصة في حوكمة الذكاء الاصطناعي، وأستاذ مساعد مشارك للذكاء الاصطناعي التوليدي في جامعة شيكاغو، ومؤلف كتاب <em>AI Agents for Everyone</em>. وهو أيضاً عضو المجلس الأعلى للذكاء الاصطناعي في الجزائر.</p>
<p>حاصل على درجة الدكتوراه المعتمدة من جامعة نيفادا في لاس فيغاس، وله أكثر من 50 منشوراً علمياً وبراءة اختراع وسراً تجارياً في مجال الذكاء الاصطناعي، وقاد مبادرات التحول بالذكاء الاصطناعي لمؤسسات ضمن قائمة Fortune 500.</p>
<p>بوصفه مدافعاً قوياً عن التبني المسؤول للذكاء الاصطناعي، فهو متحدث رئيسي وباحث ومعلّم، يساعد المؤسسات وقادة المستقبل على بناء أنظمة ذكاء اصطناعي موثوقة وقابلة للتوسع وجاهزة للأعمال.</p>
<h3>التكريمات</h3>
<ul>
<li>جائزة Timmy — أفضل مدير تقني في شيكاغو</li>
<li>ضمن أفضل 30 عالِم ذكاء اصطناعي — MIT Technology Review</li>
<li>قادة Marquis الصاعدون، الولايات المتحدة</li>
<li>فرق Fortune الأكثر ابتكاراً في أمريكا</li>
<li>محكّم في جوائز AWS للذكاء الاصطناعي التوليدي</li>
</ul>';
begin
  update public.team_members
     set bio = bio_en,
         bio_ar = bio_arabic,
         updated_at = now()
   where name = 'Dr. Fouad Bousetouane';

  if not found then
    insert into public.team_members
      (name, name_ar, role_title, role_title_ar, tier, photo_url, bio, bio_ar, linkedin, sort_order)
    values
      ('Dr. Fouad Bousetouane', 'د. فؤاد بوستوان', 'President & Founder', 'الرئيس والمؤسس',
       'executive', '/images/team/fouad-bousetouane.png', bio_en, bio_arabic,
       'https://www.linkedin.com/in/fouad-bousetouane-ph-d-83382614/', 1);
  end if;
end $$;
