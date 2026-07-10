import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import CTASection from "@/components/CTASection";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.directory.hero.title, description: dict.directory.hero.description };
}

export default async function DirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const d = dict.directory;
  const p = (href: string) => `/${locale}${href}`;

  return (
    <>
      <PageHero
        eyebrow={d.hero.eyebrow}
        title={d.hero.title}
        description={d.hero.description}
        image="/images/trade-port.jpg"
      />

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DirectoryExplorer locale={locale} dict={d.explorer} />
        </div>
      </section>

      <CTASection
        title={d.cta.title}
        description={d.cta.description}
        primaryLabel={d.cta.primary}
        primaryHref={p("/directory/submit")}
        secondaryLabel={d.cta.secondary}
        secondaryHref={p("/membership")}
        image="/images/energy-industry.jpg"
      />
    </>
  );
}
