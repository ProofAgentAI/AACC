import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ExpertApplyForm from "@/components/ExpertApplyForm";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.experts.applyCta, description: dict.experts.applyIntro };
}

// Standalone, shareable application page: aacc-usa.org/en/experts/apply
export default async function ExpertApplyPage({
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
        title={dict.experts.applyCta}
        description={dict.experts.applyIntro}
        image="/images/smart-infrastructure.jpg"
      />
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
            <ExpertApplyForm locale={locale} dict={dict.experts} />
          </div>
          <p className="mt-8 text-center">
            <Link
              href={`/${locale}/experts`}
              className="text-sm font-semibold text-green-600 hover:underline"
            >
              {dict.experts.directoryCta} →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
