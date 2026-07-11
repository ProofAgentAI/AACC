import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { Award } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.sponsors.hero.title, description: dict.sponsors.hero.description };
}

export default async function SponsorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const s = dict.sponsors;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero
        eyebrow={s.hero.eyebrow}
        title={s.hero.title}
        description={s.hero.description}
        image="/images/hero-bridge.jpg"
      />

      {/* Sponsorship packages: coming soon */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-navy-200 bg-white p-12 text-center shadow-card sm:p-16">
            <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
              <Award className="h-8 w-8" aria-hidden="true" />
            </span>
            <span className="mt-6 inline-block rounded-full bg-gold-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
              {dict.common.comingSoon}
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold text-navy sm:text-3xl">
              {s.coming.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              {s.coming.text}
            </p>
            <Link
              href={p("/contact?inquiry=sponsorship")}
              className="mt-8 inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400"
            >
              {s.coming.cta}
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title={s.cta.title}
        description={s.cta.description}
        primaryLabel={s.cta.primary}
        primaryHref={p("/contact?inquiry=sponsorship")}
        secondaryLabel={s.cta.secondary}
        secondaryHref="mailto:contact@aacc-usa.org"
        image="/images/hero-monuments.jpg"
      />
    </>
  );
}
