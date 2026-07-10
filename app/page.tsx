import type { Metadata } from "next";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import SectionHeading from "@/components/SectionHeading";
import ProgramCard from "@/components/ProgramCard";
import MembershipTierCard from "@/components/MembershipTierCard";
import CTASection from "@/components/CTASection";
import LogoCloud from "@/components/LogoCloud";
import Icon from "@/components/Icon";
import { programs } from "@/data/programs";
import { membershipTiers } from "@/data/membership";

export const metadata: Metadata = {
  title: "AACC-USA | Algerian American Chamber of Commerce USA",
  description:
    "The Algerian American Chamber for business, trade, and community leadership. AACC-USA connects entrepreneurs, professionals, investors, and institutions between the United States and Algeria.",
};

const missionCards = [
  {
    title: "Trade & Investment",
    description:
      "Expanding commerce, investment channels, and market access between the United States and Algeria.",
    icon: "chart",
  },
  {
    title: "Business Networking",
    description:
      "Connecting Algerian-American entrepreneurs, professionals, and executives across the country.",
    icon: "handshake",
  },
  {
    title: "Diaspora Economic Voice",
    description:
      "Giving the Algerian diaspora in America a structured platform for visibility, opportunity, and influence.",
    icon: "mic",
  },
  {
    title: "Community Growth",
    description:
      "Building programs, media, and partnerships that strengthen the community's socioeconomic footing.",
    icon: "users",
  },
];

const whyPoints = [
  {
    title: "A growing business community",
    description:
      "Algerian-American businesses and professionals are expanding across the U.S. — in technology, healthcare, trade, real estate, hospitality, and beyond.",
  },
  {
    title: "A missing structure",
    description:
      "Until now, there has been no structured chamber to represent Algerian-American business interests, aggregate their voice, and open institutional doors.",
  },
  {
    title: "A two-way bridge",
    description:
      "The chamber connects U.S. market access with Algerian investment opportunities — supporting flows of trade, capital, and expertise in both directions.",
  },
  {
    title: "A platform for all",
    description:
      "AACC-USA supports Algerian products, entrepreneurs, professionals, and institutions — from first-time founders to established corporations.",
  },
];

const services = [
  {
    title: "Business Directory",
    description: "A professional directory giving Algerian-American businesses visibility with partners in both markets.",
    icon: "building",
    href: "/directory",
  },
  {
    title: "Trade Missions",
    description: "Organized delegations connecting companies and investors between the U.S. and Algeria.",
    icon: "plane",
    href: "/programs",
  },
  {
    title: "Investment Forums",
    description: "Curated events around startups, real estate, technology, energy, agriculture, and services.",
    icon: "chart",
    href: "/programs",
  },
  {
    title: "Policy & Advocacy",
    description: "Nonpartisan advocacy for trade facilitation, direct flights, and diaspora economic opportunity.",
    icon: "shield",
    href: "/advocacy",
  },
  {
    title: "Podcasts & Media",
    description: "Interviews and stories amplifying Algerian-American entrepreneurs and leaders.",
    icon: "mic",
    href: "/news",
  },
  {
    title: "Community Programs",
    description: "Youth development, women in business, and professional programming for the community.",
    icon: "users",
    href: "/programs",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />

      {/* Mission snapshot */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Mission"
            title="One Chamber. Two Economies. Endless Opportunity."
            description="AACC-USA exists to strengthen Algerian-American economic ties — through networking, trade, investment, advocacy, and community leadership."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {missionCards.map((card) => (
              <div
                key={card.title}
                className="group rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                  <Icon name={card.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AACC-USA */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Why AACC-USA"
                title="The Bridge Our Community Has Been Waiting For"
                description="Algerian-American economic potential is real — what it needs is structure, visibility, and a seat at the table."
                align="left"
              />
              <div className="mt-10 space-y-7">
                {whyPoints.map((point, index) => (
                  <div key={point.title} className="flex gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-sm font-bold text-gold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-navy">{point.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-navy-500 p-10 text-white lg:p-14">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
                viewBox="0 0 600 600"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <path d="M40 420 C180 160, 420 160, 560 420" stroke="#C9A227" strokeWidth="2" />
                <path d="M40 420 H560" stroke="#FFFFFF" strokeWidth="2" />
                <path d="M150 420 V310" stroke="#FFFFFF" strokeWidth="1" />
                <path d="M300 420 V255" stroke="#FFFFFF" strokeWidth="1" />
                <path d="M450 420 V310" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="40" cy="420" r="7" fill="#007A3D" />
                <circle cx="560" cy="420" r="7" fill="#D71920" />
              </svg>
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
                  Building the Bridge
                </p>
                <p className="mt-6 font-heading text-2xl font-bold leading-snug lg:text-3xl">
                  &ldquo;Between Algerian talent, trade, and opportunity stands one missing piece —
                  a chamber that connects them.&rdquo;
                </p>
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/20 pt-8">
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-gold">USA</p>
                    <p className="mt-1 text-sm text-navy-100">Market access, capital, and diaspora expertise</p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-gold">Algeria</p>
                    <p className="mt-1 text-sm text-navy-100">Investment opportunity, talent, and growth sectors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Do"
            title="Six Ways the Chamber Works for You"
            description="Practical services that create exposure, connections, and opportunity for members and partners."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy transition-colors group-hover:bg-navy group-hover:text-gold">
                  <Icon name={service.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-green-600">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Founding network CTA band */}
      <section className="relative overflow-hidden bg-navy py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 50% 100% at 0% 50%, #007A3D 0%, transparent 55%), radial-gradient(ellipse 50% 100% at 100% 50%, #D71920 0%, transparent 55%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="max-w-2xl text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
              Founding Network
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl">
              Founding members, sponsors, advisors, and partners welcome
            </h2>
            <p className="mt-3 text-navy-100">
              Join early and help shape the chamber&rsquo;s first programs, priorities, and leadership.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/membership"
              className="rounded-lg bg-gold px-7 py-3.5 text-center text-sm font-semibold text-navy transition-colors hover:bg-gold-400"
            >
              Become a Founding Member
            </Link>
            <Link
              href="/sponsors"
              className="rounded-lg border border-white/40 px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sponsor the Chamber
            </Link>
          </div>
        </div>
      </section>

      {/* Featured programs */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Featured Programs"
            title="Initiatives That Move the Needle"
            description="From trade missions to direct flight advocacy, our programs are designed for measurable economic impact."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 6).map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/programs"
              className="inline-block rounded-lg border border-navy-200 px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-surface"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Membership preview */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Membership"
            title="Find Your Place in the Chamber"
            description="Four membership pathways — for professionals, businesses, institutions, and founding supporters."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {membershipTiers.map((tier) => (
              <MembershipTierCard key={tier.slug} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LogoCloud />
        </div>
      </section>

      <CTASection
        title="Join the Founding Network of AACC-USA"
        description="Be part of the first generation of members, sponsors, and partners building the Algerian-American economic bridge."
        primaryLabel="Become a Founding Member"
        primaryHref="/membership"
        secondaryLabel="Partner With Us"
        secondaryHref="/sponsors"
      />
    </>
  );
}
