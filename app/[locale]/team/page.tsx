import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import TeamDirectory from "@/components/TeamDirectory";
import BoardApplyModal from "@/components/BoardApplyModal";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.team.hero.title, description: dict.team.hero.description };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const team = dict.team;

  return (
    <>
      <PageHero
        eyebrow={team.hero.eyebrow}
        title={team.hero.title}
        description={team.hero.description}
        image="/images/diaspora-connect.jpg"
      />

      {/* Intro */}
      <section className="bg-white pb-4 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl space-y-5 px-4 text-center sm:px-6 lg:px-8">
          {team.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-ink sm:text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Directory */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TeamDirectory
            locale={locale}
            dict={team}
            leadership={dict.about.leadership}
            comingSoon={dict.common.comingSoon}
          />
        </div>
      </section>

      {/* Join the founding board */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-navy">{team.applyTitle}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{team.applyText}</p>
          <div className="mt-8">
            <BoardApplyModal
              locale={locale}
              dict={dict.about.board}
              formDict={dict.form}
              buttonLabel={dict.about.leadership.applyCta}
            />
          </div>
        </div>
      </section>
    </>
  );
}
