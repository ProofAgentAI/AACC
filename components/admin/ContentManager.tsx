"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, FilePlus2, Globe, Heart, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

type PostRow = Record<string, unknown>;

const POST_TYPES = [
  { value: "article", label: "Article" },
  { value: "news", label: "News" },
  { value: "announcement", label: "Announcement" },
  { value: "podcast", label: "Podcast" },
];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const emptyDraft: PostRow = {
  title: "",
  slug: "",
  type: "article",
  category: "",
  locale: "en",
  excerpt: "",
  cover_image: "",
  content_html: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  published: false,
};

export default function ContentManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<PostRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? "");
      setIsAdmin(isAdminUser(data.session?.user));
    });
  }, []);

  async function uploadImage(file: File) {
    if (!supabase) return;
    if (!file.type.startsWith("image/")) {
      onNotice("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onNotice("Image is too large (max 5 MB).");
      return;
    }
    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    if (error) {
      setUploading(false);
      onNotice(`Upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setDraft((d) => (d ? { ...d, cover_image: data.publicUrl } : d));
    setUploading(false);
    onNotice("Image uploaded.");
  }

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load content: ${error.message}`);
    } else {
      setPosts((data as PostRow[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  function set(field: string, value: unknown) {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  }

  async function save(publish?: boolean) {
    if (!supabase || !draft) return;
    const title = String(draft.title ?? "").trim();
    if (!title) {
      onNotice("A title is required.");
      return;
    }
    setSaving(true);
    const wantsPublish = publish ?? Boolean(draft.published);
    // Non-admin staff cannot publish directly: publishing becomes a request
    // that lands in the administrator's Approvals queue.
    const published = wantsPublish && isAdmin;
    const approval_status = wantsPublish ? (isAdmin ? "approved" : "pending") : "draft";
    const payload: PostRow = {
      title,
      slug: String(draft.slug ?? "").trim() || slugify(title),
      type: draft.type ?? "article",
      category: String(draft.category ?? "").trim() || null,
      author: String(draft.author ?? "").trim() || null,
      locale: draft.locale ?? "en",
      excerpt: String(draft.excerpt ?? "").trim() || null,
      cover_image: String(draft.cover_image ?? "").trim() || null,
      content_html: String(draft.content_html ?? ""),
      seo_title: String(draft.seo_title ?? "").trim() || null,
      seo_description: String(draft.seo_description ?? "").trim() || null,
      seo_keywords: String(draft.seo_keywords ?? "").trim() || null,
      published,
      approval_status,
      created_by: String(draft.created_by ?? "") || userEmail || null,
      published_at: published ? (draft.published_at ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    const result = draft.id
      ? await supabase.from("posts").update(payload).eq("id", draft.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (result.error) {
      onNotice(
        result.error.code === "23505"
          ? "That slug is already in use. Choose a different one."
          : `Save failed: ${result.error.message}`
      );
      return;
    }
    onNotice(
      published
        ? "Published."
        : wantsPublish
          ? "Submitted to the administrator for approval."
          : "Saved as draft."
    );
    setDraft(null);
    load();
  }

  async function togglePublish(post: PostRow) {
    if (!supabase) return;
    const published = !post.published;
    const { error } = await supabase
      .from("posts")
      .update({
        published,
        approval_status: published ? "approved" : "draft",
        published_at: published ? (post.published_at ?? new Date().toISOString()) : null,
      })
      .eq("id", post.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
    } else {
      load();
    }
  }

  async function remove(post: PostRow) {
    if (!supabase) return;
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      load();
    }
  }

  if (draft) {
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">
            {draft.id ? "Edit Content" : "New Content"}
          </h2>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Title *</label>
            <input
              type="text"
              value={String(draft.title ?? "")}
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) =>
                  d
                    ? {
                        ...d,
                        title,
                        slug: d.id || String(d.slug ?? "") ? d.slug : slugify(title),
                      }
                    : d
                );
              }}
              className={inputClasses}
              placeholder="Headline of the article, news item, or announcement"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Slug (URL) — /news/...
            </label>
            <input
              type="text"
              value={String(draft.slug ?? "")}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className={inputClasses}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Type</label>
              <select
                value={String(draft.type ?? "article")}
                onChange={(e) => set("type", e.target.value)}
                className={inputClasses}
              >
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Language</label>
              <select
                value={String(draft.locale ?? "en")}
                onChange={(e) => set("locale", e.target.value)}
                className={inputClasses}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Category</label>
            <input
              type="text"
              value={String(draft.category ?? "")}
              onChange={(e) => set("category", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Chamber Updates, Market Insights"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Author (byline)</label>
            <input
              type="text"
              value={String(draft.author ?? "")}
              onChange={(e) => set("author", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Fouad Bousetouane"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Article Picture (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = "";
              }}
            />
            {draft.cover_image ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={String(draft.cover_image)}
                  alt="Cover preview"
                  className="h-16 w-24 rounded-lg border border-navy-100 object-cover"
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-start text-xs font-semibold text-green-600 hover:underline disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Replace image"}
                  </button>
                  <button
                    type="button"
                    onClick={() => set("cover_image", "")}
                    className="text-start text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 bg-surface px-4 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy disabled:opacity-60"
              >
                <ImagePlus className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload picture"}
              </button>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Excerpt (shown on cards and in share previews)
            </label>
            <textarea
              rows={2}
              value={String(draft.excerpt ?? "")}
              onChange={(e) => set("excerpt", e.target.value)}
              className={inputClasses}
              placeholder="One or two sentences summarizing the piece..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Content (HTML) *
            </label>
            <textarea
              rows={14}
              value={String(draft.content_html ?? "")}
              onChange={(e) => set("content_html", e.target.value)}
              className={`${inputClasses} font-mono text-xs`}
              placeholder="<p>Write or paste the article HTML here...</p>&#10;<h2>Section heading</h2>&#10;<p>More content...</p>"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gold/40 bg-gold-100/40 p-4">
          <h3 className="text-sm font-bold text-navy">SEO Optimization</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy">
                SEO Title (browser tab and search results)
              </label>
              <input
                type="text"
                value={String(draft.seo_title ?? "")}
                onChange={(e) => set("seo_title", e.target.value)}
                className={inputClasses}
                placeholder="Defaults to the title"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy">
                SEO Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={String(draft.seo_keywords ?? "")}
                onChange={(e) => set("seo_keywords", e.target.value)}
                className={inputClasses}
                placeholder="Algeria trade, Algerian American business, ..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-navy">
                SEO Description (search results and social shares)
              </label>
              <textarea
                rows={2}
                value={String(draft.seo_description ?? "")}
                onChange={(e) => set("seo_description", e.target.value)}
                className={inputClasses}
                placeholder="Defaults to the excerpt"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-600"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : !isAdmin
                ? "Submit for Approval"
                : draft.published
                  ? "Update Published Post"
                  : "Publish Now"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface disabled:opacity-60"
          >
            Save as Draft
          </button>
          {Boolean(draft.id) && Boolean(draft.published) && (
            <a
              href={`/${draft.locale}/news/${draft.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:underline"
            >
              <Globe className="h-4 w-4" /> View live
            </a>
          )}
        </div>

        {/* Article preview: renders exactly like the public article page */}
        {previewOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Article preview"
          >
            <div
              className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
              onClick={() => setPreviewOpen(false)}
              aria-hidden="true"
            />
            <div
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
              dir={draft.locale === "ar" ? "rtl" : "ltr"}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-100 bg-white/95 px-6 py-3 backdrop-blur">
                <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-600">
                  Preview — not published yet
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className="bg-gradient-to-b from-navy-900 to-navy-700 px-6 py-12 text-white sm:px-10"
                style={
                  draft.cover_image
                    ? {
                        backgroundImage: `linear-gradient(rgba(7,21,39,0.75), rgba(11,31,58,0.85)), url(${draft.cover_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy">
                    {String(draft.type ?? "article")}
                  </span>
                  {Boolean(draft.category) && (
                    <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-navy-100">
                      {String(draft.category)}
                    </span>
                  )}
                </div>
                <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
                  {String(draft.title ?? "") || "Untitled"}
                </h1>
                {Boolean(draft.excerpt) && (
                  <p className="mt-3 max-w-3xl text-lg leading-relaxed text-navy-100">
                    {String(draft.excerpt)}
                  </p>
                )}
              </div>
              <div className="tricolor-bar h-1" aria-hidden="true" />
              <div className="px-6 py-10 sm:px-10">
                <article
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: String(draft.content_html ?? "") }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Articles, news, announcements, and podcast posts published here appear on the News page.
        </p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyDraft })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <FilePlus2 className="h-4 w-4" /> New Content
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Title</th>
              <th className="px-4 py-3 text-start">Type</th>
              <th className="px-4 py-3 text-start">Lang</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Engagement</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No content yet. Click “New Content” to write your first article.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={String(post.id)} className="border-b border-navy-50">
                <td className="px-4 py-3 font-semibold text-navy">{String(post.title)}</td>
                <td className="px-4 py-3 capitalize text-muted">{String(post.type)}</td>
                <td className="px-4 py-3 uppercase text-muted">{String(post.locale)}</td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => togglePublish(post)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        post.published
                          ? "bg-green-50 text-green-700"
                          : post.approval_status === "pending"
                            ? "bg-red-50 text-red-700"
                            : "bg-gold-100 text-gold-600"
                      }`}
                      title="Click to toggle"
                    >
                      {post.published
                        ? "Published"
                        : post.approval_status === "pending"
                          ? "Pending Approval"
                          : "Draft"}
                    </button>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        post.published
                          ? "bg-green-50 text-green-700"
                          : post.approval_status === "pending"
                            ? "bg-red-50 text-red-700"
                            : "bg-gold-100 text-gold-600"
                      }`}
                    >
                      {post.published
                        ? "Published"
                        : post.approval_status === "pending"
                          ? "Pending Approval"
                          : "Draft"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-red-500" /> {Number(post.likes ?? 0)}
                  </span>
                  <span className="ms-3 inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {Number(post.views ?? 0)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(post.published_at ?? post.created_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...post })}
                    className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {Boolean(post.published) && (
                    <a
                      href={`/${post.locale}/news/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                      aria-label="View live"
                      title="View live"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => remove(post)}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
