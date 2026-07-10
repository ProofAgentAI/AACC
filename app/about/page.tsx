import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import LeadershipCard from "@/components/LeadershipCard";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "About Us — Mission, Vision & Leadership",
  description:
    "AACC-USA is an independent U.S.-based nonprofit chamber-style association strengthening Algerian-American economic ties through business, trade, investment, and advocacy.",
};

const values = [
  {
    title: "Trust",
    description: "We operate with transparency, professionalism, and integrity in every relationship.",
    icon: "shield",
  },
  {
    title: "Opportunity",
    description: "We open doors — to markets, capital, partners, and platforms — for our members.",
    icon: "chart",
  },
  {
    title: "Collaboration",
    description: "We build with partners across sectors, institutions, and borders.",
    icon: "handshake",
  },
  {
    title: "Economic Empowerment",
    description: "We help Algerian-American businesses and professionals grow and lead.",
    icon: "briefcase",
  },
  {
    title: "Responsible Leadership",
    description: "We lead as a nonpartisan, independent, and community-accountable organization.",
    icon: "users",
  },
  {
    title: "Algeria-U.S. Bridge Building",
    description: "We invest in the long-term economic relationship between two nations we call home.",
    icon: "globe",
  },
];

const leadership = [
  {
    role: "Founder",
    description: "Vision, strategy, and stewardship of the chamber's founding mission.",
  },
  {
    role: "Advisory Board",
    description: "Senior leaders in business, law, finance, and academia guiding chamber direction.",
  },
  {
    role: "Business Council",
    description: "Member business leaders shaping trade, directory, and investment programming.",
  },
  {
    role: "Community Council",
    description: "Community leaders driving youth, professional, and cultural-economic programs.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About AACC-USA"
        title="An Independent Chamber for Algerian-American Economic Leadership"
        description="AACC-USA is a U.S.-based nonprofit chamber-style association — an independent platform for business, trade, investment, community development, and advocacy."
      />

      {/* Mission & Vision */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-navy-100 bg-surface p-10 lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-600">
                Our Mission
              </p>
              <p className="mt-5 font-heading text-2xl font-bold leading-snug text-navy">
                To strengthen Algerian-American economic ties by connecting business leaders,
                entrepreneurs, investors, professionals, and institutions across the United States
                and Algeria.
              </p>
            </div>
            <div className="rounded-3xl bg-navy p-10 text-white lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
                Our Vision
              </p>
              <p className="mt-5 font-heading text-2xl font-bold leading-snug">
                To become the leading U.S.-based chamber representing Algerian-American business
                interests, trade opportunities, innovation, investment, and diaspora economic
                leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our role */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <SectionHeading
              eyebrow="Our Role"
              title="What the Chamber Is — and Is Not"
              align="left"
            />
            <div className="space-y-6 text-base leading-relaxed text-ink">
              <p>
                AACC-USA is an <strong>independent nonprofit chamber-style association</strong>{" "}
                focused on business, trade, investment, community development, and advocacy. We
                serve as the connective tissue between Algerian-American entrepreneurs,
                professionals, companies, and the institutions that can help them grow.
              </p>
              <p>
                We are a <strong>business and community leadership platform</strong> — organizing
                trade missions, publishing a business directory, hosting investment forums, and
                advancing nonpartisan advocacy priorities like direct air connectivity between the
                United States and Algeria.
              </p>
              <p className="rounded-xl border border-gold/40 bg-gold-100/50 p-5 text-sm">
                <strong>Important:</strong> AACC-USA is not a government agency and does not
                represent any government. We are an independent U.S.-based association serving
                business and community interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder message */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-700 to-navy-600 p-10 text-center text-white sm:p-14">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">
              A Message From the Founder
            </p>
            <blockquote className="mt-6 font-heading text-2xl font-bold leading-snug sm:text-3xl">
              &ldquo;AACC-USA was created to give Algerian-American entrepreneurs, professionals,
              and businesses a structured platform to connect, grow, and represent their economic
              voice across both countries.&rdquo;
            </blockquote>
            <p className="mt-8 text-sm font-semibold text-navy-100">
              — Founder, AACC-USA
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Leadership"
            title="The People Behind the Platform"
            description="Chamber leadership is being assembled from the founding network. Interested in serving? Reach out."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((leader) => (
              <LeadershipCard key={leader.role} role={leader.role} description={leader.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Values"
            title="The Principles That Guide the Chamber"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-navy-100 bg-white p-7 shadow-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon name={value.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Help Us Build the Chamber"
        description="Founding members, advisors, and partners are shaping AACC-USA right now. Add your voice."
        primaryLabel="Become a Founding Member"
        primaryHref="/membership"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />
    </>
  );
}
