"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, RefreshCw, Trash2, UserPlus, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;

const TABS = [
  { key: "memberships", label: "Memberships", table: "membership_applications" },
  { key: "board", label: "Board Applications", table: "board_applications" },
  { key: "directory", label: "Directory Requests", table: "directory_submissions" },
  { key: "subscribers", label: "Subscribers", table: "newsletter_subscribers" },
  { key: "users", label: "Users", table: "" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_OPTIONS: Record<string, string[]> = {
  membership_applications: ["new", "contacted", "approved", "declined"],
  board_applications: ["new", "reviewing", "interviewed", "accepted", "declined"],
  directory_submissions: ["pending", "approved", "rejected"],
};

const statusColors: Record<string, string> = {
  new: "bg-navy-50 text-navy",
  pending: "bg-gold-100 text-gold-600",
  contacted: "bg-gold-100 text-gold-600",
  reviewing: "bg-gold-100 text-gold-600",
  interviewed: "bg-navy-50 text-navy",
  approved: "bg-green-50 text-green-700",
  accepted: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
};

function formatDate(value: unknown) {
  if (typeof value !== "string") return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<TabKey>("memberships");
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Session guard
  useEffect(() => {
    if (!supabase) {
      router.replace("/admin/login");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        setEmail(data.session.user.email ?? "");
        setReady(true);
      }
    });
  }, [router]);

  const currentTable = TABS.find((t) => t.key === tab)?.table ?? "";

  const loadRows = useCallback(async () => {
    if (!supabase || !currentTable) return;
    setLoading(true);
    setNotice("");
    const { data, error } = await supabase
      .from(currentTable)
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setNotice(`Could not load data: ${error.message}`);
      setRows([]);
    } else {
      setRows((data as Row[]) ?? []);
    }
  }, [currentTable]);

  const loadUsers = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setNotice("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setNotice(body.error ?? `Could not load users (HTTP ${res.status}).`);
      setUsers([]);
      return;
    }
    const body = await res.json();
    setUsers(body.users ?? []);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (tab === "users") {
      loadUsers();
    } else {
      loadRows();
    }
  }, [ready, tab, loadRows, loadUsers]);

  async function updateStatus(id: unknown, status: string) {
    if (!supabase || !currentTable) return;
    const { error } = await supabase.from(currentTable).update({ status }).eq("id", id);
    if (error) {
      setNotice(`Update failed: ${error.message}`);
    } else {
      setRows((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  }

  async function deleteRow(id: unknown) {
    if (!supabase || !currentTable) return;
    if (!window.confirm("Delete this record permanently?")) return;
    const { error } = await supabase.from(currentTable).delete().eq("id", id);
    if (error) {
      setNotice(`Delete failed: ${error.message}`);
    } else {
      setRows((current) => current.filter((r) => r.id !== id));
    }
  }

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(body.error ?? "Could not create user.");
      return;
    }
    form.reset();
    setNotice("User created. They can sign in immediately.");
    loadUsers();
  }

  async function deleteUser(id: unknown) {
    if (!supabase) return;
    if (!window.confirm("Remove this user's access?")) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setNotice(body.error ?? "Could not delete user.");
      return;
    }
    loadUsers();
  }

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-100 pb-6">
        <div className="flex items-center gap-4">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={110} height={64} />
          <div>
            <h1 className="font-heading text-xl font-bold text-navy">Back Office</h1>
            <p className="text-xs text-muted">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-white"
          >
            <ExternalLink className="h-4 w-4" /> View Site
          </a>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-navy text-white"
                : "border border-navy-200 bg-white text-navy hover:bg-navy-50"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => (tab === "users" ? loadUsers() : loadRows())}
          className="ms-auto inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-navy-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </nav>

      {notice && (
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold-100/50 px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      )}

      {tab !== "users" ? (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
          <table className="w-full min-w-[900px] text-start text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 text-start">Date</th>
                <th className="px-4 py-3 text-start">
                  {tab === "directory" ? "Business" : "Name"}
                </th>
                <th className="px-4 py-3 text-start">Email</th>
                <th className="px-4 py-3 text-start">Details</th>
                {STATUS_OPTIONS[currentTable] && <th className="px-4 py-3 text-start">Status</th>}
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No records yet.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b border-navy-50 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {tab === "directory"
                      ? String(row.business_name ?? "")
                      : `${row.first_name ?? ""} ${row.last_name ?? ""}`}
                    {tab === "directory" && (
                      <span className="block text-xs font-normal text-muted">
                        {String(row.contact_name ?? "")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${row.email}`} className="text-green-600 hover:underline">
                      {String(row.email ?? "")}
                    </a>
                    {row.phone ? (
                      <span className="block text-xs text-muted">{String(row.phone)}</span>
                    ) : null}
                  </td>
                  <td className="max-w-md px-4 py-3 text-muted">
                    {tab === "memberships" && (
                      <>
                        <span className="font-medium text-ink">{String(row.tier ?? "")}</span>
                        {row.business_name ? ` · ${row.business_name}` : ""}
                        {row.job_title ? ` · ${row.job_title}` : ""}
                        {row.city_state ? ` · ${row.city_state}` : ""}
                        {row.message ? (
                          <span className="mt-1 block text-xs">{String(row.message)}</span>
                        ) : null}
                      </>
                    )}
                    {tab === "board" && (
                      <>
                        <span className="font-medium text-ink">
                          {((row.areas as string[]) ?? []).join(", ")}
                        </span>
                        {row.city_state ? ` · ${row.city_state}` : ""}
                        {row.linkedin ? (
                          <a
                            href={String(row.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-1 text-green-600 hover:underline"
                          >
                            LinkedIn
                          </a>
                        ) : null}
                        {row.background ? (
                          <span className="mt-1 block text-xs">{String(row.background)}</span>
                        ) : null}
                      </>
                    )}
                    {tab === "directory" && (
                      <>
                        <span className="font-medium text-ink">{String(row.category ?? "")}</span>
                        {row.city ? ` · ${row.city}, ${row.state ?? ""}` : ""}
                        {row.website ? ` · ${row.website}` : ""}
                        <span className="mt-1 block text-xs">{String(row.description ?? "")}</span>
                      </>
                    )}
                    {tab === "subscribers" && <span>{String(row.locale ?? "")}</span>}
                  </td>
                  {STATUS_OPTIONS[currentTable] && (
                    <td className="px-4 py-3">
                      <select
                        value={String(row.status ?? "")}
                        onChange={(e) => updateStatus(row.id, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${
                          statusColors[String(row.status)] ?? "bg-surface text-navy"
                        }`}
                      >
                        {STATUS_OPTIONS[currentTable].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <h2 className="inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
              <UserPlus className="h-4 w-4" /> Add Staff User
            </h2>
            <form className="mt-4 space-y-3" onSubmit={createUser}>
              <input
                name="email"
                type="email"
                required
                placeholder="email@aacc-usa.org"
                className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm"
              />
              <input
                name="password"
                type="text"
                required
                minLength={8}
                placeholder="Initial password (min 8 chars)"
                className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
              >
                Create User
              </button>
              <p className="text-xs text-muted">
                Share the initial password securely; the user can change it later.
              </p>
            </form>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card lg:col-span-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 text-start">Email</th>
                  <th className="px-4 py-3 text-start">Created</th>
                  <th className="px-4 py-3 text-start">Last Sign-in</th>
                  <th className="px-4 py-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted">
                      No users loaded.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={String(user.id)} className="border-b border-navy-50">
                    <td className="px-4 py-3 font-semibold text-navy">{String(user.email)}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-muted">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      {user.email !== email && (
                        <button
                          type="button"
                          onClick={() => deleteUser(user.id)}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove user"
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
      )}
    </main>
  );
}
