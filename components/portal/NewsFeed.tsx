"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Eye, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  slug: string;
  type: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  locale: string;
  published_at: string | null;
  likes: number;
  views: number;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewsFeed({ onNotice }: { onNotice: (msg: string) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug, type, title, excerpt, cover_image, category, locale, published_at, likes, views")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(30);
    setLoading(false);
    if (error) {
      onNotice(`Could not load news: ${error.message}`);
      return;
    }
    setPosts((data as Post[]) ?? []);
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading news...</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-muted">
        No published articles yet. Chamber news will appear here.
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <a
          key={post.id}
          href={`/${post.locale}/news/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-shadow hover:shadow-card-hover"
        >
          {post.cover_image && (
            <div className="relative h-40 w-full overflow-hidden bg-navy-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              <span className="text-gold-600">{post.category ?? post.type}</span>
              <span className="text-muted">{formatDate(post.published_at)}</span>
            </div>
            <h3 className="mt-2 font-heading text-base font-bold leading-snug text-navy group-hover:text-green-700">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 border-t border-navy-50 pt-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {post.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" /> {post.likes}
              </span>
              <span className="ms-auto inline-flex items-center gap-1 font-semibold text-green-600">
                Read <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
