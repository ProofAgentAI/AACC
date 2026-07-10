import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import BlogCard from "@/components/BlogCard";
import CTASection from "@/components/CTASection";
import { Mic, Play } from "lucide-react";
import { posts as mockPosts, podcastEpisodes } from "@/data/posts";
import { getPublishedPosts, formatPostDate, readTimeOf, POST_TYPE_LABELS } from "@/lib/posts";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

// Refresh the listing from the CMS at most every 60 seconds.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.news.hero.title, description: dict.news.hero.description };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const n = dict.news;
  const p = (href: string) => `/${locale}${href}`;

  // Published CMS content replaces the mock articles once it exists.
  const cmsPosts = await getPublishedPosts(locale);
  const cards =
    cmsPosts.length > 0
      ? cmsPosts.map((post) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt ?? "",
          date: formatPostDate(post, locale),
          category:
            post.category ??
            POST_TYPE_LABELS[post.type]?.[locale === "ar" ? "ar" : "en"] ??
            post.type,
          readTime: readTimeOf(post, locale),
          href: p(`/news/${post.slug}`),
          image: post.cover_image,
          author: post.author,
        }))
      : mockPosts.map((post) => ({
          ...post,
          href: p("/news"),
          image: null as string | null,
          author: null as string | null,
        }));

  const featured = cards[0];
  const rest = cards.slice(1);

  return (
    <>
      <PageHero
        eyebrow={n.hero.eyebrow}
        title={n.hero.title}
        description={n.hero.description}
        image="/images/smart-infrastructure.jpg"
      />

      {/* Featured */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={n.featured.eyebrow} title={n.featured.title} align="left" />
          <div className="mt-10">
            <BlogCard
              post={featured}
              large
              href={featured.href}
              image={featured.image}
              author={featured.author}
            />
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={n.latest.eyebrow}
            title={n.latest.title}
            description={n.latest.description}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                href={post.href}
                image={post.image}
                author={post.author}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Podcast */}
      <section className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24">
        <Image
          src="/images/hero-monuments.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-navy-900/70" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={n.podcast.eyebrow}
            title={n.podcast.title}
            description={n.podcast.description}
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
                  {dict.common.comingSoon}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={n.cta.title}
        description={n.cta.description}
        primaryLabel={n.cta.primary}
        primaryHref={p("/contact?inquiry=media")}
        secondaryLabel={n.cta.secondary}
        secondaryHref={p("/membership")}
        image="/images/trade-port.jpg"
      />
    </>
  );
}
