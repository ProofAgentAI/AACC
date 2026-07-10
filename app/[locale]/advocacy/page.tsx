import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import { FileText } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.advocacy.hero.title, description: dict.advocacy.hero.description };
}

export default async function AdvocacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const a = dict.advocacy;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero eyebrow={a.hero.eyebrow} title={a.hero.title} description={a.hero.description} />

      {/* Priorities */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={a.priorities.eyebrow}
            title={a.priorities.title}
            description={a.priorities.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {a.priorities.items.map((priority) => (
              <div
                key={priority.title}
                className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy">
                  <Icon name={priority.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">
                  {priority.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{priority.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy briefs */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={a.briefs.eyebrow}
            title={a.briefs.title}
            description={a.briefs.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {a.briefs.items.map((brief) => (
              <article
                key={brief.title}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-8 shadow-card"
              >
                <FileText className="h-8 w-8 text-gold" aria-hidden="true" />
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{brief.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{brief.summary}</p>
                <span className="mt-6 inline-block self-start rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                  {a.briefs.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Submit an issue */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={a.submit.eyebrow}
            title={a.submit.title}
            description={a.submit.description}
          />
          <div className="mt-12 rounded-3xl border border-navy-100 bg-surface p-8 sm:p-10">
            <ContactForm dict={dict.form} defaultInquiry="general" submitLabel={a.submit.submitLabel} />
          </div>
        </div>
      </section>

      <CTASection
        title={a.cta.title}
        description={a.cta.description}
        primaryLabel={a.cta.primary}
        primaryHref={p("/membership")}
        secondaryLabel={a.cta.secondary}
        secondaryHref={p("/news")}
      />
    </>
  );
}
