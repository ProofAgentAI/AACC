import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import SponsorTierCard from "@/components/SponsorTierCard";
import CTASection from "@/components/CTASection";
import LogoCloud from "@/components/LogoCloud";
import Icon from "@/components/Icon";
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

      {/* Benefits */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={s.benefits.eyebrow} title={s.benefits.title} />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {s.benefits.items.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-card"
              >
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={s.tiersSection.eyebrow}
            title={s.tiersSection.title}
            description={s.tiersSection.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {s.tiers.map((tier) => (
              <SponsorTierCard
                key={tier.slug}
                tier={tier}
                href={p(`/contact?inquiry=sponsorship&tier=${tier.slug}`)}
                ctaLabel={dict.common.becomeASponsor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Partner types */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={s.partners.eyebrow}
            title={s.partners.title}
            description={s.partners.description}
          />
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {s.partners.types.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-surface p-6 text-center"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-navy shadow-sm">
                  <Icon name={partner.icon} className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-navy">{partner.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-20">
            <LogoCloud
              title={dict.home.logoCloud}
              note={dict.home.logoCloudNote}
              ctaLabel={dict.home.logoCloudCta}
              ctaHref={p("/contact?inquiry=sponsorship")}
            />
          </div>
        </div>
      </section>

      <CTASection
        title={s.cta.title}
        description={s.cta.description}
        primaryLabel={s.cta.primary}
        primaryHref={p("/contact?inquiry=sponsorship")}
        secondaryLabel={s.cta.secondary}
        secondaryHref="mailto:sponsorship@aaccusa.org"
      />
    </>
  );
}
