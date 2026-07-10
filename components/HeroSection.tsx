import Link from "next/link";

function MapLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Abstract trade-route arcs between two shores */}
      <path d="M80 480 C350 120, 850 120, 1120 480" stroke="#C9A227" strokeWidth="1.5" />
      <path d="M140 520 C400 220, 800 220, 1060 520" stroke="#FFFFFF" strokeWidth="1" />
      <path d="M40 430 C330 60, 870 60, 1160 430" stroke="#FFFFFF" strokeWidth="0.75" />
      <circle cx="80" cy="480" r="5" fill="#007A3D" />
      <circle cx="1120" cy="480" r="5" fill="#D71920" />
      <circle cx="600" cy="210" r="3.5" fill="#C9A227" />
      {/* Longitude / latitude grid hints */}
      <path d="M0 300 H1200" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 10" />
      <path d="M300 0 V600" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 10" />
      <path d="M600 0 V600" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 10" />
      <path d="M900 0 V600" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 10" />
      {/* Node clusters */}
      <g fill="#FFFFFF">
        <circle cx="210" cy="390" r="2" />
        <circle cx="255" cy="350" r="2" />
        <circle cx="960" cy="380" r="2" />
        <circle cx="1010" cy="345" r="2" />
        <circle cx="450" cy="260" r="2" />
        <circle cx="750" cy="255" r="2" />
      </g>
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy-700 to-navy-600 text-white">
      <MapLines />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-600/60 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-navy-700/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green" />
            Founding Initiative
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red" />
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The Algerian American Chamber for{" "}
            <span className="text-gold">Business, Trade, and Community Leadership</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-navy-100 sm:text-xl">
            AACC-USA connects Algerian-American entrepreneurs, professionals, investors, and
            institutions to expand trade, investment, innovation, and opportunity between the
            United States and Algeria.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/membership"
              className="w-full rounded-lg bg-gold px-8 py-4 text-base font-semibold text-navy shadow-lg transition-all hover:bg-gold-400 hover:shadow-xl sm:w-auto"
            >
              Become a Founding Member
            </Link>
            <Link
              href="/sponsors"
              className="w-full rounded-lg border border-white/40 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:border-white hover:bg-white/10 sm:w-auto"
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
    </section>
  );
}
