"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  Eye,
  ImagePlus,
  List,
  Network,
  Pencil,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import BioHtml from "@/components/BioHtml";

type Row = Record<string, unknown>;

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const TIERS = [
  { value: "executive", label: "Executive Committee" },
  { value: "board", label: "Board of Directors" },
  { value: "leadership", label: "Leadership Team" },
  { value: "ambassadors", label: "Chamber Ambassadors" },
  { value: "advisory", label: "Advisory Council" },
  { value: "experts", label: "Expert Council" },
] as const;

const SEAT_STATUSES = [
  { value: "open", label: "Open" },
  { value: "priority", label: "Priority Vacancy" },
  { value: "candidate", label: "Candidate Identified" },
  { value: "future", label: "Future Role" },
  { value: "confirmed", label: "Confirmed (filled)" },
] as const;

const TIER_LABELS: Record<string, string> = {
  executive: "Executive Committee",
  board: "Board of Directors",
  leadership: "Leadership Team",
  ambassadors: "Chamber Ambassadors",
  advisory: "Advisory Council",
  experts: "Expert Council",
  team: "Leadership Team",
};

const emptyRole: Row = {
  name: "",
  name_ar: "",
  role_title: "",
  role_title_ar: "",
  tier: "executive",
  photo_url: "",
  bio: "",
  bio_ar: "",
  duties: "",
  duties_ar: "",
  suggested_profile: "",
  suggested_profile_ar: "",
  seat_status: "open",
  linkedin: "",
  sort_order: 100,
  published: true,
};

// Admin-only management of the organization structure shown on the public
// Our Team page: create or delete roles, fill them with people (photo + HTML
// bio), keep short public duties, and validate (publish) each change. The
// Chart view tracks the whole structure at a glance.
export default function TeamManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [members, setMembers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewLang, setPreviewLang] = useState<"en" | "ar" | null>(null);
  const [view, setView] = useState<"chart" | "list">("chart");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      onNotice(`Could not load the organization: ${error.message}`);
    } else {
      setMembers((data as Row[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  function set(field: string, value: unknown) {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  }

  const tierOf = (row: Row) => (row.tier === "team" ? "leadership" : String(row.tier));
  const membersIn = (tier: string) => members.filter((m) => tierOf(m) === tier);
  const isFilled = (row: Row) => Boolean(String(row.name ?? "").trim());

  // "Add role" inside a section: the editor opens on that section's template —
  // tier preset and the role slotted at the end of that section's order.
  const TIER_SORT_BASE: Record<string, number> = {
    executive: 1,
    board: 10,
    leadership: 20,
    ambassadors: 40,
    advisory: 50,
    experts: 60,
  };

  function newRoleIn(tier: string) {
    const existing = membersIn(tier).map((m) => Number(m.sort_order) || 0);
    const nextSort = existing.length > 0 ? Math.max(...existing) + 1 : TIER_SORT_BASE[tier] ?? 100;
    setDraft({ ...emptyRole, tier, sort_order: nextSort });
  }

  async function uploadPhoto(file: File) {
    if (!supabase) return;
    if (file.size > 2 * 1024 * 1024) {
      onNotice("Photo must be under 2 MB.");
      return;
    }
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "-").toLowerCase()}`;
    const { error } = await supabase.storage.from("team-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      onNotice(`Photo upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("team-photos").getPublicUrl(path);
    set("photo_url", data.publicUrl);
  }

  async function save(publish: boolean) {
    if (!supabase || !draft) return;
    const roleTitle = String(draft.role_title ?? "").trim();
    if (!roleTitle) {
      onNotice("A role title is required.");
      return;
    }
    setSaving(true);
    const name = String(draft.name ?? "").trim();
    const payload: Row = {
      name: name || null,
      name_ar: String(draft.name_ar ?? "").trim() || null,
      role_title: roleTitle,
      role_title_ar: String(draft.role_title_ar ?? "").trim() || null,
      tier: draft.tier === "team" ? "leadership" : draft.tier ?? "leadership",
      photo_url: String(draft.photo_url ?? "").trim() || null,
      bio: String(draft.bio ?? "").trim() || null,
      bio_ar: String(draft.bio_ar ?? "").trim() || null,
      duties: String(draft.duties ?? "").trim() || null,
      duties_ar: String(draft.duties_ar ?? "").trim() || null,
      suggested_profile: String(draft.suggested_profile ?? "").trim() || null,
      suggested_profile_ar: String(draft.suggested_profile_ar ?? "").trim() || null,
      seat_status: String(draft.seat_status ?? "open") || "open",
      linkedin: String(draft.linkedin ?? "").trim() || null,
      sort_order: Number(draft.sort_order) || 100,
      published: publish,
      updated_at: new Date().toISOString(),
    };
    const result = draft.id
      ? await supabase.from("team_members").update(payload).eq("id", draft.id)
      : await supabase.from("team_members").insert(payload);
    setSaving(false);
    if (result.error) {
      onNotice(`Save failed: ${result.error.message}`);
      return;
    }
    onNotice(
      publish
        ? `${name || roleTitle} is live on the public Team page.`
        : `${name || roleTitle} saved as a hidden draft — preview and publish when ready.`
    );
    setDraft(null);
    setPreviewLang(null);
    load();
  }

  async function togglePublished(member: Row) {
    if (!supabase) return;
    const { error } = await supabase
      .from("team_members")
      .update({ published: !member.published })
      .eq("id", member.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
    } else {
      onNotice(
        member.published
          ? `${member.name || member.role_title} hidden from the public page.`
          : `${member.name || member.role_title} validated and published.`
      );
      load();
    }
  }

  async function remove(member: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete the role "${member.role_title}"${member.name ? ` (${member.name})` : ""}?`))
      return;
    const { error } = await supabase.from("team_members").delete().eq("id", member.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      onNotice(`Role "${member.role_title}" deleted.`);
      load();
    }
  }

  if (draft) {
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">
            {draft.id
              ? `Edit: ${draft.name || draft.role_title}`
              : `New Role — ${TIER_LABELS[String(draft.tier)] ?? "Team"}`}
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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Role / Title (English) *
            </label>
            <input
              value={String(draft.role_title ?? "")}
              onChange={(e) => set("role_title", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Director – Trade & Investment"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Role / Title (Arabic)
            </label>
            <input
              dir="rtl"
              value={String(draft.role_title_ar ?? "")}
              onChange={(e) => set("role_title_ar", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Duties — few public words (English)
            </label>
            <input
              value={String(draft.duties ?? "")}
              onChange={(e) => set("duties", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Trade, investment, market access"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Duties (Arabic)
            </label>
            <input
              dir="rtl"
              value={String(draft.duties_ar ?? "")}
              onChange={(e) => set("duties_ar", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Name (English) — leave empty for an open role
            </label>
            <input
              value={String(draft.name ?? "")}
              onChange={(e) => set("name", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Dr. Amina Cherif"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Name (Arabic)</label>
            <input
              dir="rtl"
              value={String(draft.name_ar ?? "")}
              onChange={(e) => set("name_ar", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Section</label>
            <select
              value={String(draft.tier === "team" ? "leadership" : draft.tier ?? "leadership")}
              onChange={(e) => set("tier", e.target.value)}
              className={inputClasses}
            >
              {TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Order</label>
              <input
                type="number"
                min={1}
                value={Number(draft.sort_order ?? 100)}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Seat Status</label>
              <select
                value={String(draft.seat_status ?? "open")}
                onChange={(e) => set("seat_status", e.target.value)}
                className={inputClasses}
              >
                {SEAT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Ideal Profile / Requirements (English)
            </label>
            <input
              value={String(draft.suggested_profile ?? "")}
              onChange={(e) => set("suggested_profile", e.target.value)}
              className={inputClasses}
              placeholder="e.g. CPA / CFO / Controller"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Ideal Profile (Arabic)
            </label>
            <input
              dir="rtl"
              value={String(draft.suggested_profile_ar ?? "")}
              onChange={(e) => set("suggested_profile_ar", e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Photo */}
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-navy">Photo</span>
            <div className="flex items-center gap-4">
              {draft.photo_url ? (
                <span className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={String(draft.photo_url)}
                    alt="Photo preview"
                    className="h-20 w-20 rounded-full border border-navy-100 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set("photo_url", "")}
                    className="absolute -end-1 -top-1 rounded-full bg-red-600 p-1 text-white"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-navy-200 px-5 py-3 text-sm font-semibold text-navy hover:border-navy hover:bg-surface">
                  <ImagePlus className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload photo (square, max 2 MB)"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPhoto(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Bio (English) — HTML
            </label>
            <textarea
              rows={8}
              value={String(draft.bio ?? "")}
              onChange={(e) => set("bio", e.target.value)}
              className={`${inputClasses} font-mono text-xs leading-relaxed`}
              placeholder={'<p>First paragraph...</p>\n<p>Second paragraph with <strong>bold</strong>.</p>\n<h3>Recognition</h3>\n<ul>\n  <li>Award one</li>\n</ul>'}
            />
            <p className="mt-1 text-xs text-muted">
              HTML renders exactly like article content: &lt;p&gt;, &lt;h3&gt;, &lt;strong&gt;,
              &lt;ul&gt;/&lt;li&gt;, &lt;a&gt;. Plain text with blank-line paragraphs also works.
              Use Preview before publishing.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Bio (Arabic) — HTML
            </label>
            <textarea
              dir="rtl"
              rows={8}
              value={String(draft.bio_ar ?? "")}
              onChange={(e) => set("bio_ar", e.target.value)}
              className={`${inputClasses} font-mono text-xs leading-relaxed`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">LinkedIn URL</label>
            <input
              type="url"
              value={String(draft.linkedin ?? "")}
              onChange={(e) => set("linkedin", e.target.value)}
              className={inputClasses}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPreviewLang("en")}
            className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:border-navy hover:bg-surface"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => save(false)}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Draft (Hidden)"}
          </button>
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => save(true)}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Validate & Publish"}
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-lg px-6 py-3 text-sm font-semibold text-muted hover:bg-surface hover:text-navy"
          >
            Cancel
          </button>
        </div>

        {/* Live preview: exactly how the popup appears on the Team page */}
        {previewLang && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Bio preview"
          >
            <div
              className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
              onClick={() => setPreviewLang(null)}
              aria-hidden="true"
            />
            <div
              className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
              dir={previewLang === "ar" ? "rtl" : "ltr"}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-navy-100 bg-surface px-6 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Preview — this is what members and visitors see
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewLang("en")}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                      previewLang === "en" ? "bg-navy text-white" : "text-navy hover:bg-white"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang("ar")}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                      previewLang === "ar" ? "bg-navy text-white" : "text-navy hover:bg-white"
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang(null)}
                    className="ms-2 rounded-full p-2 text-muted hover:bg-white hover:text-navy"
                    aria-label="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-5 bg-navy-900 px-8 py-7">
                {draft.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(draft.photo_url)}
                    alt=""
                    className="h-20 w-20 rounded-2xl border border-white/20 object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-navy-200">
                    <UserRound className="h-10 w-10" aria-hidden="true" />
                  </span>
                )}
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    {previewLang === "ar"
                      ? String(draft.name_ar || draft.name || draft.role_title_ar || draft.role_title || "")
                      : String(draft.name || draft.role_title || "Role")}
                  </h2>
                  <p className="mt-0.5 text-sm font-semibold text-gold">
                    {previewLang === "ar"
                      ? String(draft.role_title_ar || draft.role_title || "")
                      : String(draft.role_title || "Role")}
                  </p>
                </div>
              </div>
              <div className="p-8">
                {String((previewLang === "ar" ? draft.duties_ar || draft.duties : draft.duties) ?? "").trim() && (
                  <div className="mb-6 rounded-xl border border-navy-100 bg-surface p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-navy">
                      {previewLang === "ar" ? "المسؤوليات" : "Responsibilities"}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {String(
                        (previewLang === "ar" ? draft.duties_ar || draft.duties : draft.duties) ?? ""
                      )}
                    </p>
                  </div>
                )}
                {String((previewLang === "ar" ? draft.bio_ar || draft.bio : draft.bio) ?? "").trim() ? (
                  <BioHtml
                    text={String(
                      (previewLang === "ar" ? draft.bio_ar || draft.bio : draft.bio) ?? ""
                    )}
                  />
                ) : (
                  <p className="text-sm text-muted">
                    No bio — the popup will show the responsibilities only.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-48 flex-1 text-sm text-muted">
          The organization structure on the public{" "}
          <a
            href="/en/team"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-600 hover:underline"
          >
            Our Team page <ExternalLink className="inline h-3 w-3" />
          </a>
          . Create or delete roles, fill seats, and validate to publish.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-navy-200 p-0.5">
            <button
              type="button"
              onClick={() => setView("chart")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${
                view === "chart" ? "bg-navy text-white" : "text-navy hover:bg-surface"
              }`}
            >
              <Network className="h-3.5 w-3.5" /> Chart
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold ${
                view === "list" ? "bg-navy text-white" : "text-navy hover:bg-surface"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDraft({ ...emptyRole })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
          >
            <UserPlus className="h-4 w-4" /> New Role
          </button>
        </div>
      </div>

      {view === "chart" ? (
        <div className="mt-6 space-y-2">
          {TIERS.map((tier, index) => {
            const tierMembers = membersIn(tier.value);
            const filledCount = tierMembers.filter(isFilled).length;
            return (
              <div key={tier.value}>
                {index > 0 && <div className="mx-auto h-6 w-px bg-navy-200" aria-hidden="true" />}
                <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-heading text-sm font-bold text-navy">{tier.label}</h3>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted">
                        {filledCount}/{tierMembers.length} filled
                      </span>
                      <button
                        type="button"
                        onClick={() => newRoleIn(tier.value)}
                        className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy hover:border-navy hover:bg-surface"
                        title={`Add a role to ${tier.label}`}
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Add role
                      </button>
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tierMembers.length === 0 && (
                      <span className="text-xs text-muted">No roles yet — add one.</span>
                    )}
                    {tierMembers.map((member) => (
                      <button
                        key={String(member.id)}
                        type="button"
                        onClick={() => setDraft({ ...member })}
                        title={`${member.role_title}${member.name ? ` — ${member.name}` : " — open role"}${member.published ? "" : " (hidden)"}`}
                        className={`max-w-56 truncate rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          !member.published
                            ? "border-navy-100 bg-surface text-muted"
                            : isFilled(member)
                              ? "border-navy bg-navy text-white hover:bg-navy-600"
                              : "border-dashed border-gold text-gold-600 hover:bg-gold-100/50"
                        }`}
                      >
                        {isFilled(member) ? String(member.name) : String(member.role_title)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-xs text-muted">
            Navy = filled &amp; published · gold dashed = open role · gray = hidden (not validated).
            Click any role to edit it.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 text-start">Role</th>
                <th className="px-4 py-3 text-start">Person</th>
                <th className="px-4 py-3 text-start">Section</th>
                <th className="px-4 py-3 text-start">Order</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No roles yet. Run supabase/schema-v20.sql to seed the organization structure,
                    or add the first role.
                  </td>
                </tr>
              )}
              {members.map((member) => (
                <tr key={String(member.id)} className="border-b border-navy-50">
                  <td className="max-w-64 px-4 py-3">
                    <span className="block truncate font-semibold text-navy">
                      {String(member.role_title)}
                    </span>
                    {member.duties ? (
                      <span className="block truncate text-xs text-muted">
                        {String(member.duties)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {member.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={String(member.photo_url)}
                          alt=""
                          className="h-8 w-8 rounded-full border border-navy-50 object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-300">
                          <UserRound className="h-4 w-4" />
                        </span>
                      )}
                      <span className={isFilled(member) ? "text-ink" : "text-muted"}>
                        {isFilled(member) ? String(member.name) : "Open role"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{TIER_LABELS[String(member.tier)]}</td>
                  <td className="px-4 py-3 text-muted">{String(member.sort_order)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => togglePublished(member)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        member.published ? "bg-green-50 text-green-700" : "bg-gold-100 text-gold-600"
                      }`}
                      title="Click to toggle"
                    >
                      {member.published ? "Published" : "Validate"}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDraft({ ...member })}
                      className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(member)}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
