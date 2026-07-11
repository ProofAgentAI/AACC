"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  Eye,
  ExternalLink,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Mail,
  MailCheck,
  MailPlus,
  Menu,
  MessagesSquare,
  Newspaper,
  RefreshCw,
  Star,
  Trash2,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContentManager from "@/components/admin/ContentManager";
import CrmManager from "@/components/admin/CrmManager";
import ApprovalsManager from "@/components/admin/ApprovalsManager";
import DashboardOverview from "@/components/admin/DashboardOverview";
import TasksManager from "@/components/admin/TasksManager";
import EventsManager from "@/components/admin/EventsManager";
import BillingManager from "@/components/admin/BillingManager";
import NewsletterComposer from "@/components/admin/NewsletterComposer";
import {
  ADMIN_EMAIL,
  ROLE_LABELS,
  appRoleOf,
  isMemberRole,
  roleOf,
  type AppRole,
  type StaffRole,
} from "@/lib/admin";

type Row = Record<string, unknown>;

const TABS = [
  { key: "dashboard", label: "Dashboard", table: "", icon: LayoutDashboard },
  { key: "tasks", label: "Common Tasks", table: "", icon: ListTodo },
  { key: "content", label: "Content", table: "", icon: Newspaper },
  { key: "approvals", label: "Approvals", table: "", icon: BadgeCheck },
  { key: "events", label: "Events", table: "", icon: CalendarDays },
  { key: "billing", label: "Billing", table: "", icon: CircleDollarSign },
  { key: "newsletter", label: "Newsletter", table: "", icon: MailPlus },
  { key: "crm", label: "CRM", table: "", icon: ContactRound },
  { key: "memberships", label: "Memberships", table: "membership_applications", icon: Inbox },
  { key: "board", label: "Board Applications", table: "board_applications", icon: ClipboardList },
  { key: "directory", label: "Directory Requests", table: "directory_submissions", icon: Building2 },
  { key: "contacts", label: "Contact Messages", table: "contact_messages", icon: MessagesSquare },
  { key: "subscribers", label: "Subscribers", table: "newsletter_subscribers", icon: MailCheck },
  { key: "users", label: "Users", table: "", icon: UserCog },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_OPTIONS: Record<string, string[]> = {
  membership_applications: ["new", "contacted", "approved", "declined"],
  board_applications: ["new", "reviewing", "interviewed", "accepted", "declined"],
  directory_submissions: ["pending", "approved", "rejected"],
  contact_messages: ["new", "replied", "closed"],
};

const statusColors: Record<string, string> = {
  new: "bg-navy-50 text-navy",
  pending: "bg-gold-100 text-gold-600",
  contacted: "bg-gold-100 text-gold-600",
  reviewing: "bg-gold-100 text-gold-600",
  interviewed: "bg-navy-50 text-navy",
  replied: "bg-green-50 text-green-700",
  approved: "bg-green-50 text-green-700",
  accepted: "bg-green-50 text-green-700",
  closed: "bg-surface text-muted",
  declined: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
};

const EMAIL_SUBJECTS: Record<TabKey, string> = {
  dashboard: "",
  tasks: "",
  content: "",
  approvals: "",
  events: "",
  billing: "",
  newsletter: "",
  crm: "",
  memberships: "Your AACC-USA membership application",
  board: "Your AACC-USA founding board application",
  directory: "Your AACC-USA business directory request",
  contacts: "Re: your message to AACC-USA",
  subscribers: "AACC-USA newsletter",
  users: "",
};

// Membership tier on the application -> portal role granted on approval.
const TIER_TO_ROLE: Record<string, AppRole> = {
  individual: "individual",
  business: "business",
  "state-ambassador": "ambassador",
  corporate: "business",
  "founding-sponsor": "business",
};

const FIELD_LABELS: Record<string, string> = {
  created_at: "Submitted",
  first_name: "First Name",
  last_name: "Last Name",
  name: "Name",
  email: "Email",
  last_sign_in_at: "Last Sign-in",
  phone: "Phone",
  job_title: "Function / Title",
  business_name: "Business",
  organization: "Organization",
  city_state: "City / State",
  city: "City",
  state: "State",
  tier: "Membership Tier",
  inquiry_type: "Inquiry Type",
  message: "Message",
  linkedin: "LinkedIn",
  areas: "Board Areas",
  background: "Professional Background & Experience",
  leadership: "Leadership & Board Experience",
  businesses: "Businesses & Ventures",
  algeria_ties: "Ties to Algeria",
  aspiration: "Aspiration for AACC-USA",
  category: "Industry",
  business_type: "Business Type",
  company_size: "Company Size",
  description: "Description",
  website: "Website",
  logo_url: "Logo URL",
  social_links: "Social Media",
  submitted_by: "Submitted By (Member)",
  featured: "Sponsored (Public Page)",
  services: "Services",
  contact_name: "Contact Name",
  algeria_interest: "Algeria Market Interest",
  us_interest: "U.S. Market Interest",
  locale: "Language",
  status: "Status",
};

// Field order for the detail view; anything not listed renders afterward.
const FIELD_ORDER = [
  "created_at",
  "first_name",
  "last_name",
  "name",
  "contact_name",
  "email",
  "phone",
  "job_title",
  "business_name",
  "organization",
  "category",
  "business_type",
  "city",
  "state",
  "city_state",
  "website",
  "services",
  "tier",
  "inquiry_type",
  "linkedin",
  "areas",
  "background",
  "leadership",
  "businesses",
  "algeria_ties",
  "aspiration",
  "message",
  "algeria_interest",
  "us_interest",
  "locale",
  "status",
];

function formatDate(value: unknown) {
  if (typeof value !== "string") return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (key === "created_at") return formatDate(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "";
    return entries.map(([k, v]) => `${k}: ${v}`).join("\n");
  }
  return String(value);
}

function mailtoFor(row: Row, tab: TabKey) {
  const email = String(row.email ?? "");
  const subject = encodeURIComponent(EMAIL_SUBJECTS[tab] ?? "AACC-USA");
  const first = String(row.first_name ?? row.contact_name ?? row.name ?? "").split(" ")[0];
  const body = encodeURIComponent(`Dear ${first || "member of our community"},\n\n`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [myRole, setMyRole] = useState<StaffRole>("staff");
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwError, setPwError] = useState("");
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [directoryLimit, setDirectoryLimit] = useState(50);
  const isAdmin = myRole === "admin";

  const loadApprovalsCount = useCallback(async () => {
    if (!supabase) return;
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending");
    setApprovalsCount(count ?? 0);
  }, []);

  useEffect(() => {
    if (ready && isAdmin) loadApprovalsCount();
  }, [ready, isAdmin, loadApprovalsCount]);

  // Session guard
  useEffect(() => {
    if (!supabase) {
      router.replace("/admin/login");
      return;
    }
    const client = supabase;
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }
      // Fetch the authoritative user record so an admin's role change applies
      // as soon as this user refreshes — not at their next sign-in.
      const { data: fresh } = await client.auth.getUser();
      const user = fresh?.user ?? data.session.user;
      if (user.user_metadata?.must_change_password) {
        // Still on the temporary password: choose a real one first.
        router.replace("/admin/setup");
        return;
      }
      if (isMemberRole(appRoleOf(user))) {
        // Member accounts belong in the member portal, not the back office.
        router.replace("/portal");
        return;
      }
      // If the signed-in token still carries the old role, mint a new one so
      // database policies see the new role immediately too.
      if (appRoleOf(data.session.user) !== appRoleOf(user)) {
        await client.auth.refreshSession();
      }
      setEmail(user.email ?? "");
      setMyRole(roleOf(user));
      setReady(true);
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
    setDetail(null);
    if (tab === "users") {
      loadUsers();
    } else {
      loadRows();
    }
  }, [ready, tab, loadRows, loadUsers]);

  // How many sponsored listings the public directory page shows.
  useEffect(() => {
    if (!ready || tab !== "directory" || !supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "directory_public_limit")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value != null) setDirectoryLimit(Number(data.value) || 50);
      });
  }, [ready, tab]);

  async function saveDirectoryLimit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("site_settings").upsert({
      key: "directory_public_limit",
      value: directoryLimit,
      updated_at: new Date().toISOString(),
    });
    setNotice(
      error
        ? `Could not save the limit: ${error.message}`
        : `Public directory now shows up to ${directoryLimit} sponsored listings.`
    );
  }

  async function toggleFeatured(row: Row) {
    if (!supabase) return;
    const next = !row.featured;
    const { error } = await supabase
      .from("directory_submissions")
      .update({ featured: next })
      .eq("id", row.id);
    if (error) {
      setNotice(`Could not update the sponsored flag: ${error.message}`);
      return;
    }
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, featured: next } : r)));
    setDetail((current) =>
      current && current.id === row.id ? { ...current, featured: next } : current
    );
  }

  async function updateStatus(id: unknown, status: string) {
    if (!supabase || !currentTable) return;
    const { error } = await supabase.from(currentTable).update({ status }).eq("id", id);
    if (error) {
      setNotice(`Update failed: ${error.message}`);
    } else {
      setRows((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
      setDetail((current) => (current && current.id === id ? { ...current, status } : current));
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
      setDetail(null);
    }
  }

  function welcomeMailto(userEmail: string, role: AppRole, tempPassword?: string) {
    const subjects: Record<AppRole, string> = {
      admin: "Welcome to AACC-USA — Administrator Access",
      board: "Welcome to the AACC-USA Founding Board",
      staff: "Welcome to the AACC-USA Team",
      individual: "Welcome to AACC-USA — Your Membership Is Active",
      business: "Welcome to AACC-USA — Your Business Membership Is Active",
      ambassador: "Welcome to AACC-USA — State Ambassador",
    };
    const intros: Record<AppRole, string> = {
      admin:
        "Welcome aboard as an Administrator of the Algerian American Chamber of Commerce USA. You have full access to the chamber's back office, including approvals, billing, and user management.",
      board:
        "Welcome to the founding board of the Algerian American Chamber of Commerce USA. We are honored to have your leadership as we build the bridge between Algerian talent, trade, and opportunity.",
      staff:
        "Welcome to the AACC-USA team. You now have access to the chamber's back office to contribute content, manage tasks, and support our programs.",
      individual:
        "Welcome to the Algerian American Chamber of Commerce USA as an Individual Member. Your member portal gives you the chamber's events calendar, the full business directory, our newsletters, and curated resources.",
      business:
        "Welcome to the Algerian American Chamber of Commerce USA as a Business Member. Your member portal gives you the chamber's events calendar, the full business directory, our newsletters, and curated resources for doing business across both markets.",
      ambassador:
        "Welcome to the Algerian American Chamber of Commerce USA as a State Ambassador. You now represent the chamber in your state — your portal includes the events calendar, business directory, newsletters, resources, and the chamber CRM.",
    };
    const isMember = isMemberRole(role);
    const signInUrl = isMember
      ? "https://aacc-usa.org/portal/login"
      : "https://aacc-usa.org/admin/login";
    const body = [
      isMember ? "Dear member," : "Dear colleague,",
      "",
      intros[role],
      "",
      "Your sign-in details:",
      `Sign-in page: ${signInUrl}`,
      `Email: ${userEmail}`,
      tempPassword ? `Temporary password: ${tempPassword}` : "",
      "",
      "First sign-in - three quick steps:",
      `1. Open ${signInUrl}`,
      "2. Sign in with your email and the temporary password above",
      "3. You will be asked to create your own password",
      "",
      "For your security, the temporary password works only until you replace it.",
      "",
      "Warm regards,",
      "Fouad Bousetouane",
      "President, AACC-USA",
      "contact@aacc-usa.org",
    ]
      .filter((line) => line !== null)
      .join("\n");
    return `mailto:${userEmail}?subject=${encodeURIComponent(subjects[role])}&body=${encodeURIComponent(body)}`;
  }

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const userEmail = String(data.get("email") ?? "").trim().toLowerCase();
    const role = (String(data.get("role") ?? "board") as AppRole) || "board";
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: userEmail, role }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(body.error ?? "Could not create user.");
      return;
    }
    form.reset();
    loadUsers();
    if (body.welcomed) {
      // One email from contact@aacc-usa.org with the link, email, and
      // temporary password. No Supabase email involved.
      setNotice(
        `Account created for ${userEmail} (${ROLE_LABELS[role]}). Sign-in details with a temporary password were emailed from contact@aacc-usa.org.`
      );
    } else {
      setNotice(
        `Account created for ${userEmail} (${ROLE_LABELS[role]}), but the email could not be sent automatically. A draft with their temporary password is opening in your mail client — please send it.`
      );
      // SMTP not configured or failed: the admin sends the credentials personally.
      window.location.href = welcomeMailto(userEmail, role, body.tempPassword);
    }
  }

  async function changeRole(id: unknown, role: string) {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, role }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setNotice(body.error ?? "Could not change role.");
      return;
    }
    setNotice(
      "Role updated — it applies immediately; the user sees their new dashboard as soon as they refresh."
    );
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

  async function addToCrm(row: Row) {
    if (!supabase) return;
    const contact: Row = { source: tab, status: "lead", type: "other" };
    if (tab === "memberships") {
      Object.assign(contact, {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        organization: row.business_name,
        role_title: row.job_title,
        type: "member",
      });
    } else if (tab === "board") {
      Object.assign(contact, {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        type: "board",
        notes: row.background,
      });
    } else if (tab === "directory") {
      const [first, ...rest] = String(row.contact_name ?? "").split(/\s+/);
      Object.assign(contact, {
        first_name: first || String(row.business_name ?? "Contact"),
        last_name: rest.join(" ") || null,
        email: row.email,
        phone: row.phone,
        organization: row.business_name,
        type: "business",
      });
    } else if (tab === "contacts") {
      const [first, ...rest] = String(row.name ?? "").split(/\s+/);
      const typeByInquiry: Record<string, string> = {
        sponsorship: "sponsor",
        partnership: "partner",
        membership: "member",
        media: "media",
      };
      Object.assign(contact, {
        first_name: first || "Contact",
        last_name: rest.join(" ") || null,
        email: row.email,
        phone: row.phone,
        organization: row.organization,
        type: typeByInquiry[String(row.inquiry_type)] ?? "other",
        notes: row.message,
      });
    } else {
      return;
    }
    const { error } = await supabase.from("crm_contacts").insert(contact);
    if (!error) {
      setNotice(`Added to CRM: ${contact.first_name} ${contact.last_name ?? ""}`.trim() + ".");
    } else if (error.code === "23505") {
      setNotice("This person is already in the CRM.");
    } else {
      setNotice(`Could not add to CRM: ${error.message}`);
    }
  }

  // Approve a membership application: create the invite-only portal account
  // for the applied tier, send the invitation + welcome email, mark approved.
  async function inviteMember(row: Row) {
    if (!supabase) return;
    const memberEmail = String(row.email ?? "").trim().toLowerCase();
    if (!memberEmail) {
      setNotice("This application has no email address.");
      return;
    }
    const role = TIER_TO_ROLE[String(row.tier)] ?? "individual";
    if (
      !window.confirm(
        `Approve this application and invite ${memberEmail} as ${ROLE_LABELS[role]}?`
      )
    ) {
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: memberEmail, role }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(body.error ?? "Could not send the member invitation.");
      return;
    }
    await updateStatus(row.id, "approved");
    if (body.welcomed) {
      setNotice(
        `Application approved. Sign-in details with a temporary password were emailed to ${memberEmail} (${ROLE_LABELS[role]}) from contact@aacc-usa.org.`
      );
    } else {
      setNotice(
        `Application approved and the account created for ${memberEmail} (${ROLE_LABELS[role]}), but the email could not be sent automatically. A draft with their temporary password is opening in your mail client — please send it.`
      );
      window.location.href = welcomeMailto(memberEmail, role, body.tempPassword);
    }
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

  const detailEntries = detail
    ? [...FIELD_ORDER.filter((k) => k in detail), ...Object.keys(detail).filter((k) => !FIELD_ORDER.includes(k) && k !== "id")]
        .map((key) => ({ key, label: FIELD_LABELS[key] ?? key, value: formatValue(key, detail[key]) }))
        .filter((entry) => entry.value !== "")
    : [];

  const STAFF_TABS = ["dashboard", "tasks", "content", "events", "newsletter"];
  const visibleTabs = TABS.filter((t) => {
    if (isAdmin) return true;
    if (myRole === "staff") return STAFF_TABS.includes(t.key);
    return t.key !== "users" && t.key !== "approvals" && t.key !== "billing";
  });
  const currentLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  const sidebarNav = (
    <>
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="rounded-xl bg-white px-2.5 py-1.5">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={72} height={42} />
        </span>
        <div className="leading-tight">
          <p className="font-heading text-sm font-bold text-white">Back Office</p>
          <p className="text-[10px] uppercase tracking-wider text-navy-300">AACC-USA</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Back office sections">
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
            {t.key === "approvals" && approvalsCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {approvalsCount}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <p className="truncate px-3 pb-1 text-xs text-navy-300">{email}</p>
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
          <span className="font-heading text-sm font-bold text-navy">Back Office</span>
        </div>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-2xl font-bold text-navy">{currentLabel}</h1>
            {(currentTable || tab === "users") && (
              <button
                type="button"
                onClick={() => (tab === "users" ? loadUsers() : loadRows())}
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-navy-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
            )}
          </div>

          {notice && (
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold-100/50 px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      )}

      {tab === "dashboard" ? (
        <DashboardOverview onNotice={setNotice} goTo={(k) => setTab(k as TabKey)} />
      ) : tab === "tasks" ? (
        <TasksManager onNotice={setNotice} />
      ) : tab === "events" ? (
        <EventsManager onNotice={setNotice} />
      ) : tab === "billing" ? (
        <BillingManager onNotice={setNotice} />
      ) : tab === "newsletter" ? (
        <NewsletterComposer onNotice={setNotice} />
      ) : tab === "content" ? (
        <ContentManager onNotice={setNotice} />
      ) : tab === "approvals" ? (
        <ApprovalsManager onNotice={setNotice} onChanged={loadApprovalsCount} />
      ) : tab === "crm" ? (
        <CrmManager onNotice={setNotice} />
      ) : tab !== "users" ? (
        <>
        {/* Sponsored listings: what the public directory page shows */}
        {tab === "directory" && isAdmin && (
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-gold/40 bg-gold-100/30 px-5 py-4">
            <Star className="h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
            <p className="min-w-48 flex-1 text-sm text-ink">
              The public directory page shows only <strong>sponsored</strong> listings (
              {rows.filter((r) => r.featured).length} of {rows.length} marked). Members see the
              full directory in the portal. Use the star to sponsor a listing.
            </p>
            <form onSubmit={saveDirectoryLimit} className="flex items-center gap-2">
              <label htmlFor="dir-limit" className="text-sm font-semibold text-navy">
                Public limit
              </label>
              <input
                id="dir-limit"
                type="number"
                min={1}
                max={500}
                value={directoryLimit}
                onChange={(e) => setDirectoryLimit(Number(e.target.value))}
                className="w-20 rounded-lg border border-navy-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600"
              >
                Save
              </button>
            </form>
          </div>
        )}
        {/* Mobile: cards instead of a wide table */}
        <div className="mt-6 space-y-3 md:hidden">
          {rows.length === 0 && !loading && (
            <p className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-muted">
              No records yet.
            </p>
          )}
          {rows.map((row) => (
            <div
              key={String(row.id)}
              onClick={() => setDetail(row)}
              className="cursor-pointer rounded-2xl border border-navy-100 bg-white p-4 shadow-card active:bg-surface"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-bold text-navy">
                    {tab === "directory"
                      ? String(row.business_name ?? "")
                      : tab === "contacts"
                        ? String(row.name ?? "")
                        : tab === "subscribers"
                          ? String(row.email ?? "")
                          : `${row.first_name ?? ""} ${row.last_name ?? ""}`}
                  </p>
                  {tab !== "subscribers" && (
                    <p className="truncate text-xs text-muted">{String(row.email ?? "")}</p>
                  )}
                  <p className="mt-1 truncate text-xs text-muted">
                    {tab === "memberships" && `${row.tier ?? ""}${row.business_name ? ` · ${row.business_name}` : ""}`}
                    {tab === "board" && ((row.areas as string[]) ?? []).join(", ")}
                    {tab === "directory" && `${row.category ?? ""}${row.city ? ` · ${row.city}` : ""}`}
                    {tab === "contacts" && `${row.inquiry_type ?? ""}${row.organization ? ` · ${row.organization}` : ""}`}
                    {tab === "subscribers" && String(row.locale ?? "")}
                  </p>
                </div>
                {STATUS_OPTIONS[currentTable] && (
                  <select
                    value={String(row.status ?? "")}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateStatus(row.id, e.target.value)}
                    className={`shrink-0 rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${
                      statusColors[String(row.status)] ?? "bg-surface text-navy"
                    }`}
                  >
                    {STATUS_OPTIONS[currentTable].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div
                className="mt-3 flex items-center justify-between border-t border-navy-50 pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs text-muted">{formatDate(row.created_at)}</span>
                <span className="flex items-center gap-1">
                  <a
                    href={mailtoFor(row, tab)}
                    className="rounded-lg p-2 text-muted hover:bg-green-50 hover:text-green-600"
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card md:block">
          <table className="w-full min-w-[900px] text-sm">
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
                <tr
                  key={String(row.id)}
                  onClick={() => setDetail(row)}
                  className="cursor-pointer border-b border-navy-50 align-top transition-colors hover:bg-surface"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {tab === "directory"
                      ? String(row.business_name ?? "")
                      : tab === "contacts"
                        ? String(row.name ?? "")
                        : `${row.first_name ?? ""} ${row.last_name ?? ""}`}
                    {tab === "directory" && (
                      <span className="block text-xs font-normal text-muted">
                        {String(row.contact_name ?? "")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${row.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-green-600 hover:underline"
                    >
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
                      </>
                    )}
                    {tab === "board" && (
                      <span className="font-medium text-ink">
                        {((row.areas as string[]) ?? []).join(", ")}
                      </span>
                    )}
                    {tab === "directory" && (
                      <>
                        <span className="font-medium text-ink">{String(row.category ?? "")}</span>
                        {row.city ? ` · ${row.city}, ${row.state ?? ""}` : ""}
                      </>
                    )}
                    {tab === "contacts" && (
                      <>
                        <span className="font-medium text-ink">
                          {String(row.inquiry_type ?? "")}
                        </span>
                        {row.organization ? ` · ${row.organization}` : ""}
                        {row.message ? (
                          <span className="mt-1 block truncate text-xs">
                            {String(row.message)}
                          </span>
                        ) : null}
                      </>
                    )}
                    {tab === "subscribers" && <span>{String(row.locale ?? "")}</span>}
                  </td>
                  {STATUS_OPTIONS[currentTable] && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                  <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {tab === "directory" && isAdmin && (
                      <button
                        type="button"
                        onClick={() => toggleFeatured(row)}
                        className={`rounded-lg p-2 transition-colors ${
                          row.featured
                            ? "text-gold-600 hover:bg-gold-100"
                            : "text-muted hover:bg-gold-100 hover:text-gold-600"
                        }`}
                        aria-label={row.featured ? "Remove sponsored" : "Mark as sponsored"}
                        title={
                          row.featured
                            ? "Sponsored — shown on the public page"
                            : "Sponsor: show on the public page"
                        }
                      >
                        <Star className={`h-4 w-4 ${row.featured ? "fill-current" : ""}`} />
                      </button>
                    )}
                    {tab !== "subscribers" && (
                      <button
                        type="button"
                        onClick={() => setDetail(row)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-navy-50 hover:text-navy"
                        aria-label="View details"
                        title="View all answers"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <a
                      href={mailtoFor(row, tab)}
                      className="inline-block rounded-lg p-2 text-muted transition-colors hover:bg-green-50 hover:text-green-600"
                      aria-label="Email"
                      title="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <h2 className="inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
              <UserPlus className="h-4 w-4" /> Add User
            </h2>
            <form className="mt-4 space-y-3" onSubmit={createUser}>
              <input
                name="email"
                type="email"
                required
                placeholder="their@email.com"
                className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm"
              />
              <select
                name="role"
                defaultValue="board"
                className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm"
              >
                <optgroup label="Back office (staff)">
                  <option value="board">Board Member — full operations</option>
                  <option value="staff">Staff — tasks, content & events</option>
                  <option value="admin">Admin — everything incl. billing & users</option>
                </optgroup>
                <optgroup label="Member portal (invite-only)">
                  <option value="individual">Individual Member — portal access</option>
                  <option value="business">Business Member — portal access</option>
                  <option value="ambassador">State Ambassador — portal + CRM</option>
                </optgroup>
              </select>
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
              >
                Create Account & Email Sign-In Details
              </button>
              <p className="text-xs text-muted">
                One email from contact@aacc-usa.org with the sign-in link, their email, and a
                temporary password. They choose their own password at first sign-in.
              </p>
            </form>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card lg:col-span-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 text-start">Email</th>
                  <th className="px-4 py-3 text-start">Role</th>
                  <th className="px-4 py-3 text-start">Created</th>
                  <th className="px-4 py-3 text-start">Last Sign-in</th>
                  <th className="px-4 py-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      No users loaded.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr
                    key={String(user.id)}
                    onClick={() => setDetail(user)}
                    className="cursor-pointer border-b border-navy-50 transition-colors hover:bg-surface"
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{String(user.email)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {String(user.email).toLowerCase() === ADMIN_EMAIL || user.email === email ? (
                        <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                          {ROLE_LABELS[(user.role as StaffRole) ?? "admin"] ?? "Admin"}
                        </span>
                      ) : (
                        <select
                          value={String(user.role ?? "board")}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="rounded-full border-0 bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy"
                        >
                          <optgroup label="Back office">
                            <option value="admin">Admin</option>
                            <option value="board">Board Member</option>
                            <option value="staff">Staff</option>
                          </optgroup>
                          <optgroup label="Member portal">
                            <option value="individual">Individual Member</option>
                            <option value="business">Business Member</option>
                            <option value="ambassador">State Ambassador</option>
                          </optgroup>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-muted">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

      {/* Record detail dialog */}
      {detail && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Record details"
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setDetail(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute end-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="pe-10 font-heading text-xl font-bold text-navy">
              {String(
                detail.business_name ??
                  detail.name ??
                  `${detail.first_name ?? ""} ${detail.last_name ?? ""}`
              )}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {typeof detail.status === "string" && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[detail.status] ?? "bg-surface text-navy"
                  }`}
                >
                  {detail.status}
                </span>
              )}
              <a
                href={mailtoFor(detail, tab)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 text-xs font-semibold text-white hover:from-green-500 hover:to-green-400"
              >
                <Mail className="h-3.5 w-3.5" /> Email Applicant
              </a>
              {tab === "directory" && isAdmin && (
                <button
                  type="button"
                  onClick={() => toggleFeatured(detail)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold ${
                    detail.featured
                      ? "bg-gold text-navy hover:bg-gold-400"
                      : "border border-navy-200 text-navy hover:bg-surface"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${detail.featured ? "fill-current" : ""}`} />
                  {detail.featured ? "Sponsored — Remove" : "Mark as Sponsored"}
                </button>
              )}
              {tab === "memberships" && isAdmin && detail.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => inviteMember(detail)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-600"
                >
                  <MailPlus className="h-3.5 w-3.5" /> Approve &amp; Send Member Invite
                </button>
              )}
              {tab !== "users" && tab !== "subscribers" && (
                <button
                  type="button"
                  onClick={() => addToCrm(detail)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-4 py-2 text-xs font-semibold text-navy hover:bg-surface"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add to CRM
                </button>
              )}
            </div>
            <dl className="mt-6 space-y-4">
              {detailEntries.map((entry) => (
                <div key={entry.key} className="border-b border-navy-50 pb-3">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {entry.label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

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
