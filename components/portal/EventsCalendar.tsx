"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Users,
  Video,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export type CalendarEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  is_virtual: boolean;
  starts_at: string | null;
  register_url: string | null;
  // Present in the back-office view; member queries only return published events.
  published?: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatEventDate(value: string | null) {
  if (!value) return "Date to be announced";
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventsCalendar({
  onNotice,
  events: externalEvents,
}: {
  onNotice: (msg: string) => void;
  // When provided (back office), the calendar renders these events — including
  // unpublished ones awaiting approval — instead of fetching its own.
  events?: CalendarEvent[];
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [fetched, setFetched] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(!externalEvents);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const events = externalEvents ?? fetched;

  // RSVP state (portal mode only): the signed-in email, my RSVPs by event id,
  // and the going-count for the event open in the dialog.
  const [myEmail, setMyEmail] = useState("");
  const [myRsvps, setMyRsvps] = useState<Record<string, string>>({});
  const [goingCount, setGoingCount] = useState<number | null>(null);
  const [rsvpBusy, setRsvpBusy] = useState(false);

  useEffect(() => {
    if (externalEvents || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setMyEmail(data.session?.user.email ?? "");
    });
  }, [externalEvents]);

  const loadMyRsvps = useCallback(async () => {
    if (!supabase || externalEvents || !myEmail) return;
    const { data } = await supabase
      .from("event_rsvps")
      .select("event_id, status")
      .eq("email", myEmail);
    const map: Record<string, string> = {};
    for (const row of (data as { event_id: string; status: string }[]) ?? []) {
      map[row.event_id] = row.status;
    }
    setMyRsvps(map);
  }, [externalEvents, myEmail]);

  useEffect(() => {
    loadMyRsvps();
  }, [loadMyRsvps]);

  // Count of confirmed attendees for the selected event (names stay private).
  useEffect(() => {
    if (!supabase || externalEvents || !selected) {
      setGoingCount(null);
      return;
    }
    supabase.rpc("event_rsvp_count", { p_event_id: selected.id }).then(({ data }) => {
      setGoingCount(typeof data === "number" ? data : null);
    });
  }, [selected, externalEvents]);

  async function toggleRsvp(event: CalendarEvent) {
    if (!supabase || !myEmail) return;
    const going = myRsvps[event.id] === "going";
    setRsvpBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const meta = userData.user?.user_metadata ?? {};
    const { error } = await supabase.from("event_rsvps").upsert(
      {
        event_id: event.id,
        email: myEmail,
        name: String(meta.full_name ?? "") || null,
        role: String(meta.role ?? "") || null,
        status: going ? "cancelled" : "going",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id,email" }
    );
    setRsvpBusy(false);
    if (error) {
      onNotice(`Could not update your RSVP: ${error.message}`);
      return;
    }
    setMyRsvps((current) => ({ ...current, [event.id]: going ? "cancelled" : "going" }));
    setGoingCount((current) => (current === null ? current : current + (going ? -1 : 1)));
    onNotice(going ? "Your RSVP was cancelled." : `You are attending: ${event.title}.`);
  }

  const load = useCallback(async () => {
    if (!supabase || externalEvents) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id, slug, title, description, category, location, is_virtual, starts_at, register_url")
      .eq("published", true)
      .order("starts_at", { ascending: true });
    setLoading(false);
    if (error) {
      onNotice(`Could not load events: ${error.message}`);
      return;
    }
    setFetched((data as CalendarEvent[]) ?? []);
  }, [onNotice, externalEvents]);

  useEffect(() => {
    load();
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      if (!event.starts_at) continue;
      const key = dayKey(new Date(event.starts_at));
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  // Calendar grid: pad the first week, then all days of the cursor month.
  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<{ date: Date | null }> = [];
    for (let i = 0; i < firstWeekday; i += 1) list.push({ date: null });
    for (let d = 1; d <= daysInMonth; d += 1) list.push({ date: new Date(year, month, d) });
    return list;
  }, [cursor]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => e.starts_at && new Date(e.starts_at).getTime() >= now - 86_400_000)
      .slice(0, 8);
  }, [events]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Month grid */}
      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card xl:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-navy">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-lg p-2 text-muted hover:bg-surface hover:text-navy"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-navy hover:bg-surface"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-lg p-2 text-muted hover:bg-surface hover:text-navy"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell.date) return <div key={`pad-${index}`} className="min-h-16" />;
            const key = dayKey(cell.date);
            const dayEvents = byDay.get(key) ?? [];
            const isToday = dayKey(today) === key;
            return (
              <div
                key={key}
                className={`min-h-16 rounded-lg border p-1.5 text-start ${
                  isToday ? "border-gold bg-gold-100/40" : "border-navy-50 bg-white"
                }`}
              >
                <span
                  className={`text-xs font-semibold ${isToday ? "text-gold-600" : "text-muted"}`}
                >
                  {cell.date.getDate()}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelected(event)}
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-start text-[10px] font-semibold ${
                        event.published === false
                          ? "bg-gold-100 text-gold-600 hover:bg-gold-100/70"
                          : "bg-navy text-white hover:bg-navy-600"
                      }`}
                      title={`${event.title} — ${formatEventDate(event.starts_at)}${
                        event.published === false ? " (pending approval)" : ""
                      }`}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="block px-1 text-[10px] text-muted">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list */}
      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <h2 className="inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
          <CalendarDays className="h-4 w-4" /> Upcoming Events
        </h2>
        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-muted">Loading events...</p>}
          {!loading && upcoming.length === 0 && (
            <p className="rounded-xl border border-dashed border-navy-200 p-5 text-center text-sm text-muted">
              No upcoming events yet. New chamber events will appear here.
            </p>
          )}
          {upcoming.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelected(event)}
              className="block w-full rounded-xl border border-navy-100 p-3.5 text-start transition-colors hover:border-navy hover:bg-surface"
            >
              <p className="font-heading text-sm font-bold text-navy">
                {event.title}
                {event.published === false && (
                  <span className="ms-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                    Pending approval
                  </span>
                )}
                {!externalEvents && myRsvps[event.id] === "going" && (
                  <span className="ms-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    Attending
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted">{formatEventDate(event.starts_at)}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                {event.is_virtual ? (
                  <>
                    <Video className="h-3 w-3" /> Virtual
                  </>
                ) : event.location ? (
                  <>
                    <MapPin className="h-3 w-3" /> {event.location}
                  </>
                ) : null}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Event detail dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Event details"
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute end-4 top-4 rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="flex flex-wrap items-center gap-2">
              {selected.category && (
                <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy">
                  {selected.category}
                </span>
              )}
              {selected.published === false && (
                <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                  Pending approval — not yet visible to members
                </span>
              )}
            </span>
            <h2 className="mt-3 pe-8 font-heading text-xl font-bold text-navy">{selected.title}</h2>
            <p className="mt-2 text-sm font-semibold text-gold-600">
              {formatEventDate(selected.starts_at)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
              {selected.is_virtual ? (
                <>
                  <Video className="h-4 w-4" /> Virtual event
                </>
              ) : selected.location ? (
                <>
                  <MapPin className="h-4 w-4" /> {selected.location}
                </>
              ) : null}
            </p>
            {selected.description && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {selected.description}
              </p>
            )}
            {!externalEvents && goingCount !== null && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                <Users className="h-4 w-4 text-green-600" />
                {goingCount} attending
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!externalEvents && myEmail && (
                <button
                  type="button"
                  disabled={rsvpBusy}
                  onClick={() => toggleRsvp(selected)}
                  className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all disabled:opacity-60 ${
                    myRsvps[selected.id] === "going"
                      ? "border border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {myRsvps[selected.id] === "going" ? "Attending — Cancel RSVP" : "RSVP — I'm Attending"}
                </button>
              )}
              {selected.register_url && (
                <a
                  href={selected.register_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface"
                >
                  Register <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
