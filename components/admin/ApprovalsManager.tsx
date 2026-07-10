"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Eye, Undo2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;

function formatDate(value: unknown) {
  if (typeof value !== "string") return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApprovalsManager({
  onNotice,
  onChanged,
}: {
  onNotice: (msg: string) => void;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Row | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("approval_status", "pending")
      .order("updated_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load approvals: ${error.message}`);
    } else {
      setPending((data as Row[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(post: Row) {
    if (!supabase) return;
    const { error } = await supabase
      .from("posts")
      .update({
        published: true,
        approval_status: "approved",
        published_at: post.published_at ?? new Date().toISOString(),
      })
      .eq("id", post.id);
    if (error) {
      onNotice(`Approve failed: ${error.message}`);
      return;
    }
    onNotice(`Approved and published: "${post.title}".`);
    setPreview(null);
    load();
    onChanged();
  }

  async function reject(post: Row) {
    if (!supabase) return;
    const { error } = await supabase
      .from("posts")
      .update({ published: false, approval_status: "draft" })
      .eq("id", post.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
      return;
    }
    onNotice(`Returned to draft: "${post.title}". The author can revise and resubmit.`);
    setPreview(null);
    load();
    onChanged();
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-muted">
        Content submitted by staff appears here for your review. Approving publishes it to the
        site immediately; rejecting returns it to the author as a draft.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Title</th>
              <th className="px-4 py-3 text-start">Author</th>
              <th className="px-4 py-3 text-start">Type</th>
              <th className="px-4 py-3 text-start">Lang</th>
              <th className="px-4 py-3 text-start">Submitted</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                  Nothing waiting for approval.
                </td>
              </tr>
            )}
            {pending.map((post) => (
              <tr key={String(post.id)} className="border-b border-navy-50">
                <td className="px-4 py-3 font-semibold text-navy">{String(post.title)}</td>
                <td className="px-4 py-3 text-muted">{String(post.created_by ?? "")}</td>
                <td className="px-4 py-3 capitalize text-muted">{String(post.type)}</td>
                <td className="px-4 py-3 uppercase text-muted">{String(post.locale)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(post.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPreview(post)}
                    className="me-2 inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-surface"
                  >
                    <Eye className="h-3.5 w-3.5" /> Review
                  </button>
                  <button
                    type="button"
                    onClick={() => approve(post)}
                    className="me-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-green-500 hover:to-green-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => reject(post)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Return to Draft
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review dialog: article rendered as it would appear once published */}
      {preview && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Review submission"
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setPreview(null)}
            aria-hidden="true"
          />
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            dir={preview.locale === "ar" ? "rtl" : "ltr"}
          >
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 bg-white/95 px-6 py-3 backdrop-blur">
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
                Awaiting approval — by {String(preview.created_by ?? "staff")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => approve(preview)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 text-xs font-semibold text-white hover:from-green-500 hover:to-green-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Publish
                </button>
                <button
                  type="button"
                  onClick={() => reject(preview)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Undo2 className="h-3.5 w-3.5" /> Return to Draft
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
                  aria-label="Close review"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div
              className="bg-gradient-to-b from-navy-900 to-navy-700 px-6 py-12 text-white sm:px-10"
              style={
                preview.cover_image
                  ? {
                      backgroundImage: `linear-gradient(rgba(7,21,39,0.75), rgba(11,31,58,0.85)), url(${preview.cover_image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy">
                  {String(preview.type ?? "article")}
                </span>
                {Boolean(preview.category) && (
                  <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-navy-100">
                    {String(preview.category)}
                  </span>
                )}
              </div>
              <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight sm:text-4xl">
                {String(preview.title ?? "")}
              </h1>
              {Boolean(preview.excerpt) && (
                <p className="mt-3 max-w-3xl text-lg leading-relaxed text-navy-100">
                  {String(preview.excerpt)}
                </p>
              )}
            </div>
            <div className="tricolor-bar h-1" aria-hidden="true" />
            <div className="px-6 py-10 sm:px-10">
              <article
                className="article-content"
                dangerouslySetInnerHTML={{ __html: String(preview.content_html ?? "") }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
