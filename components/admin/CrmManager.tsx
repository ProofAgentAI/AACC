"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;

const CONTACT_TYPES = ["member", "business", "sponsor", "partner", "board", "media", "community", "other"];
const CONTACT_STATUSES = ["lead", "contacted", "engaged", "active", "inactive"];
const ACTIVITY_KINDS = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
];

const statusColors: Record<string, string> = {
  lead: "bg-gold-100 text-gold-600",
  contacted: "bg-navy-50 text-navy",
  engaged: "bg-green-50 text-green-700",
  active: "bg-green-50 text-green-700",
  inactive: "bg-surface text-muted",
};

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const emptyContact: Row = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  organization: "",
  role_title: "",
  type: "other",
  status: "lead",
  tags: [],
  notes: "",
  next_action: "",
  next_action_date: "",
};

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fullName(contact: Row) {
  return `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim();
}

function isDue(contact: Row) {
  const date = contact.next_action_date;
  if (typeof date !== "string" || !date) return false;
  return date <= new Date().toISOString().slice(0, 10);
}

export default function CrmManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [contacts, setContacts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [activities, setActivities] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("crm_contacts")
      .select("*")
      .order("updated_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load CRM: ${error.message}`);
    } else {
      setContacts((data as Row[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  async function openContact(contact: Row) {
    setSelected(contact);
    if (!supabase) return;
    const { data } = await supabase
      .from("crm_activities")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });
    setActivities((data as Row[]) ?? []);
  }

  async function saveContact() {
    if (!supabase || !editing) return;
    const first = String(editing.first_name ?? "").trim();
    const email = String(editing.email ?? "").trim().toLowerCase();
    if (!first || !email) {
      onNotice("First name and email are required.");
      return;
    }
    setSaving(true);
    const tags = Array.isArray(editing.tags)
      ? editing.tags
      : String(editing.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    const payload: Row = {
      first_name: first,
      last_name: String(editing.last_name ?? "").trim() || null,
      email,
      phone: String(editing.phone ?? "").trim() || null,
      organization: String(editing.organization ?? "").trim() || null,
      role_title: String(editing.role_title ?? "").trim() || null,
      type: editing.type ?? "other",
      status: editing.status ?? "lead",
      tags,
      notes: String(editing.notes ?? "").trim() || null,
      next_action: String(editing.next_action ?? "").trim() || null,
      next_action_date: String(editing.next_action_date ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    };
    const result = editing.id
      ? await supabase.from("crm_contacts").update(payload).eq("id", editing.id)
      : await supabase.from("crm_contacts").insert(payload);
    setSaving(false);
    if (result.error) {
      onNotice(
        result.error.code === "23505"
          ? "A contact with this email already exists in the CRM."
          : `Save failed: ${result.error.message}`
      );
      return;
    }
    onNotice("Contact saved.");
    setEditing(null);
    setSelected(null);
    load();
  }

  async function removeContact(contact: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete ${fullName(contact)} and their activity history?`)) return;
    const { error } = await supabase.from("crm_contacts").delete().eq("id", contact.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      setSelected(null);
      load();
    }
  }

  async function addActivity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || !selected) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const note = String(data.get("note") ?? "").trim();
    if (!note) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.from("crm_activities").insert({
      contact_id: selected.id,
      kind: String(data.get("kind") ?? "note"),
      note,
      created_by: sessionData.session?.user.email ?? null,
    });
    if (error) {
      onNotice(`Could not add activity: ${error.message}`);
      return;
    }
    form.reset();
    await supabase
      .from("crm_contacts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", selected.id);
    openContact(selected);
  }

  const due = contacts.filter(isDue);
  const filtered = contacts.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      fullName(c),
      c.email,
      c.organization,
      c.role_title,
      Array.isArray(c.tags) ? c.tags.join(" ") : "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  // ---------------- Contact editor ----------------
  if (editing) {
    const set = (field: string, value: unknown) =>
      setEditing((d) => (d ? { ...d, [field]: value } : d));
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">
            {editing.id ? "Edit Contact" : "New Contact"}
          </h2>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">First Name *</label>
            <input
              type="text"
              value={String(editing.first_name ?? "")}
              onChange={(e) => set("first_name", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Last Name</label>
            <input
              type="text"
              value={String(editing.last_name ?? "")}
              onChange={(e) => set("last_name", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Email *</label>
            <input
              type="email"
              value={String(editing.email ?? "")}
              onChange={(e) => set("email", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Phone</label>
            <input
              type="tel"
              value={String(editing.phone ?? "")}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Organization</label>
            <input
              type="text"
              value={String(editing.organization ?? "")}
              onChange={(e) => set("organization", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Role / Title</label>
            <input
              type="text"
              value={String(editing.role_title ?? "")}
              onChange={(e) => set("role_title", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Type</label>
              <select
                value={String(editing.type ?? "other")}
                onChange={(e) => set("type", e.target.value)}
                className={inputClasses}
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Status</label>
              <select
                value={String(editing.status ?? "lead")}
                onChange={(e) => set("status", e.target.value)}
                className={inputClasses}
              >
                {CONTACT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={Array.isArray(editing.tags) ? editing.tags.join(", ") : String(editing.tags ?? "")}
              onChange={(e) => set("tags", e.target.value)}
              className={inputClasses}
              placeholder="vip, chicago, energy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Next Action</label>
            <input
              type="text"
              value={String(editing.next_action ?? "")}
              onChange={(e) => set("next_action", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Follow up on sponsorship deck"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Next Action Date</label>
            <input
              type="date"
              value={String(editing.next_action_date ?? "")}
              onChange={(e) => set("next_action_date", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Notes</label>
            <textarea
              rows={4}
              value={String(editing.notes ?? "")}
              onChange={(e) => set("notes", e.target.value)}
              className={inputClasses}
              placeholder="Background, context, how you met..."
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={saveContact}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Contact"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Contact detail + timeline ----------------
  if (selected) {
    return (
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" /> All contacts
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-navy">{fullName(selected)}</h2>
            <p className="mt-1 text-sm text-muted">
              {[selected.role_title, selected.organization].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[String(selected.status)] ?? "bg-surface text-navy"
                }`}
              >
                {String(selected.status)}
              </span>
              <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold capitalize text-navy">
                {String(selected.type)}
              </span>
              {(Array.isArray(selected.tags) ? selected.tags : []).map((tag) => (
                <span
                  key={String(tag)}
                  className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted"
                >
                  #{String(tag)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`mailto:${selected.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
            <button
              type="button"
              onClick={() => setEditing({ ...selected })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-surface"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button
              type="button"
              onClick={() => removeContact(selected)}
              className="rounded-lg border border-navy-200 p-2 text-muted hover:bg-red-50 hover:text-red-600"
              aria-label="Delete contact"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <p className="text-muted">
            <Mail className="me-1.5 inline h-4 w-4 text-gold-600" />
            {String(selected.email)}
          </p>
          {Boolean(selected.phone) && (
            <p className="text-muted">
              <Phone className="me-1.5 inline h-4 w-4 text-gold-600" />
              {String(selected.phone)}
            </p>
          )}
        </div>

        {Boolean(selected.next_action) && (
          <p
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              isDue(selected)
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-gold/40 bg-gold-100/40 text-ink"
            }`}
          >
            <BellRing className="me-1.5 inline h-4 w-4" />
            {String(selected.next_action)}
            {selected.next_action_date ? ` — ${formatDate(selected.next_action_date)}` : ""}
          </p>
        )}

        {Boolean(selected.notes) && (
          <p className="mt-4 whitespace-pre-wrap rounded-xl bg-surface px-4 py-3 text-sm text-ink">
            {String(selected.notes)}
          </p>
        )}

        <h3 className="mt-8 inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
          <MessageSquare className="h-4 w-4" /> Activity
        </h3>
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={addActivity}>
          <select name="kind" className={`${inputClasses} w-32 shrink-0`} defaultValue="note">
            {ACTIVITY_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <input
            name="note"
            type="text"
            required
            placeholder="Log a call, meeting, email, or note..."
            className={`${inputClasses} min-w-[200px] flex-1`}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>
        <ul className="mt-4 space-y-3">
          {activities.length === 0 && (
            <li className="text-sm text-muted">No activity logged yet.</li>
          )}
          {activities.map((activity) => (
            <li key={String(activity.id)} className="rounded-xl border border-navy-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-navy-50 px-2.5 py-0.5 font-semibold capitalize text-navy">
                  {String(activity.kind)}
                </span>
                <span>{formatDate(activity.created_at)}</span>
                {Boolean(activity.created_by) && <span>· {String(activity.created_by)}</span>}
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">
                {String(activity.note)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ---------------- Contact list ----------------
  return (
    <div className="mt-6">
      {due.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <BellRing className="me-1.5 inline h-4 w-4" />
          <strong>{due.length}</strong> follow-up{due.length > 1 ? "s" : ""} due:{" "}
          {due.slice(0, 3).map((c, i) => (
            <button
              key={String(c.id)}
              type="button"
              onClick={() => openContact(c)}
              className="font-semibold underline underline-offset-2"
            >
              {fullName(c)}
              {i < Math.min(due.length, 3) - 1 ? ", " : ""}
            </button>
          ))}
          {due.length > 3 ? ` and ${due.length - 3} more` : ""}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, organization, tag..."
          className={`${inputClasses} max-w-xs`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClasses} w-36`}
        >
          <option value="">All statuses</option>
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`${inputClasses} w-36 capitalize`}
        >
          <option value="">All types</option>
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setEditing({ ...emptyContact })}
          className="ms-auto inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <UserPlus className="h-4 w-4" /> New Contact
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[850px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Organization</th>
              <th className="px-4 py-3 text-start">Type</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Next Action</th>
              <th className="px-4 py-3 text-start">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  <Users className="mx-auto mb-2 h-6 w-6" />
                  No contacts yet. Add one manually, or use “Add to CRM” on any application or
                  message.
                </td>
              </tr>
            )}
            {filtered.map((contact) => (
              <tr
                key={String(contact.id)}
                onClick={() => openContact(contact)}
                className="cursor-pointer border-b border-navy-50 transition-colors hover:bg-surface"
              >
                <td className="px-4 py-3">
                  <span className="font-semibold text-navy">{fullName(contact)}</span>
                  <span className="block text-xs text-muted">{String(contact.email)}</span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {String(contact.organization ?? "")}
                  {contact.role_title ? (
                    <span className="block text-xs">{String(contact.role_title)}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 capitalize text-muted">{String(contact.type)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusColors[String(contact.status)] ?? "bg-surface text-navy"
                    }`}
                  >
                    {String(contact.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {contact.next_action ? (
                    <span className={isDue(contact) ? "font-semibold text-red-600" : ""}>
                      {String(contact.next_action)}
                      {contact.next_action_date
                        ? ` (${formatDate(contact.next_action_date)})`
                        : ""}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(contact.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
