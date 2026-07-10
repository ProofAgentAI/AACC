import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ProgramCard from "@/components/ProgramCard";
import CTASection from "@/components/CTASection";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.programs.hero.title, description: dict.programs.hero.description };
}

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const pr = dict.programs;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero
        eyebrow={pr.hero.eyebrow}
        title={pr.hero.title}
        description={pr.hero.description}
        image="/images/energy-industry.jpg"
      />

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={pr.section.eyebrow}
            title={pr.section.title}
            description={pr.section.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pr.items.map((program) => (
              <ProgramCard
                key={program.slug}
                program={program}
                contactHref={p("/contact?inquiry=general")}
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={pr.cta.title}
        description={pr.cta.description}
        primaryLabel={pr.cta.primary}
        primaryHref={p("/contact?inquiry=partnership")}
        secondaryLabel={pr.cta.secondary}
        secondaryHref={p("/sponsors")}
        image="/images/hero-monuments.jpg"
      />
    </>
  );
}
