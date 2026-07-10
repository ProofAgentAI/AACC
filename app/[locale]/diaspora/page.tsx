import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import { UserRound, ExternalLink } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.diaspora.hero.title, description: dict.diaspora.hero.description };
}

export default async function DiasporaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const d = dict.diaspora;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        description={d.hero.description}
        image="/images/diaspora-connect.jpg"
      />

      {/* Intro + stats */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow={d.intro.eyebrow} title={d.intro.title} align="left" />
              <div className="mt-6 space-y-5 text-base leading-relaxed text-ink">
                <p>{d.intro.para1}</p>
                <p>{d.intro.para2}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {d.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-navy-100 bg-surface p-6 text-center"
                >
                  <p className="font-heading text-3xl font-extrabold text-navy">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={d.sectors.eyebrow} title={d.sectors.title} />
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {d.sectors.items.map((sector) => (
              <div
                key={sector.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon name={sector.icon} className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-navy">{sector.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24">
        <Image
          src="/images/hero-bridge.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-navy-900/70" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={d.spotlight.eyebrow}
            title={d.spotlight.title}
            description={d.spotlight.description}
            dark
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {d.spotlight.profiles.map((profile) => (
              <article key={profile.name} className="glass-dark flex flex-col rounded-2xl p-8">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-gold">
                  <UserRound className="h-8 w-8" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold">{profile.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {profile.field}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-100">{profile.story}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href={p("/contact?inquiry=media")}
              className="inline-block rounded-lg bg-gold px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-400"
            >
              {d.spotlight.nominate}
            </Link>
          </div>
        </div>
      </section>

      {/* Official resources */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={d.resources.eyebrow}
            title={d.resources.title}
            description={d.resources.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {d.resources.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-navy-100 bg-surface p-8 transition-all hover:-translate-y-0.5 hover:border-green-600/40 hover:shadow-card-hover"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-navy shadow-sm">
                  <Icon name="globe" className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{link.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{link.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  {dict.common.officialWebsite}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted">
            {d.resources.note}
          </p>
        </div>
      </section>

      <CTASection
        title={d.cta.title}
        description={d.cta.description}
        primaryLabel={d.cta.primary}
        primaryHref={p("/membership")}
        secondaryLabel={d.cta.secondary}
        secondaryHref={p("/contact?inquiry=media")}
        image="/images/energy-industry.jpg"
      />
    </>
  );
}
