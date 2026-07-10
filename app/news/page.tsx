import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import BlogCard from "@/components/BlogCard";
import CTASection from "@/components/CTASection";
import { Mic, Play } from "lucide-react";
import { posts, podcastEpisodes } from "@/data/posts";

export const metadata: Metadata = {
  title: "News & Insights — Chamber Updates, Market Insights & Spotlights",
  description:
    "Read AACC-USA news, U.S.–Algeria market insights, member spotlights, and diaspora business podcast episodes from the Algerian American Chamber of Commerce USA.",
};

export default function NewsPage() {
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post !== featured);

  return (
    <>
      <PageHero
        eyebrow="News & Insights"
        title="Stories, Insights, and Updates From the Bridge"
        description="Chamber updates, market insights, member spotlights, and podcast episodes covering Algerian-American business."
      />

      {/* Featured */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Featured Article" title="Editor's Pick" align="left" />
          <div className="mt-10">
            <BlogCard post={featured} large />
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Latest News & Insights"
            title="Recent Publications"
            description="Market insights, advocacy updates, and member spotlights from across the network."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Podcast */}
      <section className="bg-navy py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Diaspora Business Podcast"
            title="Voices of the Algerian-American Economy"
            description="Conversations with entrepreneurs, investors, and community leaders building across two continents."
            dark
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {podcastEpisodes.map((episode) => (
              <article
                key={episode.title}
                className="group flex flex-col rounded-2xl border border-navy-600 bg-navy-700 p-7 transition-colors hover:border-gold/60"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                    <Mic className="h-4 w-4" aria-hidden="true" />
                    {episode.episode}
                  </span>
                  <span className="text-xs text-navy-200">{episode.duration}</span>
                </div>
                <h3 className="mt-4 flex-1 font-heading text-lg font-bold leading-snug">
                  {episode.title}
                </h3>
                <p className="mt-2 text-sm text-navy-200">{episode.guest}</p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-400"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Coming Soon
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Have a Story Worth Telling?"
        description="Member spotlights and podcast guests are drawn from the chamber network. Share your business story."
        primaryLabel="Pitch Your Story"
        primaryHref="/contact?inquiry=media"
        secondaryLabel="Become a Member"
        secondaryHref="/membership"
      />
    </>
  );
}
