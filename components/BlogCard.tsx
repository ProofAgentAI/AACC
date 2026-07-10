import Link from "next/link";
import type { Post } from "@/data/posts";

const categoryColors: Record<string, string> = {
  "Chamber Updates": "bg-navy-50 text-navy",
  "Market Insights": "bg-green-50 text-green-700",
  Advocacy: "bg-gold-100 text-gold-600",
  "Member Spotlights": "bg-red-50 text-red-700",
};

export default function BlogCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <article
      className={`group flex flex-col rounded-2xl border border-navy-100 bg-white shadow-card transition-shadow hover:shadow-card-hover ${
        large ? "md:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-navy via-navy-600 to-navy-500 ${
          large ? "min-h-[220px] md:w-1/2 md:rounded-l-2xl md:rounded-tr-none" : "h-40"
        }`}
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 h-full w-full opacity-25"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path d="M20 170 C120 60, 280 60, 380 170" stroke="#C9A227" strokeWidth="1.5" />
          <path d="M20 170 H380" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="20" cy="170" r="4" fill="#007A3D" />
          <circle cx="380" cy="170" r="4" fill="#D71920" />
        </svg>
        <span className="absolute bottom-4 left-4 font-heading text-sm font-bold tracking-wider text-gold">
          AACC-USA
        </span>
      </div>
      <div className={`flex flex-1 flex-col p-7 ${large ? "md:justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              categoryColors[post.category] ?? "bg-surface text-navy"
            }`}
          >
            {post.category}
          </span>
          <span className="text-xs text-muted">{post.readTime}</span>
        </div>
        <h3
          className={`mt-4 font-heading font-bold leading-snug text-navy transition-colors group-hover:text-green-600 ${
            large ? "text-2xl" : "text-lg"
          }`}
        >
          <Link href="/news">{post.title}</Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <p className="mt-5 text-xs font-medium text-muted">{post.date}</p>
      </div>
    </article>
  );
}
