import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Advocacy — A Nonpartisan Voice for Economic Cooperation",
  description:
    "AACC-USA advocates for policies, partnerships, and initiatives that strengthen Algerian-American economic cooperation — from trade facilitation to direct U.S.-Algeria flights.",
};

const priorities = [
  {
    title: "Trade & Investment",
    description: "Facilitating commerce and investment flows between the U.S. and Algeria.",
    icon: "chart",
  },
  {
    title: "Direct Air Connectivity",
    description: "Building the business case for direct flights between the U.S. and Algeria.",
    icon: "plane",
  },
  {
    title: "Small Business Support",
    description: "Championing programs and access for Algerian-American small businesses.",
    icon: "briefcase",
  },
  {
    title: "Diaspora Representation",
    description: "Ensuring the Algerian-American business community has a professional voice.",
    icon: "mic",
  },
  {
    title: "Professional Mobility",
    description: "Supporting pathways for professionals, students, and business travelers.",
    icon: "users",
  },
  {
    title: "Innovation Partnerships",
    description: "Encouraging Algeria-U.S. cooperation in technology, energy, and research.",
    icon: "globe",
  },
  {
    title: "Cultural & Economic Visibility",
    description: "Elevating Algerian-American contributions to the U.S. economy and society.",
    icon: "shield",
  },
];

const briefs = [
  {
    title: "The Case for Direct U.S.-Algeria Flights",
    summary:
      "Why nonstop air connectivity is a trade, tourism, and community imperative — and what it would unlock for both economies.",
    status: "Policy Brief — Coming Soon",
  },
  {
    title: "Unlocking Algerian-American Investment",
    summary:
      "Mapping the barriers and opportunities for diaspora capital to flow into productive investment in both markets.",
    status: "Policy Brief — Coming Soon",
  },
  {
    title: "Strengthening Diaspora Business Networks",
    summary:
      "How structured business networks multiply economic outcomes for immigrant and diaspora communities.",
    status: "Policy Brief — Coming Soon",
  },
];

export default function AdvocacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Advocacy"
        title="A Professional, Nonpartisan Voice for Economic Cooperation"
        description="AACC-USA advocates for policies, partnerships, and initiatives that strengthen Algerian-American economic cooperation and diaspora opportunity."
      />

      {/* Priorities */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Advocacy Priorities"
            title="What We Stand For"
            description="Our advocacy is nonpartisan, professional, and focused on economic and community development."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {priorities.map((priority) => (
              <div
                key={priority.title}
                className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy">
                  <Icon name={priority.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{priority.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{priority.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy briefs */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Policy Briefs"
            title="Research That Supports the Case"
            description="Forthcoming chamber publications making the economic case for stronger U.S.–Algeria ties."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {briefs.map((brief) => (
              <article
                key={brief.title}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-8 shadow-card"
              >
                <FileText className="h-8 w-8 text-gold" aria-hidden="true" />
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{brief.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{brief.summary}</p>
                <span className="mt-6 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                  {brief.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Submit an issue */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Submit an Issue"
            title="What Should the Chamber Take On?"
            description="Members and community businesses can submit economic or business issues for the chamber's advocacy agenda."
          />
          <div className="mt-12 rounded-3xl border border-navy-100 bg-surface p-8 sm:p-10">
            <ContactForm defaultInquiry="general" submitLabel="Submit Issue" />
          </div>
        </div>
      </section>

      <CTASection
        title="Advocacy Is Stronger With Members Behind It"
        description="Every membership adds weight to the chamber's voice on trade, connectivity, and opportunity."
        primaryLabel="Join AACC-USA"
        primaryHref="/membership"
        secondaryLabel="Read Chamber News"
        secondaryHref="/news"
      />
    </>
  );
}
