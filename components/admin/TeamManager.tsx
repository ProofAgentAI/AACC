"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, ImagePlus, Pencil, Trash2, UserPlus, UserRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const TIERS = [
  { value: "executive", label: "Executive Committee" },
  { value: "board", label: "Board of Directors" },
  { value: "team", label: "Our Team (staff & volunteers)" },
] as const;

const TIER_LABELS: Record<string, string> = {
  executive: "Executive Committee",
  board: "Board of Directors",
  team: "Our Team",
};

const emptyMember: Row = {
  name: "",
  name_ar: "",
  role_title: "",
  role_title_ar: "",
  tier: "executive",
  photo_url: "",
  bio: "",
  bio_ar: "",
  linkedin: "",
  sort_order: 100,
  published: true,
};

// Admin-only management of the public Our Team page: add members, change
// titles and tiers, upload photos, and edit bios (English and Arabic).
export default function TeamManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [members, setMembers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("tier", { ascending: true })
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      onNotice(`Could not load the team: ${error.message}`);
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

  async function uploadPhoto(file: File) {
    if (!supabase) return;
    if (file.size > 2 * 1024 * 1024) {
      onNotice("Photo must be under 2 MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
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
    void ext;
  }

  async function save() {
    if (!supabase || !draft) return;
    const name = String(draft.name ?? "").trim();
    const roleTitle = String(draft.role_title ?? "").trim();
    if (!name || !roleTitle) {
      onNotice("A name and a role title are required.");
      return;
    }
    setSaving(true);
    const payload: Row = {
      name,
      name_ar: String(draft.name_ar ?? "").trim() || null,
      role_title: roleTitle,
      role_title_ar: String(draft.role_title_ar ?? "").trim() || null,
      tier: draft.tier ?? "team",
      photo_url: String(draft.photo_url ?? "").trim() || null,
      bio: String(draft.bio ?? "").trim() || null,
      bio_ar: String(draft.bio_ar ?? "").trim() || null,
      linkedin: String(draft.linkedin ?? "").trim() || null,
      sort_order: Number(draft.sort_order) || 100,
      published: Boolean(draft.published),
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
    onNotice(draft.id ? "Team member updated." : `${name} added to the team page.`);
    setDraft(null);
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
      load();
    }
  }

  async function remove(member: Row) {
    if (!supabase) return;
    if (!window.confirm(`Remove ${member.name} from the team page?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", member.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      onNotice(`${member.name} removed.`);
      load();
    }
  }

  if (draft) {
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">
            {draft.id ? `Edit: ${draft.name}` : "Add Team Member"}
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
            <label className="mb-1.5 block text-sm font-semibold text-navy">Name (English) *</label>
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
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Role / Title (English) *
            </label>
            <input
              value={String(draft.role_title ?? "")}
              onChange={(e) => set("role_title", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Treasurer"
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
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Section</label>
            <select
              value={String(draft.tier ?? "team")}
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
          <div className="grid grid-cols-2 items-end gap-3">
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
            <label className="inline-flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-medium text-navy">
              <input
                type="checkbox"
                checked={Boolean(draft.published)}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 accent-[#007A3D]"
              />
              Visible on the site
            </label>
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
            <label className="mb-1.5 block text-sm font-semibold text-navy">Bio (English)</label>
            <textarea
              rows={6}
              value={String(draft.bio ?? "")}
              onChange={(e) => set("bio", e.target.value)}
              className={inputClasses}
              placeholder="Separate paragraphs with a blank line."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Bio (Arabic)</label>
            <textarea
              dir="rtl"
              rows={6}
              value={String(draft.bio_ar ?? "")}
              onChange={(e) => set("bio_ar", e.target.value)}
              className={inputClasses}
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
            disabled={saving || uploading}
            onClick={save}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : draft.id ? "Save Changes" : "Add to Team Page"}
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-48 flex-1 text-sm text-muted">
          These people appear on the public{" "}
          <a
            href="/en/team"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-600 hover:underline"
          >
            Our Team page <ExternalLink className="inline h-3 w-3" />
          </a>
          , grouped by section and ordered by the Order field.
        </p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyMember })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <UserPlus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Member</th>
              <th className="px-4 py-3 text-start">Section</th>
              <th className="px-4 py-3 text-start">Order</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No team members yet. Add the first one — run supabase/schema-v19.sql first if
                  this list will not load.
                </td>
              </tr>
            )}
            {members.map((member) => (
              <tr key={String(member.id)} className="border-b border-navy-50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(member.photo_url)}
                        alt=""
                        className="h-10 w-10 rounded-full border border-navy-50 object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-300">
                        <UserRound className="h-5 w-5" />
                      </span>
                    )}
                    <span>
                      <span className="block font-semibold text-navy">{String(member.name)}</span>
                      <span className="block text-xs text-muted">
                        {String(member.role_title)}
                      </span>
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
                      member.published ? "bg-green-50 text-green-700" : "bg-surface text-muted"
                    }`}
                    title="Click to toggle visibility"
                  >
                    {member.published ? "Visible" : "Hidden"}
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
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
