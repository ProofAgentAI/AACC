import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Business Directory — Algerian-American Businesses & Professionals",
  description:
    "Discover Algerian-American businesses, professionals, and partners across the United States. Search by industry, location, and market interest in the AACC-USA business directory.",
};

export default function DirectoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Business Directory"
        title="Discover Algerian-American Businesses, Professionals, and Partners"
        description="A growing directory of member businesses across the United States — searchable by industry, location, and cross-border market interest."
      />

      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DirectoryExplorer />
        </div>
      </section>

      <CTASection
        title="List Your Business"
        description="Business members receive a professional directory listing visible to partners, customers, and institutions in both markets."
        primaryLabel="List Your Business"
        primaryHref="/contact?inquiry=directory"
        secondaryLabel="View Membership Options"
        secondaryHref="/membership"
      />
    </>
  );
}
