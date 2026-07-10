import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import SponsorTierCard from "@/components/SponsorTierCard";
import CTASection from "@/components/CTASection";
import LogoCloud from "@/components/LogoCloud";
import Icon from "@/components/Icon";
import { sponsorTiers, partnerTypes } from "@/data/sponsors";

export const metadata: Metadata = {
  title: "Sponsors & Partners — Support the Algerian-American Bridge",
  description:
    "Sponsor AACC-USA and gain brand visibility, network access, and speaking opportunities across the Algerian-American business community. Platinum to event tiers available.",
};

const benefits = [
  {
    title: "Brand Visibility",
    description: "Placement across the chamber website, events, newsletters, and media.",
    icon: "shield",
  },
  {
    title: "Business Network Access",
    description: "Direct access to Algerian-American entrepreneurs, executives, and investors.",
    icon: "users",
  },
  {
    title: "Speaking Opportunities",
    description: "Keynotes, panels, and podcast features at chamber events and programs.",
    icon: "mic",
  },
  {
    title: "Community Goodwill",
    description: "Meaningful association with a mission-driven diaspora economic platform.",
    icon: "handshake",
  },
  {
    title: "Cross-Border Exposure",
    description: "Visibility with partners and opportunities in both the U.S. and Algeria.",
    icon: "globe",
  },
];

export default function SponsorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Sponsors & Partners"
        title="Power the Platform. Share the Stage."
        description="Sponsorship puts your organization at the center of the Algerian-American business network — with visibility, access, and legacy positioning in a founding-era platform."
      />

      {/* Benefits */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Sponsorship Benefits"
            title="Why Organizations Sponsor AACC-USA"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-card"
              >
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Sponsor Tiers"
            title="Choose Your Level of Impact"
            description="Placeholder founding-era rates. Custom packages available for strategic partners."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {sponsorTiers.map((tier) => (
              <SponsorTierCard key={tier.slug} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* Partner types */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Partner Types"
            title="Who We Partner With"
            description="The chamber welcomes institutional partners whose missions align with Algerian-American economic growth."
          />
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {partnerTypes.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center gap-3 rounded-2xl border border-navy-100 bg-surface p-6 text-center"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-navy shadow-sm">
                  <Icon name={partner.icon} className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-navy">{partner.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-20">
            <LogoCloud title="Founding sponsor placements available" />
          </div>
        </div>
      </section>

      <CTASection
        title="Become a Sponsor"
        description="Founding sponsors receive premier recognition as the chamber launches — a one-time opportunity for legacy positioning."
        primaryLabel="Become a Sponsor"
        primaryHref="/contact?inquiry=sponsorship"
        secondaryLabel="Email sponsorship@aaccusa.org"
        secondaryHref="mailto:sponsorship@aaccusa.org"
      />
    </>
  );
}
