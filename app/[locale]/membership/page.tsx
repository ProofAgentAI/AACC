import type { Metadata } from "next";
import { Check, Handshake, Award } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import MembershipTierCard from "@/components/MembershipTierCard";
import EarlyMembershipForm from "@/components/EarlyMembershipForm";
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
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {m.tiers.map((tier) => (
              <MembershipTierCard
                key={tier.slug}
                tier={tier}
                href="#early-list"
                mostPopular={dict.common.mostPopular}
                comingSoon={dict.common.comingSoon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Early membership list */}
      <section id="early-list" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <SectionHeading
                eyebrow={m.early.eyebrow}
                title={m.early.title}
                description={m.early.description}
                align="left"
              />
              <ul className="mt-8 space-y-4">
                {m.early.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-base leading-relaxed text-ink">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-navy-100 bg-surface p-8 sm:p-10">
                <EarlyMembershipForm locale={locale} dict={m.early} formDict={dict.form} />
              </div>
            </div>
          </div>

          {/* Partner and sponsor tracks */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-5 rounded-2xl border border-dashed border-navy-200 bg-surface p-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
                <Handshake className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-heading text-lg font-bold text-navy">
                    {m.early.partnerTitle}
                  </h3>
                  <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                    {dict.common.comingSoon}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.early.partnerText}</p>
              </div>
            </div>
            <div className="flex items-start gap-5 rounded-2xl border border-dashed border-navy-200 bg-surface p-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <Award className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-heading text-lg font-bold text-navy">
                    {m.early.sponsorTitle}
                  </h3>
                  <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                    {dict.common.comingSoon}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{m.early.sponsorText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
