import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import DirectorySubmitForm from "@/components/DirectorySubmitForm";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.directory.submit.title, description: dict.directory.submit.description };
}

export default async function DirectorySubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const s = dict.directory.submit;

  return (
    <>
      <PageHero
        eyebrow={s.eyebrow}
        title={s.title}
        description={s.description}
        image="/images/trade-port.jpg"
      />

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
            <DirectorySubmitForm locale={locale} dict={s} formDict={dict.form} />
          </div>
        </div>
      </section>
    </>
  );
}
