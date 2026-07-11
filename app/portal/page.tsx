"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  CalendarDays,
  ContactRound,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  MailOpen,
  Menu,
  Newspaper,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import EventsCalendar from "@/components/portal/EventsCalendar";
import DirectoryBrowser from "@/components/portal/DirectoryBrowser";
import NewsFeed from "@/components/portal/NewsFeed";
import NewslettersList from "@/components/portal/NewslettersList";
import CrmManager from "@/components/admin/CrmManager";
import { ROLE_LABELS, appRoleOf, isStaffRole, type AppRole } from "@/lib/admin";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "events", label: "Events Calendar", icon: CalendarDays },
  { key: "directory", label: "Business Directory", icon: Building2 },
  { key: "news", label: "News & Articles", icon: Newspaper },
  { key: "newsletters", label: "Newsletters", icon: MailOpen },
  { key: "resources", label: "Resources", icon: Library },
  { key: "crm", label: "CRM", icon: ContactRound },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const RESOURCES = [
  {
    title: "Embassy of Algeria — Washington, DC",
    description: "Consular services, visas, and official announcements.",
    url: "https://embwashington.mfa.gov.dz/en",
  },
  {
    title: "Consulate General of Algeria — New York",
    description: "Consular services for the New York jurisdiction.",
    url: "https://www.algeria-cgny.org/",
  },
  {
    title: "Ministry of Foreign Affairs of Algeria",
    description: "Official foreign affairs portal of Algeria.",
    url: "https://www.mfa.gov.dz/",
  },
  {
    title: "U.S. Commercial Service — Algeria",
    description: "U.S. government market intelligence and trade counseling for Algeria.",
    url: "https://www.trade.gov/algeria",
  },
  {
    title: "AACC-USA Business Directory Request",
    description: "Add your business to the public chamber directory.",
    url: "/en/directory",
  },
  {
    title: "Contact the Chamber",
    description: "Questions, introductions, and support: contact@aacc-usa.org.",
    url: "/en/contact",
  },
];

export default function MemberPortal() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("individual");
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwError, setPwError] = useState("");
  const [counts, setCounts] = useState({ events: 0, businesses: 0, posts: 0 });

  const hasCrm = role === "ambassador" || isStaffRole(role);

  // Session guard: any signed-in account may view the portal; visitors sign in first.
  useEffect(() => {
    if (!supabase) {
      router.replace("/portal/login");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/portal/login");
      } else {
        setEmail(data.session.user.email ?? "");
        setRole(appRoleOf(data.session.user));
        setReady(true);
      }
    });
  }, [router]);

  const loadCounts = useCallback(async () => {
    if (!supabase) return;
    const [events, businesses, posts] = await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .gte("starts_at", new Date().toISOString()),
      supabase
        .from("directory_submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("published", true),
    ]);
    setCounts({
      events: events.count ?? 0,
      businesses: businesses.count ?? 0,
      posts: posts.count ?? 0,
    });
  }, []);

  useEffect(() => {
    if (ready) loadCounts();
  }, [ready, loadCounts]);

  useEffect(() => {
    setNotice("");
  }, [tab]);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const data = new FormData(e.currentTarget);
    const password = String(data.get("newPassword") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");
    if (password.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setPwError("Passwords do not match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPwError(error.message);
      return;
    }
    setPwOpen(false);
    setPwError("");
    setNotice("Password updated.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/portal/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading...
      </main>
    );
  }

  const visibleTabs = TABS.filter((t) => (t.key === "crm" ? hasCrm : true));
  const currentLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  const statTiles = [
    { key: "events" as TabKey, label: "Upcoming Events", value: counts.events, icon: CalendarDays },
    { key: "directory" as TabKey, label: "Businesses in the Directory", value: counts.businesses, icon: Building2 },
    { key: "news" as TabKey, label: "Published Articles", value: counts.posts, icon: Newspaper },
  ];

  const sidebarNav = (
    <>
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="rounded-xl bg-white px-2.5 py-1.5">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={72} height={42} />
        </span>
        <div className="leading-tight">
          <p className="font-heading text-sm font-bold text-white">Member Portal</p>
          <p className="text-[10px] uppercase tracking-wider text-navy-300">AACC-USA</p>
        </div>
      </div>
      <div className="mx-3 mb-4 rounded-xl bg-white/5 px-4 py-3">
        <p className="truncate text-xs text-navy-200">{email}</p>
        <span className="mt-1.5 inline-block rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-navy">
          {ROLE_LABELS[role]}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Member portal sections">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-white/10 text-white shadow-[inset_2px_0_0_0_#C9A227]"
                : "text-navy-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            <t.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{t.label}</span>
          </button>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/en"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-navy-200 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View Site
        </a>
        <button
          type="button"
          onClick={() => {
            setPwError("");
            setPwOpen(true);
            setSidebarOpen(false);
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm font-semibold text-navy-200 hover:bg-white/5 hover:text-white"
        >
          <KeyRound className="h-4 w-4" /> Password
        </button>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm font-semibold text-navy-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-900 lg:flex">
        {sidebarNav}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 start-0 flex w-72 flex-col bg-navy-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute end-3 top-3 rounded-full p-2 text-navy-200 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarNav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-navy-200 p-2 text-navy"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Image src="/aacc-logo.png" alt="AACC-USA" width={56} height={32} />
          <span className="font-heading text-sm font-bold text-navy">Member Portal</span>
        </div>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-heading text-2xl font-bold text-navy">{currentLabel}</h1>

          {notice && (
            <p className="mt-4 rounded-lg border border-gold/40 bg-gold-100/50 px-4 py-3 text-sm text-ink">
              {notice}
            </p>
          )}

          {tab === "dashboard" && (
            <>
              <div className="mt-6 rounded-2xl bg-navy-900 p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  {ROLE_LABELS[role]}
                </p>
                <h2 className="mt-2 font-heading text-xl font-bold sm:text-2xl">
                  Welcome to your AACC-USA member portal
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-100">
                  {role === "ambassador"
                    ? "As a State Ambassador you represent the chamber in your state — track events, connect businesses, and manage your local outreach from the CRM."
                    : "Your gateway to the chamber's events, the Algerian-American business network, and member-only updates."}
                </p>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {statTiles.map((tile) => (
                  <button
                    key={tile.key}
                    type="button"
                    onClick={() => setTab(tile.key)}
                    className="rounded-2xl border border-navy-100 bg-white p-6 text-start shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy">
                      <tile.icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 font-heading text-3xl font-extrabold text-navy">
                      {tile.value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-muted">{tile.label}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
                  <h3 className="font-heading text-base font-bold text-navy">Member Benefits</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                    <li>• Full calendar of chamber events, briefings, and roundtables</li>
                    <li>• The complete Algerian-American business directory</li>
                    <li>• Every newsletter edition and chamber article</li>
                    <li>• Curated official resources for both markets</li>
                    {hasCrm && <li>• Chamber CRM for your state outreach (Ambassadors)</li>}
                  </ul>
                </div>
                <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
                  <h3 className="font-heading text-base font-bold text-navy">Need Help?</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    The chamber team is one email away for introductions, event questions, or
                    anything about your membership.
                  </p>
                  <a
                    href="mailto:contact@aacc-usa.org"
                    className="mt-4 inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
                  >
                    Email contact@aacc-usa.org
                  </a>
                </div>
              </div>
            </>
          )}

          {tab === "events" && <EventsCalendar onNotice={setNotice} />}
          {tab === "directory" && <DirectoryBrowser onNotice={setNotice} />}
          {tab === "news" && <NewsFeed onNotice={setNotice} />}
          {tab === "newsletters" && <NewslettersList onNotice={setNotice} />}

          {tab === "resources" && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {RESOURCES.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                    <Library className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-bold text-navy">
                    {resource.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {resource.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                    Open <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </a>
              ))}
            </div>
          )}

          {tab === "crm" && hasCrm && <CrmManager onNotice={setNotice} />}

          {/* Change password dialog */}
          {pwOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Change password"
            >
              <div
                className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
                onClick={() => setPwOpen(false)}
                aria-hidden="true"
              />
              <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setPwOpen(false)}
                  className="absolute end-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-navy"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="font-heading text-lg font-bold text-navy">Change My Password</h2>
                <form className="mt-5 space-y-3" onSubmit={changePassword}>
                  <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="New password (min 8 chars)"
                    className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm"
                  />
                  {pwError && (
                    <p className="text-sm font-medium text-red-600" role="alert">
                      {pwError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
