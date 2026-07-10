"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, CalendarDays, CircleDollarSign, FileText, Heart, Inbox, ListTodo, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

// Categorical palette — validated (lightness, chroma, CVD separation, contrast)
// with the dataviz six-checks validator; assign in this fixed order, never cycled.
const CHART_COLORS = ["#0E8A4C", "#A8861D", "#1E6BC7", "#D71920", "#7C4DBC"];

type Slice = { label: string; value: number };

function Donut({ slices, centerLabel }: { slices: Slice[]; centerLabel: string }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const R = 45;
  const C = 2 * Math.PI * R;
  const GAP = 2;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" role="img" aria-label={centerLabel}>
        {total === 0 ? (
          <circle cx="60" cy="60" r={R} fill="none" stroke="#E5E7EB" strokeWidth="16" />
        ) : (
          slices
            .filter((s) => s.value > 0)
            .map((slice, i, visible) => {
              const frac = slice.value / total;
              const len = Math.max(frac * C - (visible.length > 1 ? GAP : 0), 0.5);
              const dash = `${len} ${C - len}`;
              const el = (
                <circle
                  key={slice.label}
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke={CHART_COLORS[slices.indexOf(slice) % CHART_COLORS.length]}
                  strokeWidth="16"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 60 60)"
                >
                  <title>{`${slice.label}: ${slice.value} (${Math.round(frac * 100)}%)`}</title>
                </circle>
              );
              offset += frac * C;
              return el;
            })
        )}
        <text
          x="60"
          y="58"
          textAnchor="middle"
          className="fill-navy font-heading text-[26px] font-extrabold"
        >
          {total}
        </text>
        <text x="60" y="74" textAnchor="middle" className="fill-[#6B7280] text-[9px] font-semibold uppercase tracking-wider">
          {centerLabel}
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {slices.map((slice, i) => (
          <li key={slice.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="truncate font-medium text-ink">{slice.label}</span>
            <span className="ms-auto font-semibold tabular-nums text-navy">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({
  title,
  onView,
  children,
}: {
  title: string;
  onView?: () => void;
  children: React.ReactNode;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold text-navy">{title}</h2>
          <p className="text-xs text-muted">{today}</p>
        </div>
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="shrink-0 text-xs font-semibold text-green-600 hover:underline"
          >
            View details →
          </button>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Counts = Record<string, number>;

function tally(rows: Record<string, unknown>[], field: string): Counts {
  const counts: Counts = {};
  for (const row of rows) {
    const key = String(row[field] ?? "unknown");
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DashboardOverview({
  onNotice,
  goTo,
}: {
  onNotice: (msg: string) => void;
  goTo: (tab: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Record<string, unknown>[]>([]);
  const [board, setBoard] = useState<Counts>({});
  const [directory, setDirectory] = useState<Counts>({});
  const [contacts, setContacts] = useState<Counts>({});
  const [crm, setCrm] = useState<Counts>({});
  const [crmDue, setCrmDue] = useState(0);
  const [content, setContent] = useState<Counts>({});
  const [engagement, setEngagement] = useState({ likes: 0, views: 0 });
  const [subscribers, setSubscribers] = useState(0);
  const [openTasks, setOpenTasks] = useState<Record<string, unknown>[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Record<string, unknown>[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [finance, setFinance] = useState({ collected: 0, outstanding: 0, overdue: 0 });

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setIsAdmin(isAdminUser(data.session?.user));
    });
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [m, b, d, c, k, p, s, t, ev] = await Promise.all([
      supabase
        .from("membership_applications")
        .select("first_name, last_name, tier, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("board_applications").select("status"),
      supabase.from("directory_submissions").select("status"),
      supabase.from("contact_messages").select("status"),
      supabase.from("crm_contacts").select("status, next_action_date"),
      supabase.from("posts").select("published, approval_status, likes, views"),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      // Tasks and events may not exist until schema-v9 runs; their errors are
      // tolerated silently so the rest of the dashboard still loads.
      supabase
        .from("staff_tasks")
        .select("title, assigned_to, due_date, priority")
        .eq("status", "open")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
      supabase
        .from("events")
        .select("title, starts_at, location, is_virtual, published")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(3),
    ]);
    setLoading(false);

    const firstError = [m, b, d, c, k, p].find((r) => r.error)?.error;
    if (firstError) onNotice(`Some dashboard data could not load: ${firstError.message}`);

    setMemberships((m.data as Record<string, unknown>[]) ?? []);
    setBoard(tally((b.data as Record<string, unknown>[]) ?? [], "status"));
    setDirectory(tally((d.data as Record<string, unknown>[]) ?? [], "status"));
    setContacts(tally((c.data as Record<string, unknown>[]) ?? [], "status"));
    const crmRows = (k.data as Record<string, unknown>[]) ?? [];
    setCrm(tally(crmRows, "status"));
    setCrmDue(
      crmRows.filter((r) => typeof r.next_action_date === "string" && r.next_action_date <= today)
        .length
    );
    const postRows = (p.data as Record<string, unknown>[]) ?? [];
    setContent({
      Published: postRows.filter((r) => r.published).length,
      Pending: postRows.filter((r) => r.approval_status === "pending").length,
      Draft: postRows.filter((r) => !r.published && r.approval_status !== "pending").length,
    });
    setEngagement({
      likes: postRows.reduce((sum, r) => sum + Number(r.likes ?? 0), 0),
      views: postRows.reduce((sum, r) => sum + Number(r.views ?? 0), 0),
    });
    setSubscribers(s.count ?? 0);
    setOpenTasks((t.data as Record<string, unknown>[]) ?? []);
    setUpcomingEvents((ev.data as Record<string, unknown>[]) ?? []);

    // Finance is admin-only; the query returns nothing (or errors before
    // schema-v10) for everyone else, and the panel simply stays hidden.
    const inv = await supabase
      .from("invoices")
      .select("amount_cents, status, due_date");
    const invoiceRows = (inv.data as Record<string, unknown>[]) ?? [];
    const today2 = new Date().toISOString().slice(0, 10);
    setFinance({
      collected: invoiceRows
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + Number(r.amount_cents ?? 0), 0),
      outstanding: invoiceRows
        .filter((r) => r.status === "sent")
        .reduce((sum, r) => sum + Number(r.amount_cents ?? 0), 0),
      overdue: invoiceRows.filter(
        (r) =>
          r.status === "sent" && typeof r.due_date === "string" && r.due_date !== "" && r.due_date < today2
      ).length,
    });
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  const membershipCounts = tally(memberships, "status");
  const newApplications = memberships.filter((m) => m.status === "new");
  const recentApplications = memberships.slice(0, 5);

  const statTiles = [
    {
      label: "New Applications",
      value: membershipCounts.new ?? 0,
      icon: Inbox,
      tab: "memberships",
    },
    { label: "Pending Approvals", value: content.Pending ?? 0, icon: FileText, tab: "approvals" },
    { label: "Follow-ups Due", value: crmDue, icon: BellRing, tab: "crm" },
    { label: "Open Tasks", value: openTasks.length, icon: ListTodo, tab: "tasks" },
    { label: "Subscribers", value: subscribers, icon: Users, tab: "subscribers" },
  ];

  return (
    <div className="mt-6">
      <h2 className="font-heading text-xl font-bold text-navy">Chamber Dashboard</h2>
      <p className="text-sm text-muted">
        Algerian American Chamber of Commerce USA — live overview
        {loading ? " (loading...)" : ""}
      </p>

      {/* Headline stat tiles */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {statTiles.map((tile) => (
          <button
            key={tile.label}
            type="button"
            onClick={() => goTo(tile.tab)}
            className={`rounded-2xl border bg-white p-5 text-start shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
              tile.value > 0 && (tile.label === "Pending Approvals" || tile.label === "Follow-ups Due")
                ? "border-red-200"
                : "border-navy-100"
            }`}
          >
            <tile.icon className="h-5 w-5 text-gold-600" aria-hidden="true" />
            <p className="mt-3 font-heading text-3xl font-extrabold text-navy">{tile.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
              {tile.label}
            </p>
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {isAdmin && (
          <Panel title="Finance" onView={() => goTo("billing")}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <CircleDollarSign className="mx-auto h-4 w-4 text-green-600" aria-hidden="true" />
                <p className="mt-1.5 font-heading text-lg font-extrabold text-green-600">
                  ${(finance.collected / 100).toLocaleString("en-US")}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Collected
                </p>
              </div>
              <div>
                <CircleDollarSign className="mx-auto h-4 w-4 text-navy" aria-hidden="true" />
                <p className="mt-1.5 font-heading text-lg font-extrabold text-navy">
                  ${(finance.outstanding / 100).toLocaleString("en-US")}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Outstanding
                </p>
              </div>
              <div>
                <BellRing
                  className={`mx-auto h-4 w-4 ${finance.overdue > 0 ? "text-red-600" : "text-muted"}`}
                  aria-hidden="true"
                />
                <p
                  className={`mt-1.5 font-heading text-lg font-extrabold ${
                    finance.overdue > 0 ? "text-red-600" : "text-navy"
                  }`}
                >
                  {finance.overdue}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Overdue
                </p>
              </div>
            </div>
          </Panel>
        )}

        <Panel title="Common Tasks" onView={() => goTo("tasks")}>
          {openTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No open tasks. Add one from the Common Tasks section.
            </p>
          ) : (
            <ul className="divide-y divide-navy-50">
              {openTasks.map((task, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {String(task.title)}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {String(task.assigned_to ?? "Unassigned")}
                    </span>
                  </span>
                  {typeof task.due_date === "string" && task.due_date && (
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        task.due_date <= new Date().toISOString().slice(0, 10)
                          ? "text-red-600"
                          : "text-muted"
                      }`}
                    >
                      {new Date(`${task.due_date}T00:00:00`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming Events" onView={() => goTo("events")}>
          {upcomingEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No upcoming events scheduled.
            </p>
          ) : (
            <ul className="divide-y divide-navy-50">
              {upcomingEvents.map((event, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 text-sm">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {String(event.title)}
                      {!event.published && (
                        <span className="ms-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                          Draft
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {event.starts_at
                        ? new Date(String(event.starts_at)).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBD"}
                      {event.is_virtual ? " · Virtual" : event.location ? ` · ${event.location}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Applications for Membership" onView={() => goTo("memberships")}>
          {newApplications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No new applications for membership have been received.
            </p>
          ) : (
            <ul className="divide-y divide-navy-50">
              {recentApplications.map((app, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="truncate font-medium text-ink">
                    {String(app.first_name)} {String(app.last_name)}
                    <span className="ms-2 text-xs capitalize text-muted">{String(app.tier)}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      app.status === "new"
                        ? "bg-gold-100 text-gold-600"
                        : app.status === "approved"
                          ? "bg-green-50 text-green-700"
                          : "bg-surface text-muted"
                    }`}
                  >
                    {String(app.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Membership" onView={() => goTo("memberships")}>
          <Donut
            centerLabel="Applications"
            slices={["new", "contacted", "approved", "declined"].map((s) => ({
              label: cap(s),
              value: membershipCounts[s] ?? 0,
            }))}
          />
        </Panel>

        <Panel title="Board Applications" onView={() => goTo("board")}>
          <Donut
            centerLabel="Candidates"
            slices={["new", "reviewing", "interviewed", "accepted", "declined"].map((s) => ({
              label: cap(s),
              value: board[s] ?? 0,
            }))}
          />
        </Panel>

        <Panel title="Directory Requests" onView={() => goTo("directory")}>
          <Donut
            centerLabel="Businesses"
            slices={["pending", "approved", "rejected"].map((s) => ({
              label: cap(s),
              value: directory[s] ?? 0,
            }))}
          />
        </Panel>

        <Panel title="Contact Messages" onView={() => goTo("contacts")}>
          <Donut
            centerLabel="Messages"
            slices={["new", "replied", "closed"].map((s) => ({
              label: cap(s),
              value: contacts[s] ?? 0,
            }))}
          />
        </Panel>

        <Panel title="CRM Pipeline" onView={() => goTo("crm")}>
          <Donut
            centerLabel="Contacts"
            slices={["lead", "contacted", "engaged", "active", "inactive"].map((s) => ({
              label: cap(s),
              value: crm[s] ?? 0,
            }))}
          />
        </Panel>

        <Panel title="Content & Engagement" onView={() => goTo("content")}>
          <div className="flex items-center gap-5">
            <Donut
              centerLabel="Posts"
              slices={Object.entries(content).map(([label, value]) => ({ label, value }))}
            />
          </div>
          <div className="mt-4 flex items-center gap-6 border-t border-navy-50 pt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Heart className="h-4 w-4 text-red-500" aria-hidden="true" />
              <strong className="text-navy">{engagement.likes}</strong> likes
            </span>
            <span className="text-muted">
              <strong className="text-navy">{engagement.views}</strong> views
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
