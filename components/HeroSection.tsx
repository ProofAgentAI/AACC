import Link from "next/link";

function MapLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Abstract trade-route arcs between two shores */}
      <path d="M80 480 C350 120, 850 120, 1120 480" stroke="#C9A227" strokeWidth="1.5" />
      <path d="M140 520 C400 220, 800 220, 1060 520" stroke="#00C767" strokeWidth="1" opacity="0.6" />
      <path d="M40 430 C330 60, 870 60, 1160 430" stroke="#F04349" strokeWidth="0.75" opacity="0.6" />
      <circle cx="80" cy="480" r="5" fill="#00C767" />
      <circle cx="1120" cy="480" r="5" fill="#F04349" />
      <circle cx="600" cy="210" r="3.5" fill="#C9A227" />
      {/* Node clusters */}
      <g fill="#FFFFFF">
        <circle cx="210" cy="390" r="2" />
        <circle cx="255" cy="350" r="2" />
        <circle cx="960" cy="380" r="2" />
        <circle cx="1010" cy="345" r="2" />
        <circle cx="450" cy="260" r="2" />
        <circle cx="750" cy="255" r="2" />
      </g>
      {/* Connection ticks along the main arc */}
      <g stroke="#FFFFFF" strokeWidth="1" opacity="0.5">
        <path d="M300 305 l8 -8 M420 220 l8 -8 M560 178 l8 -8 M700 178 l8 -8 M840 220 l8 -8 M940 290 l8 -8" />
      </g>
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy to-navy-700 text-white">
      {/* Tech grid */}
      <div className="absolute inset-0 bg-grid-light" aria-hidden="true" />
      {/* Country glow blobs */}
      <div
        className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-green-500/15 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-red-500/[0.12] blur-3xl animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl animate-pulse-soft"
        aria-hidden="true"
      />
      <MapLines />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
            Founding Initiative
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The Algerian American Chamber for{" "}
            <span className="text-flag-gradient">Business, Trade, and Community Leadership</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-navy-100 sm:text-xl">
            AACC-USA connects Algerian-American entrepreneurs, professionals, investors, and
            institutions to expand trade, investment, innovation, and opportunity between the
            United States and Algeria.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/membership"
              className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400 hover:shadow-glow-green sm:w-auto"
            >
              Become a Founding Member
            </Link>
            <Link
              href="/sponsors"
              className="glass-dark w-full rounded-lg px-8 py-4 text-base font-semibold text-white transition-all hover:border-red-400/60 hover:shadow-glow-red sm:w-auto"
            >
              Partner With Us
            </Link>
            <Link
              href="/about"
              className="w-full px-4 py-4 text-base font-semibold text-navy-100 underline-offset-4 transition-colors hover:text-white hover:underline sm:w-auto"
            >
              Explore the Chamber →
            </Link>
          </div>
          <p className="mt-10 text-sm text-navy-200">
            Launching as a U.S.-based nonprofit chamber-style association for Algerian-American
            economic growth.
          </p>
        </div>
      </div>
      {/* Dual-country accent bar */}
      <div className="tricolor-bar relative h-1" aria-hidden="true" />
    </section>
  );
}
