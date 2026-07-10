"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Globe, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/admin";

type Row = Record<string, unknown>;

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

function formatDateTime(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Convert a timestamptz to the local value expected by <input type="datetime-local">.
function toLocalInput(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyEvent: Row = {
  title: "",
  slug: "",
  description: "",
  category: "",
  location: "",
  is_virtual: false,
  starts_at: "",
  register_url: "",
  locale: "en",
  published: false,
};

export default function EventsManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [events, setEvents] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? "");
    });
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true, nullsFirst: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load events: ${error.message}`);
    } else {
      setEvents((data as Row[]) ?? []);
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
    const published = wantsPublish && isAdmin;
    const startsLocal = String(draft.starts_at ?? "");
    const payload: Row = {
      title,
      slug: String(draft.slug ?? "").trim() || slugify(title),
      description: String(draft.description ?? "").trim() || null,
      category: String(draft.category ?? "").trim() || null,
      location: String(draft.location ?? "").trim() || null,
      is_virtual: Boolean(draft.is_virtual),
      starts_at: startsLocal ? new Date(startsLocal).toISOString() : null,
      register_url: String(draft.register_url ?? "").trim() || null,
      locale: draft.locale ?? "en",
      published,
      created_by: String(draft.created_by ?? "") || email || null,
      updated_at: new Date().toISOString(),
    };
    const result = draft.id
      ? await supabase.from("events").update(payload).eq("id", draft.id)
      : await supabase.from("events").insert(payload);
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
        ? "Event published."
        : wantsPublish
          ? "Saved. Ask the administrator to publish this event."
          : "Event saved as draft."
    );
    setDraft(null);
    load();
  }

  async function togglePublish(event: Row) {
    if (!supabase || !isAdmin) return;
    const { error } = await supabase
      .from("events")
      .update({ published: !event.published })
      .eq("id", event.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
    } else {
      load();
    }
  }

  async function remove(event: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete event "${event.title}"?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", event.id);
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
            {draft.id ? "Edit Event" : "New Event"}
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
                  d ? { ...d, title, slug: d.id || String(d.slug ?? "") ? d.slug : slugify(title) } : d
                );
              }}
              className={inputClasses}
              placeholder="e.g. Algerian-American Business Summit"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Date & Time</label>
            <input
              type="datetime-local"
              value={toLocalInput(draft.starts_at) || String(draft.starts_at ?? "")}
              onChange={(e) => set("starts_at", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Category</label>
            <input
              type="text"
              value={String(draft.category ?? "")}
              onChange={(e) => set("category", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Summit, Workshop, Roundtable"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Location</label>
            <input
              type="text"
              value={String(draft.location ?? "")}
              onChange={(e) => set("location", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Chicago, IL — or Virtual"
            />
          </div>
          <div className="grid grid-cols-2 items-end gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-medium text-navy">
              <input
                type="checkbox"
                checked={Boolean(draft.is_virtual)}
                onChange={(e) => set("is_virtual", e.target.checked)}
                className="h-4 w-4 accent-[#007A3D]"
              />
              Virtual event
            </label>
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
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Description</label>
            <textarea
              rows={4}
              value={String(draft.description ?? "")}
              onChange={(e) => set("description", e.target.value)}
              className={inputClasses}
              placeholder="What the event is about, who should attend..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Registration Link (optional)
            </label>
            <input
              type="url"
              value={String(draft.register_url ?? "")}
              onChange={(e) => set("register_url", e.target.value)}
              className={inputClasses}
              placeholder="https://forms... or Eventbrite/Zoom link"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Slug (URL id)</label>
            <input
              type="text"
              value={String(draft.slug ?? "")}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className={inputClasses}
              placeholder="auto-generated-from-title"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : isAdmin ? "Publish Event" : "Submit to Administrator"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface disabled:opacity-60"
          >
            Save as Draft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Published events appear on the public Events page in their language.
        </p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyEvent })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <CalendarPlus className="h-4 w-4" /> New Event
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Event</th>
              <th className="px-4 py-3 text-start">When</th>
              <th className="px-4 py-3 text-start">Where</th>
              <th className="px-4 py-3 text-start">Lang</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No events yet. Create the first one.
                </td>
              </tr>
            )}
            {events.map((event) => (
              <tr key={String(event.id)} className="border-b border-navy-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-navy">{String(event.title)}</span>
                  {event.category ? (
                    <span className="block text-xs text-muted">{String(event.category)}</span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDateTime(event.starts_at) || "TBD"}
                </td>
                <td className="px-4 py-3 text-muted">
                  {event.is_virtual ? "Virtual" : String(event.location ?? "")}
                </td>
                <td className="px-4 py-3 uppercase text-muted">{String(event.locale)}</td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => togglePublish(event)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.published ? "bg-green-50 text-green-700" : "bg-gold-100 text-gold-600"
                      }`}
                      title="Click to toggle"
                    >
                      {event.published ? "Published" : "Draft"}
                    </button>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.published ? "bg-green-50 text-green-700" : "bg-gold-100 text-gold-600"
                      }`}
                    >
                      {event.published ? "Published" : "Draft"}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...event })}
                    className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {Boolean(event.published) && (
                    <a
                      href={`/${event.locale}/events`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                      aria-label="View events page"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => remove(event)}
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
