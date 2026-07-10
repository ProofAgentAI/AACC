import Link from "next/link";
import Image from "next/image";
import type { Locale, Dictionary } from "@/lib/i18n";

export default function HeroSection({
  locale,
  hero,
}: {
  locale: Locale;
  hero: Dictionary["home"]["hero"];
}) {
  const p = (href: string) => `/${locale}${href}`;

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      {/* Background artwork: portrait crop on phones, wide scene on larger screens */}
      <Image
        src="/images/hero-monuments-mobile.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center sm:hidden"
        aria-hidden="true"
      />
      <Image
        src="/images/hero-monuments.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center sm:block"
        aria-hidden="true"
      />
      {/* Legibility overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-navy-900/60 via-navy-800/35 to-navy-900/70"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-navy-900/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
            {hero.badge}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {hero.titlePre} <span className="text-flag-gradient">{hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-navy-100 sm:text-xl">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={p("/board")}
              className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400 sm:w-auto"
            >
              {hero.primary}
            </Link>
            <Link
              href={p("/sponsors")}
              className="glass-dark w-full rounded-lg px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/40 sm:w-auto"
            >
              {hero.secondary}
            </Link>
            <Link
              href={p("/about")}
              className="w-full px-4 py-4 text-base font-semibold text-navy-100 underline-offset-4 transition-colors hover:text-white hover:underline sm:w-auto"
            >
              {hero.tertiary} →
            </Link>
          </div>
          <p className="mt-10 text-sm text-navy-200">{hero.trust}</p>
        </div>
      </div>
      <div className="tricolor-bar relative h-1" aria-hidden="true" />
    </section>
  );
}
