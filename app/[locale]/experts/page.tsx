import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ExpertsDirectory from "@/components/ExpertsDirectory";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.experts.hero.title, description: dict.experts.hero.description };
}

export default async function ExpertsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={dict.experts.hero.eyebrow}
        title={dict.experts.hero.title}
        description={dict.experts.hero.description}
        image="/images/smart-infrastructure.jpg"
      />
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ExpertsDirectory locale={locale} dict={dict.experts} />
        </div>
      </section>
    </>
  );
}
