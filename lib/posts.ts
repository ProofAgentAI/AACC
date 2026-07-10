import { supabase } from "./supabase";

export type CmsPost = {
  id: string;
  slug: string;
  type: "article" | "news" | "announcement" | "podcast";
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_image: string | null;
  category: string | null;
  locale: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  published_at: string | null;
  created_at: string;
  likes: number;
  views: number;
};

export const POST_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  article: { en: "Article", ar: "مقال" },
  news: { en: "News", ar: "خبر" },
  announcement: { en: "Announcement", ar: "إعلان" },
  podcast: { en: "Podcast", ar: "بودكاست" },
};

export async function getPublishedPosts(locale: string): Promise<CmsPost[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, type, title, excerpt, content_html, cover_image, category, locale, seo_title, seo_description, seo_keywords, published_at, created_at, likes, views"
    )
    .eq("locale", locale)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error || !data) return [];
  return data as CmsPost[];
}

export async function getPostBySlug(slug: string): Promise<CmsPost | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, type, title, excerpt, content_html, cover_image, category, locale, seo_title, seo_description, seo_keywords, published_at, created_at, likes, views"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as CmsPost;
}

export function formatPostDate(post: CmsPost, locale: string): string {
  const value = post.published_at ?? post.created_at;
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-DZ" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function readTimeOf(post: CmsPost, locale: string): string {
  const words = post.content_html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return locale === "ar" ? `${minutes} دقائق قراءة` : `${minutes} min read`;
}
