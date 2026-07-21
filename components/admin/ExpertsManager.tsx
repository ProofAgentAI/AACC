"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  ExternalLink,
  Linkedin,
  Mail,
  Pencil,
  Star,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";
import { EXPERT_DOMAINS, domainLabel, subdomainLabel } from "@/data/expertise";

type Row = Record<string, unknown>;

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const MAX_HIGHLIGHTED = 9;

const FILTERS = [
  { value: "pending", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "All" },
] as const;

const statusColors: Record<string, string> = {
  pending: "bg-gold-100 text-gold-600",
  approved: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-700",
};

// Expert Council review desk: approve applications (approval publishes the
// expert straight to /experts under their domain), highlight up to nine for
// the featured grid, edit profiles, invite experts to the member portal.
export default function ExpertsManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [experts, setExperts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("pending");
  const [detail, setDetail] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setIsAdmin(isAdminUser(data.session?.user));
    });
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load experts: ${error.message}`);
    } else {
      setExperts((data as Row[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  const highlightedCount = experts.filter((e) => e.highlighted && e.status === "approved").length;

  async function setStatus(expert: Row, status: string) {
    if (!supabase) return;
    const patch: Row = { status, updated_at: new Date().toISOString() };
    if (status !== "approved") patch.highlighted = false;
    const { error } = await supabase.from("experts").update(patch).eq("id", expert.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
      return;
    }
    onNotice(
      status === "approved"
        ? `${expert.name} approved — now live in the Expert Council directory under ${expert.domain}.`
        : status === "declined"
          ? `${expert.name} declined.`
          : `${expert.name} moved back to review.`
    );
    setDetail(null);
    load();
  }

  async function toggleHighlight(expert: Row) {
    if (!supabase) return;
    if (expert.status !== "approved") {
      onNotice("Approve the expert first — only approved experts can be highlighted.");
      return;
    }
    const next = !expert.highlighted;
    if (next && highlightedCount >= MAX_HIGHLIGHTED) {
      onNotice(`You can highlight up to ${MAX_HIGHLIGHTED} experts. Unhighlight one first.`);
      return;
    }
    const { error } = await supabase
      .from("experts")
      .update({ highlighted: next })
      .eq("id", expert.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
    } else {
      onNotice(
        next
          ? `${expert.name} is now featured on the public page (${highlightedCount + 1}/${MAX_HIGHLIGHTED}).`
          : `${expert.name} removed from the featured grid.`
      );
      load();
    }
  }

  async function remove(expert: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete ${expert.name} from the Expert Council permanently?`)) return;
    const { error } = await supabase.from("experts").delete().eq("id", expert.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      onNotice(`${expert.name} deleted.`);
      setDetail(null);
      load();
    }
  }

  // Invite the expert to the member portal (individual member account with a
  // temporary password emailed from contact@aacc-usa.org).
  async function inviteToPortal(expert: Row) {
    if (!supabase) return;
    const email = String(expert.email ?? "").trim().toLowerCase();
    if (!window.confirm(`Invite ${expert.name} (${email}) to the member portal?`)) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, role: "individual" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      onNotice(body.error ?? "Could not send the portal invitation.");
      return;
    }
    onNotice(
      body.welcomed
        ? `Portal account created for ${email}; sign-in details emailed from contact@aacc-usa.org.`
        : `Portal account created for ${email}, but the email could not be sent — manage it from the Users tab.`
    );
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || !editing) return;
    const data = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("experts")
      .update({
        name: String(data.get("name") ?? "").trim(),
        title: String(data.get("title") ?? "").trim(),
        organization: String(data.get("organization") ?? "").trim() || null,
        city_state: String(data.get("cityState") ?? "").trim() || null,
        linkedin: String(data.get("linkedin") ?? "").trim() || null,
        domain: String(data.get("domain") ?? ""),
        subdomain: String(data.get("subdomain") ?? "") || null,
        bio: String(data.get("bio") ?? "").trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) {
      onNotice(`Save failed: ${error.message}`);
      return;
    }
    onNotice(`${data.get("name")} updated.`);
    setEditing(null);
    setDetail(null);
    load();
  }

  const visible = experts.filter((e) => filter === "all" || e.status === filter);
  const counts = {
    pending: experts.filter((e) => e.status === "pending").length,
    approved: experts.filter((e) => e.status === "approved").length,
    declined: experts.filter((e) => e.status === "declined").length,
    all: experts.length,
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                filter === f.value
                  ? "bg-navy text-white"
                  : "border border-navy-200 text-navy hover:bg-surface"
              }`}
            >
              {f.label} ({counts[f.value]})
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          <Star className="me-1 inline h-4 w-4 text-gold-600" />
          Featured: {highlightedCount}/{MAX_HIGHLIGHTED} ·{" "}
          <a
            href="/en/experts"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-600 hover:underline"
          >
            View public page <ExternalLink className="inline h-3 w-3" />
          </a>
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Expert</th>
              <th className="px-4 py-3 text-start">Domain</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Featured</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  {filter === "pending"
                    ? "No applications under review. New applications from the public Expert Council page land here."
                    : "Nothing here yet."}
                </td>
              </tr>
            )}
            {visible.map((expert) => (
              <tr
                key={String(expert.id)}
                onClick={() => setDetail(expert)}
                className="cursor-pointer border-b border-navy-50 transition-colors hover:bg-surface"
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    {expert.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={String(expert.photo_url)}
                        alt=""
                        className="h-10 w-10 rounded-full border border-navy-50 object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-300">
                        <UserRound className="h-5 w-5" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy">
                        {String(expert.name)}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {String(expert.title)}
                        {expert.organization ? ` · ${expert.organization}` : ""}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="max-w-52 px-4 py-3 text-muted">
                  <span className="block truncate">{domainLabel(String(expert.domain), "en")}</span>
                  {expert.subdomain ? (
                    <span className="block truncate text-xs">
                      {subdomainLabel(String(expert.domain), String(expert.subdomain), "en")}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {isAdmin ? (
                    <select
                      value={String(expert.status)}
                      onChange={(e) => setStatus(expert, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${
                        statusColors[String(expert.status)] ?? "bg-surface text-navy"
                      }`}
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="declined">declined</option>
                    </select>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[String(expert.status)] ?? "bg-surface text-navy"
                      }`}
                    >
                      {String(expert.status)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => toggleHighlight(expert)}
                      className={`rounded-lg p-2 transition-colors ${
                        expert.highlighted
                          ? "text-gold-600 hover:bg-gold-100"
                          : "text-muted hover:bg-gold-100 hover:text-gold-600"
                      }`}
                      aria-label={expert.highlighted ? "Remove from featured" : "Feature on the public page"}
                      title={
                        expert.highlighted
                          ? "Featured on the public page"
                          : `Feature on the public page (max ${MAX_HIGHLIGHTED})`
                      }
                    >
                      <Star className={`h-4 w-4 ${expert.highlighted ? "fill-current" : ""}`} />
                    </button>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`mailto:${expert.email}?subject=${encodeURIComponent("Your AACC-USA Expert Council application")}`}
                    className="inline-block rounded-lg p-2 text-muted hover:bg-green-50 hover:text-green-600"
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing({ ...expert })}
                        className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => inviteToPortal(expert)}
                        className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                        aria-label="Invite to the member portal"
                        title="Invite to the member portal"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(expert)}
                        className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      {detail && !editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={String(detail.name)}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setDetail(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-5 bg-navy-900 px-8 py-7">
              {detail.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(detail.photo_url)}
                  alt=""
                  className="h-20 w-20 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-navy-200">
                  <UserRound className="h-10 w-10" />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-bold text-white">{String(detail.name)}</h2>
                <p className="mt-0.5 text-sm font-semibold text-gold">{String(detail.title)}</p>
                {detail.organization ? (
                  <p className="mt-0.5 text-xs text-navy-100">{String(detail.organization)}</p>
                ) : null}
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[String(detail.status)] ?? "bg-surface text-navy"
                  }`}
                >
                  {String(detail.status)}
                </span>
                <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy">
                  {domainLabel(String(detail.domain), "en")}
                </span>
                {detail.subdomain ? (
                  <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                    {subdomainLabel(String(detail.domain), String(detail.subdomain), "en")}
                  </span>
                ) : null}
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email</dt>
                  <dd className="mt-0.5 text-ink">{String(detail.email)}</dd>
                </div>
                {detail.city_state ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                      City / State
                    </dt>
                    <dd className="mt-0.5 text-ink">{String(detail.city_state)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Bio</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed text-ink">
                    {String(detail.bio)}
                  </dd>
                </div>
              </dl>
              {detail.linkedin ? (
                <a
                  href={String(detail.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn profile
                </a>
              ) : null}
              {isAdmin && (
                <div className="mt-7 flex flex-wrap gap-3 border-t border-navy-50 pt-5">
                  {detail.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => setStatus(detail, "approved")}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
                    >
                      <BadgeCheck className="h-4 w-4" /> Approve & Publish
                    </button>
                  )}
                  {detail.status !== "declined" && (
                    <button
                      type="button"
                      onClick={() => setStatus(detail, "declined")}
                      className="rounded-lg border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Decline
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => inviteToPortal(detail)}
                    className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-6 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
                  >
                    <UserPlus className="h-4 w-4" /> Invite to Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${editing.name}`}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="absolute end-4 top-4 rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-lg font-bold text-navy">Edit: {String(editing.name)}</h2>
            <form onSubmit={saveEdit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="name" defaultValue={String(editing.name ?? "")} required className={inputClasses} placeholder="Name" />
              <input name="title" defaultValue={String(editing.title ?? "")} required className={inputClasses} placeholder="Title" />
              <input name="organization" defaultValue={String(editing.organization ?? "")} className={inputClasses} placeholder="Organization" />
              <input name="cityState" defaultValue={String(editing.city_state ?? "")} className={inputClasses} placeholder="City / State" />
              <select name="domain" defaultValue={String(editing.domain ?? "")} required className={inputClasses}>
                {EXPERT_DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.en}
                  </option>
                ))}
              </select>
              <input name="subdomain" defaultValue={String(editing.subdomain ?? "")} className={inputClasses} placeholder="Sub-expertise" />
              <input name="linkedin" defaultValue={String(editing.linkedin ?? "")} className={`${inputClasses} sm:col-span-2`} placeholder="LinkedIn URL" />
              <textarea name="bio" defaultValue={String(editing.bio ?? "")} required rows={5} className={`${inputClasses} sm:col-span-2`} placeholder="Bio" />
              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-navy-200 px-6 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
