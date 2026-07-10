import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import EventCard from "@/components/EventCard";
import CTASection from "@/components/CTASection";
import { CalendarClock } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.events.hero.title, description: dict.events.hero.description };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const e = dict.events;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero eyebrow={e.hero.eyebrow} title={e.hero.title} description={e.hero.description} />

      {/* Upcoming */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={e.upcoming.eyebrow}
            title={e.upcoming.title}
            description={e.upcoming.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {e.items.map((event) => (
              <EventCard
                key={event.slug}
                event={event}
                href={p(`/contact?inquiry=event&event=${event.slug}`)}
                registerLabel={dict.common.register}
                virtualLabel={dict.common.virtual}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Past events */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={e.past.eyebrow} title={e.past.title} />
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-navy-200 bg-surface p-14 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
            <h3 className="mt-5 font-heading text-lg font-bold text-navy">{e.past.emptyTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{e.past.emptyText}</p>
            <Link
              href="#newsletter"
              className="mt-6 inline-block rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-white"
            >
              {e.past.emptyCta}
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title={e.cta.title}
        description={e.cta.description}
        primaryLabel={e.cta.primary}
        primaryHref={p("/sponsors")}
        secondaryLabel={e.cta.secondary}
        secondaryHref={p("/contact?inquiry=event")}
      />
    </>
  );
}
