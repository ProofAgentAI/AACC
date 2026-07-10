import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BoardApplicationForm from "@/components/BoardApplicationForm";
import Icon from "@/components/Icon";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.about.board.title, description: dict.about.board.description };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const board = dict.about.board;

  return (
    <>
      <PageHero
        eyebrow={board.eyebrow}
        title={board.title}
        description={board.description}
        image="/images/diaspora-connect.jpg"
      />

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Areas the board covers, as a quick visual summary */}
          <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {board.areas.slice(0, 10).map((area) => (
              <div
                key={area.value}
                className="flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-2.5"
              >
                <Icon name="briefcase" className="h-4 w-4 shrink-0 text-green-600" />
                <span className="text-xs font-semibold leading-tight text-navy">{area.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
            <BoardApplicationForm locale={locale} dict={board} formDict={dict.form} />
          </div>
        </div>
      </section>
    </>
  );
}
