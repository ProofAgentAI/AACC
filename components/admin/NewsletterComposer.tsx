"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, ImagePlus, MailPlus, Newspaper, Pencil, Send, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

type Row = Record<string, unknown>;
type Item = { title: string; description?: string; url?: string; image?: string };

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

function formatDate(value: unknown) {
  if (typeof value !== "string") return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const emptyDraft: Row = { subject: "", intro: "", items: [] as Item[] };

export default function NewsletterComposer({ onNotice }: { onNotice: (msg: string) => void }) {
  const [campaigns, setCampaigns] = useState<Row[]>([]);
  const [posts, setPosts] = useState<Row[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [custom, setCustom] = useState<Item>({ title: "" });

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? "");
      setIsAdmin(isAdminUser(data.session?.user));
    });
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [n, p, s] = await Promise.all([
      supabase.from("newsletters").select("*").order("created_at", { ascending: false }),
      supabase
        .from("posts")
        .select("title, excerpt, cover_image, slug, locale, published")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(20),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    ]);
    if (n.error) onNotice(`Could not load newsletters: ${n.error.message}`);
    setCampaigns((n.data as Row[]) ?? []);
    setPosts((p.data as Row[]) ?? []);
    setSubscriberCount(s.count ?? 0);
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  const items: Item[] = Array.isArray(draft?.items) ? (draft?.items as Item[]) : [];

  function setItems(next: Item[]) {
    setDraft((d) => (d ? { ...d, items: next } : d));
  }

  function addPost(slugValue: string) {
    const post = posts.find((p) => p.slug === slugValue);
    if (!post) return;
    setItems([
      ...items,
      {
        title: String(post.title),
        description: String(post.excerpt ?? ""),
        url: `https://aacc-usa.org/${post.locale}/news/${post.slug}`,
        image: (post.cover_image as string) || undefined,
      },
    ]);
  }

  async function uploadImage(file: File) {
    if (!supabase) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      onNotice("Please choose an image under 5 MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `newsletter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, file, { cacheControl: "31536000", contentType: file.type });
    setUploading(false);
    if (error) {
      onNotice(`Upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setCustom((c) => ({ ...c, image: data.publicUrl }));
  }

  async function save(): Promise<string | null> {
    if (!supabase || !draft) return null;
    const subject = String(draft.subject ?? "").trim();
    if (!subject) {
      onNotice("A subject is required.");
      return null;
    }
    setSaving(true);
    const payload = {
      subject,
      intro: String(draft.intro ?? "").trim() || null,
      items,
      created_by: String(draft.created_by ?? "") || email || null,
      updated_at: new Date().toISOString(),
    };
    const result = draft.id
      ? await supabase.from("newsletters").update(payload).eq("id", draft.id).select("id").single()
      : await supabase.from("newsletters").insert(payload).select("id").single();
    setSaving(false);
    if (result.error) {
      onNotice(`Save failed: ${result.error.message}`);
      return null;
    }
    return String(result.data.id);
  }

  async function saveDraft() {
    const id = await save();
    if (id) {
      onNotice("Newsletter saved as draft.");
      setDraft(null);
      load();
    }
  }

  async function sendNow() {
    if (!supabase) return;
    const id = await save();
    if (!id) return;
    if (
      !window.confirm(
        `Send this newsletter to all ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"} from contact@aacc-usa.org?`
      )
    )
      return;
    setSending(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    const body = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      onNotice(body.error ?? "Sending failed.");
      return;
    }
    onNotice(`Newsletter sent to ${body.sent} subscriber${body.sent === 1 ? "" : "s"}.`);
    setDraft(null);
    load();
  }

  async function remove(campaign: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete "${campaign.subject}"?`)) return;
    const { error } = await supabase.from("newsletters").delete().eq("id", campaign.id);
    if (error) onNotice(`Delete failed: ${error.message}`);
    else load();
  }

  // ------------------------- Composer -------------------------
  if (draft) {
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">
            {draft.id ? "Edit Newsletter" : "New Newsletter"}
          </h2>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Subject *</label>
            <input
              type="text"
              value={String(draft.subject ?? "")}
              onChange={(e) => setDraft((d) => (d ? { ...d, subject: e.target.value } : d))}
              className={inputClasses}
              placeholder="e.g. AACC-USA News — Chamber launch, board update, upcoming summit"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Intro Message</label>
            <textarea
              rows={3}
              value={String(draft.intro ?? "")}
              onChange={(e) => setDraft((d) => (d ? { ...d, intro: e.target.value } : d))}
              className={inputClasses}
              placeholder="Dear members and friends of the chamber, ..."
            />
          </div>

          {/* News items in this issue */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              News in this issue ({items.length})
            </label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-navy-100 bg-surface px-3 py-2.5"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <Newspaper className="h-5 w-5 shrink-0 text-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                    {item.url && <p className="truncate text-xs text-muted">{item.url}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                    className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="rounded-xl border border-dashed border-navy-200 px-4 py-5 text-center text-sm text-muted">
                  Add published articles below, or write a custom item.
                </p>
              )}
            </div>
          </div>

          {/* Add from published articles */}
          <div className="rounded-xl border border-navy-100 bg-surface p-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy">
              Add a published article
            </label>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) addPost(e.target.value);
                e.target.value = "";
              }}
              className={inputClasses}
            >
              <option value="" disabled>
                Choose from the News page...
              </option>
              {posts.map((post) => (
                <option key={String(post.slug)} value={String(post.slug)}>
                  {String(post.title)} ({String(post.locale).toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Custom item */}
          <div className="rounded-xl border border-navy-100 bg-surface p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy">
              Add a custom item
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={custom.title}
                onChange={(e) => setCustom((c) => ({ ...c, title: e.target.value }))}
                className={inputClasses}
                placeholder="Title *"
              />
              <input
                type="url"
                value={custom.url ?? ""}
                onChange={(e) => setCustom((c) => ({ ...c, url: e.target.value }))}
                className={inputClasses}
                placeholder="Link (optional)"
              />
              <textarea
                rows={2}
                value={custom.description ?? ""}
                onChange={(e) => setCustom((c) => ({ ...c, description: e.target.value }))}
                className={`${inputClasses} sm:col-span-2`}
                placeholder="Short description (optional)"
              />
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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-navy-300 px-4 py-2 text-xs font-semibold text-navy hover:border-navy disabled:opacity-60"
                >
                  <ImagePlus className="h-4 w-4" />
                  {uploading ? "Uploading..." : custom.image ? "Replace picture" : "Add picture"}
                </button>
                {custom.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={custom.image} alt="" className="h-9 w-12 rounded-md object-cover" />
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!custom.title.trim()) return;
                  setItems([...items, { ...custom, title: custom.title.trim() }]);
                  setCustom({ title: "" });
                }}
                className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-600"
              >
                Add to issue
              </button>
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
          {isAdmin && (
            <button
              type="button"
              disabled={sending || saving}
              onClick={sendNow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : `Send to ${subscriberCount} Subscribers`}
            </button>
          )}
          <button
            type="button"
            disabled={saving || sending}
            onClick={saveDraft}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          {!isAdmin && (
            <p className="text-xs text-muted">
              Save your draft; the administrator reviews and sends campaigns.
            </p>
          )}
        </div>

        {/* Email preview */}
        {previewOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter preview"
          >
            <div
              className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
              onClick={() => setPreviewOpen(false)}
              aria-hidden="true"
            />
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-surface p-4 shadow-2xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-600">
                  Email preview
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-full p-2 text-muted hover:bg-white hover:text-navy"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
                <div className="bg-navy px-6 py-4">
                  <span className="font-heading text-lg font-bold text-white">
                    AACC<span className="text-gold">-</span>USA
                  </span>
                  <p className="text-[10px] uppercase tracking-widest text-navy-200">
                    Algerian American Chamber of Commerce
                  </p>
                </div>
                <div className="tricolor-bar h-1" />
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-navy">
                    {String(draft.subject ?? "")}
                  </h3>
                  {Boolean(draft.intro) && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-ink">
                      {String(draft.intro)}
                    </p>
                  )}
                  <div className="mt-5 space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="overflow-hidden rounded-xl border border-navy-100">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="max-h-56 w-full object-cover" />
                        )}
                        <div className="p-4">
                          <p className="font-heading text-base font-bold text-navy">{item.title}</p>
                          {item.description && (
                            <p className="mt-1.5 text-sm text-muted">{item.description}</p>
                          )}
                          {item.url && (
                            <p className="mt-2 text-xs font-semibold text-green-600">Read more →</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------- Campaign list -------------------------
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Compose news digests and send them to all{" "}
          <strong className="text-navy">{subscriberCount}</strong> subscribers from
          contact@aacc-usa.org.
        </p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyDraft })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <MailPlus className="h-4 w-4" /> New Newsletter
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Subject</th>
              <th className="px-4 py-3 text-start">Items</th>
              <th className="px-4 py-3 text-start">By</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No newsletters yet. Compose the first issue.
                </td>
              </tr>
            )}
            {campaigns.map((campaign) => (
              <tr key={String(campaign.id)} className="border-b border-navy-50">
                <td className="px-4 py-3 font-semibold text-navy">{String(campaign.subject)}</td>
                <td className="px-4 py-3 text-muted">
                  {Array.isArray(campaign.items) ? campaign.items.length : 0}
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-muted">
                  {String(campaign.created_by ?? "")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      campaign.status === "sent"
                        ? "bg-green-50 text-green-700"
                        : "bg-gold-100 text-gold-600"
                    }`}
                  >
                    {campaign.status === "sent"
                      ? `Sent to ${campaign.sent_count}`
                      : "Draft"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(campaign.sent_at ?? campaign.created_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {campaign.status !== "sent" && (
                    <button
                      type="button"
                      onClick={() => setDraft({ ...campaign })}
                      className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => remove(campaign)}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
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
