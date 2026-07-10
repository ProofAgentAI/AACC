"use client";

import { useEffect, useState } from "react";
import { Eye, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LikeButton({
  postId,
  initialLikes,
  initialViews,
}: {
  postId: string;
  initialLikes: number;
  initialViews: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [liked, setLiked] = useState(false);
  const likedKey = `aacc-liked-${postId}`;
  const viewedKey = `aacc-viewed-${postId}`;

  // Count one view per browser session, and restore the liked state.
  useEffect(() => {
    setLiked(Boolean(localStorage.getItem(likedKey)));
    if (!supabase) return;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "1");
      supabase.rpc("increment_post_views", { post_id: postId }).then(({ data }) => {
        if (typeof data === "number") setViews(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function like() {
    if (!supabase || liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    localStorage.setItem(likedKey, "1");
    const { data } = await supabase.rpc("increment_post_likes", { post_id: postId });
    if (typeof data === "number") setLikes(data);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={like}
        disabled={liked}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
          liked
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-navy-200 bg-white text-navy hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        }`}
        aria-pressed={liked}
        aria-label="Like this article"
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        {likes}
      </button>
      <span className="inline-flex items-center gap-1.5 text-sm text-muted">
        <Eye className="h-4 w-4" aria-hidden="true" />
        {views}
      </span>
    </div>
  );
}
