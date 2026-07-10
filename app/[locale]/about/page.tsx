import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import LeadershipCard from "@/components/LeadershipCard";
import BoardApplicationForm from "@/components/BoardApplicationForm";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.about.hero.title, description: dict.about.hero.description };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const about = dict.about;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        description={about.hero.description}
        image="/images/hero-bridge.jpg"
      />

      {/* Mission & Vision */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-navy-100 bg-surface p-10 lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-600">
                {about.missionLabel}
              </p>
              <p className="mt-5 font-heading text-2xl font-bold leading-snug text-navy">
                {about.mission}
              </p>
            </div>
            <div className="rounded-3xl bg-navy p-10 text-white lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
                {about.visionLabel}
              </p>
              <p className="mt-5 font-heading text-2xl font-bold leading-snug">{about.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our role */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <SectionHeading eyebrow={about.role.eyebrow} title={about.role.title} align="left" />
            <div className="space-y-6 text-base leading-relaxed text-ink">
              <p>{about.role.para1}</p>
              <p>{about.role.para2}</p>
              <p className="rounded-xl border border-gold/40 bg-gold-100/50 p-5 text-sm">
                {about.role.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder message */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy to-navy-600 p-10 text-center text-white sm:p-14">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
              {about.founder.label}
            </p>
            <blockquote className="mt-6 font-heading text-2xl font-bold leading-snug sm:text-3xl">
              &ldquo;{about.founder.quote}&rdquo;
            </blockquote>
            <p className="mt-8 text-sm font-semibold text-navy-100">{about.founder.attribution}</p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={about.leadership.eyebrow}
            title={about.leadership.title}
            description={about.leadership.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <LeadershipCard
              person={about.leadership.president.name}
              role={about.leadership.president.role}
              description={about.leadership.president.description}
            />
            {about.leadership.roles.map((leader) => (
              <LeadershipCard
                key={leader.role}
                role={leader.role}
                description={leader.description}
                badge={dict.common.comingSoon}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="#board-application"
              className="inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400"
            >
              {about.leadership.applyCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Board application */}
      <section id="board-application" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={about.board.eyebrow}
            title={about.board.title}
            description={about.board.description}
          />
          <div className="mt-12 rounded-3xl border border-navy-100 bg-surface p-8 sm:p-10">
            <BoardApplicationForm locale={locale} dict={about.board} formDict={dict.form} />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={about.values.eyebrow} title={about.values.title} />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.items.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-navy-100 bg-white p-7 shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon name={value.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={about.cta.title}
        description={about.cta.description}
        primaryLabel={about.cta.primary}
        primaryHref={p("/membership")}
        secondaryLabel={about.cta.secondary}
        secondaryHref={p("/contact")}
        image="/images/diaspora-connect.jpg"
      />
    </>
  );
}
