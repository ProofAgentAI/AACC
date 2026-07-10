"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  ImagePlus,
  MailPlus,
  Newspaper,
  Pencil,
  Plus,
  Send,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

type Row = Record<string, unknown>;
type Section = {
  title: string;
  date?: string;
  html?: string;
  image?: string;
  url?: string;
};

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusChip: Record<string, { label: string; classes: string }> = {
  draft: { label: "Draft", classes: "bg-gold-100 text-gold-600" },
  pending: { label: "Pending Approval", classes: "bg-red-50 text-red-700" },
  sent: { label: "Sent", classes: "bg-green-50 text-green-700" },
};

const emptyDraft: Row = {
  subject: "",
  headline: "",
  intro: "",
  main_image: "",
  main_image_credit: "",
  items: [] as Section[],
  status: "draft",
};

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
  const uploadTarget = useRef<(url: string) => void>(() => {});

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
        .select("title, excerpt, cover_image, slug, locale, published_at")
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

  const sections: Section[] = Array.isArray(draft?.items) ? (draft?.items as Section[]) : [];

  function setSections(next: Section[]) {
    setDraft((d) => (d ? { ...d, items: next } : d));
  }

  function updateSection(index: number, patch: Partial<Section>) {
    setSections(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function moveSection(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  }

  function addBlankSection() {
    setSections([
      ...sections,
      { title: "", date: new Date().toISOString().slice(0, 10), html: "" },
    ]);
  }

  function addPost(slugValue: string) {
    const post = posts.find((p) => p.slug === slugValue);
    if (!post) return;
    setSections([
      ...sections,
      {
        title: String(post.title),
        date: typeof post.published_at === "string" ? post.published_at.slice(0, 10) : undefined,
        html: post.excerpt ? `<p>${String(post.excerpt)}</p>` : "",
        url: `https://aacc-usa.org/${post.locale}/news/${post.slug}`,
        image: (post.cover_image as string) || undefined,
      },
    ]);
  }

  function pickImage(assign: (url: string) => void) {
    uploadTarget.current = assign;
    fileInputRef.current?.click();
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
    uploadTarget.current(data.publicUrl);
  }

  async function save(nextStatus?: "draft" | "pending"): Promise<string | null> {
    if (!supabase || !draft) return null;
    const subject = String(draft.subject ?? "").trim();
    if (!subject) {
      onNotice("An email subject is required.");
      return null;
    }
    setSaving(true);
    const payload = {
      subject,
      headline: String(draft.headline ?? "").trim() || null,
      intro: String(draft.intro ?? "").trim() || null,
      main_image: String(draft.main_image ?? "").trim() || null,
      main_image_credit: String(draft.main_image_credit ?? "").trim() || null,
      items: sections,
      status: nextStatus ?? (String(draft.status ?? "draft") as "draft" | "pending"),
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
    const id = await save("draft");
    if (id) {
      onNotice("Newsletter saved as draft.");
      setDraft(null);
      load();
    }
  }

  async function submitForApproval() {
    const id = await save("pending");
    if (id) {
      onNotice("Submitted to the administrator for approval and sending.");
      setDraft(null);
      load();
    }
  }

  async function returnToDraft() {
    const id = await save("draft");
    if (id) {
      onNotice("Returned to draft. The author can revise and resubmit.");
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
    const isPending = draft.status === "pending";
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-bold text-navy">
              {draft.id ? "Edit Newsletter" : "Create Newsletter"}
            </h2>
            {isPending && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Pending Approval{draft.created_by ? ` — by ${draft.created_by}` : ""}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Email Subject *
            </label>
            <input
              type="text"
              value={String(draft.subject ?? "")}
              onChange={(e) => setDraft((d) => (d ? { ...d, subject: e.target.value } : d))}
              className={inputClasses}
              placeholder="What recipients see in their inbox"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Headline</label>
            <input
              type="text"
              value={String(draft.headline ?? "")}
              onChange={(e) => setDraft((d) => (d ? { ...d, headline: e.target.value } : d))}
              className={inputClasses}
              placeholder="Big title at the top of the newsletter"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Intro Message</label>
            <textarea
              rows={3}
              value={String(draft.intro ?? "")}
              onChange={(e) => setDraft((d) => (d ? { ...d, intro: e.target.value } : d))}
              className={inputClasses}
              placeholder="Dear members and friends of the chamber, ..."
            />
          </div>

          {/* Main event photo with credit */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Main Photo (top of the newsletter)
            </label>
            {draft.main_image ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={String(draft.main_image)}
                  alt=""
                  className="h-16 w-28 rounded-lg border border-navy-100 object-cover"
                />
                <div className="flex flex-col gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() =>
                      pickImage((url) => setDraft((d) => (d ? { ...d, main_image: url } : d)))
                    }
                    disabled={uploading}
                    className="text-start text-green-600 hover:underline disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Replace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => (d ? { ...d, main_image: "" } : d))}
                    className="text-start text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  pickImage((url) => setDraft((d) => (d ? { ...d, main_image: url } : d)))
                }
                disabled={uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 bg-surface px-4 py-3 text-sm font-semibold text-navy hover:border-navy disabled:opacity-60"
              >
                <ImagePlus className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload main photo"}
              </button>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Photo Credit / Source
            </label>
            <input
              type="text"
              value={String(draft.main_image_credit ?? "")}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, main_image_credit: e.target.value } : d))
              }
              className={inputClasses}
              placeholder='e.g. "AACC-USA Summit 2026" or the source it came from'
            />
          </div>
        </div>

        {/* Sections */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading text-base font-bold text-navy">
              Sections ({sections.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) addPost(e.target.value);
                  e.target.value = "";
                }}
                className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy"
              >
                <option value="" disabled>
                  + Add from published articles
                </option>
                {posts.map((post) => (
                  <option key={String(post.slug)} value={String(post.slug)}>
                    {String(post.title)} ({String(post.locale).toUpperCase()})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addBlankSection}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-600"
              >
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {sections.length === 0 && (
              <p className="rounded-xl border border-dashed border-navy-200 px-4 py-8 text-center text-sm text-muted">
                No sections yet. Add a section and write its title, date, and HTML body — or pull
                in a published article.
              </p>
            )}
            {sections.map((section, index) => (
              <div key={index} className="rounded-2xl border border-navy-100 bg-surface p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Section {index + 1}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-navy disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 1)}
                      disabled={index === sections.length - 1}
                      className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-navy disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSections(sections.filter((_, i) => i !== index))}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-navy">Title *</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(index, { title: e.target.value })}
                      className={inputClasses}
                      placeholder="Section headline"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-navy">Date</label>
                    <input
                      type="date"
                      value={section.date ?? ""}
                      onChange={(e) => updateSection(index, { date: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-semibold text-navy">
                      Body (HTML)
                    </label>
                    <textarea
                      rows={5}
                      value={section.html ?? ""}
                      onChange={(e) => updateSection(index, { html: e.target.value })}
                      className={`${inputClasses} font-mono text-xs`}
                      placeholder="<p>Write this section's news here...</p>"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-navy">
                      Link (optional)
                    </label>
                    <input
                      type="url"
                      value={section.url ?? ""}
                      onChange={(e) => updateSection(index, { url: e.target.value })}
                      className={inputClasses}
                      placeholder="https://aacc-usa.org/en/news/..."
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => pickImage((url) => updateSection(index, { image: url }))}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-navy-300 bg-white px-3 py-2.5 text-xs font-semibold text-navy hover:border-navy disabled:opacity-60"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {section.image ? "Replace image" : "Add image"}
                    </button>
                    {section.image && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={section.image}
                          alt=""
                          className="h-9 w-14 rounded-md border border-navy-100 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => updateSection(index, { image: undefined })}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-600"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          {isAdmin ? (
            <>
              <button
                type="button"
                disabled={sending || saving}
                onClick={sendNow}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : `Send to ${subscriberCount} Subscribers`}
              </button>
              {isPending && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={returnToDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <Undo2 className="h-4 w-4" /> Return to Draft
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={submitForApproval}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {saving ? "Submitting..." : "Submit for Approval"}
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
        </div>

        {/* Aggregated preview */}
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
                  Preview — as subscribers will see it
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
                  <h3 className="font-heading text-2xl font-bold text-navy">
                    {String(draft.headline || draft.subject || "")}
                  </h3>
                  {Boolean(draft.main_image) && (
                    <figure className="mt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={String(draft.main_image)}
                        alt=""
                        className="max-h-64 w-full rounded-xl object-cover"
                      />
                      {Boolean(draft.main_image_credit) && (
                        <figcaption className="mt-1 text-xs italic text-muted">
                          Photo: {String(draft.main_image_credit)}
                        </figcaption>
                      )}
                    </figure>
                  )}
                  {Boolean(draft.intro) && (
                    <p className="mt-4 whitespace-pre-wrap text-sm text-ink">
                      {String(draft.intro)}
                    </p>
                  )}
                  <div className="mt-6 space-y-5">
                    {sections.map((section, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-navy-100"
                      >
                        {section.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={section.image}
                            alt=""
                            className="max-h-56 w-full object-cover"
                          />
                        )}
                        <div className="p-5">
                          {section.date && (
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                              {formatDate(section.date)}
                            </p>
                          )}
                          <p className="mt-1 font-heading text-lg font-bold text-navy">
                            {section.title || "Untitled section"}
                          </p>
                          <div
                            className="article-content mt-2 text-sm"
                            dangerouslySetInnerHTML={{ __html: section.html ?? "" }}
                          />
                          {section.url && (
                            <p className="mt-2 text-xs font-semibold text-green-600">
                              Read more →
                            </p>
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
  const pendingCount = campaigns.filter((c) => c.status === "pending").length;
  return (
    <div className="mt-6">
      {isAdmin && pendingCount > 0 && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>{pendingCount}</strong> newsletter{pendingCount > 1 ? "s" : ""} awaiting your
          approval — open to review and send.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Build multi-section news digests and send them to all{" "}
          <strong className="text-navy">{subscriberCount}</strong> subscribers from
          contact@aacc-usa.org.
        </p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyDraft })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <MailPlus className="h-4 w-4" /> Create Newsletter
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Newsletter</th>
              <th className="px-4 py-3 text-start">Sections</th>
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
                  <Newspaper className="mx-auto mb-2 h-6 w-6" />
                  No newsletters yet. Create the first issue.
                </td>
              </tr>
            )}
            {campaigns.map((campaign) => {
              const chip = statusChip[String(campaign.status)] ?? statusChip.draft;
              return (
                <tr key={String(campaign.id)} className="border-b border-navy-50">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-navy">{String(campaign.subject)}</span>
                    {campaign.headline ? (
                      <span className="block text-xs text-muted">{String(campaign.headline)}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {Array.isArray(campaign.items) ? campaign.items.length : 0}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-muted">
                    {String(campaign.created_by ?? "")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chip.classes}`}>
                      {campaign.status === "sent"
                        ? `Sent to ${campaign.sent_count}`
                        : chip.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDate(String(campaign.sent_at ?? campaign.created_at))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {campaign.status !== "sent" && (
                      <button
                        type="button"
                        onClick={() => setDraft({ ...campaign })}
                        className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                        aria-label="Edit"
                        title={campaign.status === "pending" ? "Review" : "Edit"}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
