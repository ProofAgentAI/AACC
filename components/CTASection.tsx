import Link from "next/link";

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="absolute inset-0 bg-grid-light" aria-hidden="true" />
      <div
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-green-500/25 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-red-500/20 blur-3xl animate-float-slow"
        aria-hidden="true"
      />
      <div className="tricolor-bar absolute inset-x-0 top-0 h-0.5" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-navy-100">
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={primaryHref}
            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400 sm:w-auto"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="glass-dark w-full rounded-lg px-8 py-4 text-base font-semibold text-white transition-all hover:border-red-400/60 hover:shadow-glow-red sm:w-auto"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
