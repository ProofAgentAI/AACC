import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import MembershipTierCard from "@/components/MembershipTierCard";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.membership.hero.title, description: dict.membership.hero.description };
}

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const m = dict.membership;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero
        eyebrow={m.hero.eyebrow}
        title={m.hero.title}
        description={m.hero.description}
        image="/images/diaspora-connect.jpg"
      />

      {/* Why join */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={m.whyJoin.eyebrow}
            title={m.whyJoin.title}
            description={m.whyJoin.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {m.whyJoin.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-navy">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={m.tiersSection.eyebrow}
            title={m.tiersSection.title}
            description={m.tiersSection.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {m.tiers.map((tier) => (
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

      {/* Membership form */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={m.form.eyebrow}
            title={m.form.title}
            description={m.form.description}
          />
          <div className="mt-12 rounded-3xl border border-navy-100 bg-surface p-8 sm:p-10">
            <ContactForm dict={dict.form} showInquiryType={false} submitLabel={m.form.submitLabel} />
          </div>
        </div>
      </section>
    </>
  );
}
