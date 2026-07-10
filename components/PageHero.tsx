export default function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-600 text-white">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
        viewBox="0 0 1200 400"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path d="M80 340 C350 80, 850 80, 1120 340" stroke="#C9A227" strokeWidth="1.5" />
        <path d="M80 340 H1120" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="80" cy="340" r="5" fill="#007A3D" />
        <circle cx="1120" cy="340" r="5" fill="#D71920" />
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gold">
            {eyebrow}
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-lg leading-relaxed text-navy-100">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
