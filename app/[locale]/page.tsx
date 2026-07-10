import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import SectionHeading from "@/components/SectionHeading";
import ProgramCard from "@/components/ProgramCard";
import MembershipTierCard from "@/components/MembershipTierCard";
import CTASection from "@/components/CTASection";
import LogoCloud from "@/components/LogoCloud";
import Icon from "@/components/Icon";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const home = dict.home;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <HeroSection locale={locale} hero={home.hero} />
      <StatsSection stats={home.stats} />

      {/* Mission snapshot */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={home.mission.eyebrow}
            title={home.mission.title}
            description={home.mission.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.mission.cards.map((card) => (
              <div
                key={card.title}
                className="group rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                  <Icon name={card.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AACC-USA */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow={home.why.eyebrow}
                title={home.why.title}
                description={home.why.description}
                align="left"
              />
              <div className="mt-10 space-y-7">
                {home.why.points.map((point, index) => (
                  <div key={point.title} className="flex gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-sm font-bold text-gold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-navy">{point.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-navy p-10 text-white lg:p-14">
              <Image
                src="/images/hero-bridge.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-navy-900/60" aria-hidden="true" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
                  {home.why.panel.label}
                </p>
                <p className="mt-6 font-heading text-2xl font-bold leading-snug lg:text-3xl">
                  &ldquo;{home.why.panel.quote}&rdquo;
                </p>
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/20 pt-8">
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-gold">
                      {home.why.panel.usa}
                    </p>
                    <p className="mt-1 text-sm text-navy-100">{home.why.panel.usaDesc}</p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-gold">
                      {home.why.panel.algeria}
                    </p>
                    <p className="mt-1 text-sm text-navy-100">{home.why.panel.algeriaDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key sectors */}
      <section className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24">
        <Image
          src="/images/energy-industry.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-navy-900/70" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={home.sectors.eyebrow}
            title={home.sectors.title}
            description={home.sectors.description}
            dark
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.sectors.items.map((sector) => (
              <div
                key={sector.title}
                className="glass-dark rounded-2xl p-7 transition-colors hover:border-gold/50"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold">
                  <Icon name={sector.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold">{sector.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-100">{sector.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={home.services.eyebrow}
            title={home.services.title}
            description={home.services.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.services.items.map((service) => (
              <Link
                key={service.title}
                href={p(service.href)}
                className="group rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy transition-colors group-hover:bg-navy group-hover:text-gold">
                  <Icon name={service.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-green-600">
                  {dict.common.learnMore} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Diaspora spotlight teaser */}
      <section className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24">
        <Image
          src="/images/diaspora-connect.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-navy-900/65" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={home.diaspora.eyebrow}
            title={home.diaspora.title}
            description={home.diaspora.description}
            dark
          />
          <Link
            href={p("/diaspora")}
            className="mt-10 inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400"
          >
            {home.diaspora.cta}
          </Link>
        </div>
      </section>

      {/* Featured programs */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={home.programs.eyebrow}
            title={home.programs.title}
            description={home.programs.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dict.programs.items.slice(0, 6).map((program) => (
              <ProgramCard
                key={program.slug}
                program={program}
                contactHref={p("/contact?inquiry=general")}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href={p("/programs")}
              className="inline-block rounded-lg border border-navy-200 px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-surface"
            >
              {home.programs.viewAll}
            </Link>
          </div>
        </div>
      </section>

      {/* Membership preview */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={home.membershipPreview.eyebrow}
            title={home.membershipPreview.title}
            description={home.membershipPreview.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {dict.membership.tiers.map((tier) => (
              <MembershipTierCard
                key={tier.slug}
                tier={tier}
                href={p(`/contact?inquiry=membership&tier=${tier.slug}`)}
                mostPopular={dict.common.mostPopular}
                pricingNote={dict.common.placeholderPricing}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LogoCloud
            title={home.logoCloud}
            note={home.logoCloudNote}
            ctaLabel={home.logoCloudCta}
            ctaHref={p("/sponsors")}
          />
        </div>
      </section>

      <CTASection
        title={home.finalCta.title}
        description={home.finalCta.description}
        primaryLabel={home.finalCta.primary}
        primaryHref={p("/membership")}
        secondaryLabel={home.finalCta.secondary}
        secondaryHref={p("/sponsors")}
        image="/images/trade-port.jpg"
      />
    </>
  );
}
