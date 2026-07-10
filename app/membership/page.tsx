import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import MembershipTierCard from "@/components/MembershipTierCard";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import { membershipTiers, memberBenefits } from "@/data/membership";

export const metadata: Metadata = {
  title: "Membership — Join the Founding Network",
  description:
    "Join AACC-USA as an individual member, business member, corporate partner, or founding sponsor. Gain directory visibility, networking, events, and trade insights.",
};

export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Join the Founding Network of AACC-USA"
        description="Membership connects you to the Algerian-American business network — visibility, introductions, insights, and a seat at the table as the chamber takes shape."
      />

      {/* Why join */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Join"
            title="What Membership Delivers"
            description="Practical benefits designed for professionals, businesses, and institutions on both sides of the bridge."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {memberBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
                  <Icon name={benefit.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-navy">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Membership Tiers"
            title="Choose Your Membership"
            description="Founding-rate placeholder pricing. Every tier includes access to the chamber network and founding-member recognition."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {membershipTiers.map((tier) => (
              <MembershipTierCard key={tier.slug} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* Membership form */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Get Started"
            title="Express Your Membership Interest"
            description="Tell us about yourself and the membership that fits. Our team will follow up with next steps."
          />
          <div className="mt-12 rounded-3xl border border-navy-100 bg-surface p-8 sm:p-10">
            <ContactForm showInquiryType={false} submitLabel="Submit Membership Interest" />
          </div>
        </div>
      </section>
    </>
  );
}
