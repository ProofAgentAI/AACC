import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ShareBar from "@/components/ShareBar";
import LikeButton from "@/components/LikeButton";
import { getPostBySlug, formatPostDate, readTimeOf, POST_TYPE_LABELS } from "@/lib/posts";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

// Always render fresh so edits, likes, and view counts show immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    keywords: post.seo_keywords ?? undefined,
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? undefined,
      type: "article",
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const typeLabel =
    POST_TYPE_LABELS[post.type]?.[locale === "ar" ? "ar" : "en"] ?? post.type;

  return (
    <>
      {/* Article header */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-700 text-white"
        style={
          post.cover_image
            ? {
                backgroundImage: `linear-gradient(rgba(7,21,39,0.75), rgba(11,31,58,0.85)), url(${post.cover_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {dict.news.article.back}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy">
              {typeLabel}
            </span>
            {post.category && (
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-navy-100">
                {post.category}
              </span>
            )}
          </div>
          <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-navy-100">{post.excerpt}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-200">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
              {formatPostDate(post, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
              {readTimeOf(post, locale)}
            </span>
          </div>
        </div>
        <div className="tricolor-bar relative h-1" aria-hidden="true" />
      </section>

      {/* Article body */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-100 pb-6">
            <LikeButton postId={post.id} initialLikes={post.likes} initialViews={post.views} />
            <ShareBar title={post.title} label={dict.news.article.share} />
          </div>
          <article
            className="article-content mt-10"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-navy-100 pt-8">
            <LikeButton postId={post.id} initialLikes={post.likes} initialViews={post.views} />
            <ShareBar title={post.title} label={dict.news.article.share} />
          </div>
        </div>
      </section>
    </>
  );
}
