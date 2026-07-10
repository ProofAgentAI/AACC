import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ProgramCard from "@/components/ProgramCard";
import CTASection from "@/components/CTASection";
import { programs } from "@/data/programs";

export const metadata: Metadata = {
  title: "Programs — Trade Missions, Market Access & Community Initiatives",
  description:
    "Explore AACC-USA programs: trade missions, Algeria and U.S. market access, investment forums, direct flight advocacy, the diaspora business podcast, and professional development.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Initiatives Built for Economic Impact"
        description="Eight core programs connecting talent, trade, and opportunity between the United States and Algeria."
      />

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Chamber Programs"
            title="What We're Building Together"
            description="Every program is member-driven and partner-supported. Join a program, sponsor one, or propose a new initiative."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {programs.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Want to Lead or Sponsor a Program?"
        description="Chamber programs are shaped by founding members and sponsors. Bring your expertise or your organization's support."
        primaryLabel="Get Involved"
        primaryHref="/contact?inquiry=partnership"
        secondaryLabel="Sponsor a Program"
        secondaryHref="/sponsors"
      />
    </>
  );
}
