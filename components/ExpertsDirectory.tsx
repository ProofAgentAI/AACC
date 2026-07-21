"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Building2,
  Linkedin,
  Lock,
  LogIn,
  MapPin,
  Search,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ExpertApplyForm from "@/components/ExpertApplyForm";
import { EXPERT_DOMAINS, domainLabel, subdomainLabel } from "@/data/expertise";
import type { Locale, Dictionary } from "@/lib/i18n";

type ExpertsDict = Dictionary["experts"];

export type Expert = {
  id: string;
  name: string;
  title: string;
  organization: string | null;
  linkedin: string | null;
  city_state: string | null;
  domain: string;
  subdomain: string | null;
  bio: string;
  photo_url: string | null;
  highlighted: boolean;
};

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

function Photo({ expert, size }: { expert: Expert; size: string }) {
  return expert.photo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={expert.photo_url}
      alt={expert.name}
      className={`${size} rounded-full border border-navy-100 object-cover`}
    />
  ) : (
    <span
      className={`${size} flex items-center justify-center rounded-full bg-navy-50 text-navy-300`}
    >
      <UserRound className="h-1/2 w-1/2" aria-hidden="true" />
    </span>
  );
}

// Expert Council directory in two variants:
// - "public"  (/experts): only the admin-featured experts (up to 9) plus a
//   members-only notice — the extensive directory requires a member login.
// - "members" (member portal): the full searchable directory with keyword,
//   domain, and sub-expertise filters.
export default function ExpertsDirectory({
  locale,
  dict,
  variant = "public",
}: {
  locale: Locale;
  dict: ExpertsDict;
  variant?: "public" | "members";
}) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [selected, setSelected] = useState<Expert | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    let request = supabase
      .from("experts")
      .select(
        "id, name, title, organization, linkedin, city_state, domain, subdomain, bio, photo_url, highlighted"
      )
      .eq("status", "approved");
    // The public page only ever loads the featured picks.
    if (variant === "public") request = request.eq("highlighted", true);
    request
      .order("highlighted", { ascending: false })
      .order("name", { ascending: true })
      .then(({ data }) => {
        setExperts((data as Expert[]) ?? []);
        setLoaded(true);
      });
  }, [variant]);

  const featured = experts.filter((e) => e.highlighted).slice(0, 9);
  const activeDomain = EXPERT_DOMAINS.find((d) => d.value === domain);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return experts.filter((expert) => {
      if (domain && expert.domain !== domain) return false;
      if (subdomain && expert.subdomain !== subdomain) return false;
      if (!q) return true;
      return [expert.name, expert.title, expert.organization ?? "", expert.bio, expert.city_state ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [experts, query, domain, subdomain]);

  const card = (expert: Expert, isFeatured: boolean) => (
    <button
      key={expert.id}
      type="button"
      onClick={() => setSelected(expert)}
      className={`rounded-2xl border bg-white p-6 text-center shadow-card transition-shadow hover:shadow-card-hover ${
        isFeatured ? "border-gold/50" : "border-navy-100"
      }`}
    >
      <span className="relative mx-auto inline-block">
        <Photo expert={expert} size="h-24 w-24 mx-auto" />
        {isFeatured && (
          <span className="absolute -end-1 -top-1 rounded-full bg-gold p-1.5 text-navy">
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
          </span>
        )}
      </span>
      <p className="mt-4 font-heading text-base font-bold leading-snug text-navy">{expert.name}</p>
      <p className="mt-0.5 text-sm font-semibold text-gold-600">{expert.title}</p>
      {expert.organization && (
        <p className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-muted">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{expert.organization}</span>
        </p>
      )}
      <p className="mt-2">
        <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
          {domainLabel(expert.domain, locale)}
        </span>
      </p>
    </button>
  );

  return (
    <div>
      {variant === "public" ? (
        <>
          {/* Featured experts only — the admin's spotlight picks */}
          <div className="flex items-center gap-4">
            <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold text-navy">
              <Award className="h-5 w-5 text-gold-600" /> {dict.highlightedTitle}
            </h2>
            <span className="h-px flex-1 bg-navy-100" aria-hidden="true" />
          </div>
          {loaded && featured.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-navy-200 bg-white p-12 text-center text-sm text-muted">
              {dict.featuredEmpty}
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((expert) => card(expert, true))}
            </div>
          )}

          {/* The extensive directory is members-only */}
          <div className="mt-14 overflow-hidden rounded-3xl bg-navy-900 text-white">
            <div className="p-8 sm:p-10">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                <Lock className="h-4 w-4" /> {dict.membersOnly.eyebrow}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold">{dict.membersOnly.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-100 sm:text-base">
                {dict.membersOnly.text}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`/${locale}/membership`}
                  className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-7 py-3 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-green-400"
                >
                  {dict.membersOnly.join}
                </a>
                <a
                  href="/portal/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" /> {dict.membersOnly.signIn}
                </a>
              </div>
            </div>
          </div>

          {/* Become an expert */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <p className="min-w-56 flex-1 text-sm leading-relaxed text-muted">{dict.applyIntro}</p>
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
            >
              {dict.applyCta}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Members: the full searchable directory */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-navy">{dict.searchTitle}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative md:col-span-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={dict.searchPlaceholder}
                  className={`${inputClasses} ps-10`}
                />
              </div>
              <select
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setSubdomain("");
                }}
                className={inputClasses}
                aria-label={dict.domainLabel}
              >
                <option value="">{dict.allDomains}</option>
                {EXPERT_DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d[locale]}
                  </option>
                ))}
              </select>
              <select
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                disabled={!activeDomain}
                className={`${inputClasses} disabled:opacity-50`}
                aria-label={dict.subdomainLabel}
              >
                <option value="">{dict.allSubdomains}</option>
                {activeDomain?.subs.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub[locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-6 text-sm font-medium text-muted" role="status">
            {dict.showing} {filtered.length} {dict.experts}
          </p>

          {loaded && filtered.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-navy-200 bg-white p-12 text-center text-sm text-muted">
              {dict.empty}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((expert) => card(expert, expert.highlighted))}
            </div>
          )}
        </>
      )}

      {/* Expert profile dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-5 bg-navy-900 px-8 py-7">
              <Photo expert={selected} size="h-20 w-20" />
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-bold text-white">{selected.name}</h2>
                <p className="mt-0.5 text-sm font-semibold text-gold">{selected.title}</p>
                {selected.organization && (
                  <p className="mt-0.5 text-xs text-navy-100">{selected.organization}</p>
                )}
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy">
                  {domainLabel(selected.domain, locale)}
                </span>
                {selected.subdomain && (
                  <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                    {subdomainLabel(selected.domain, selected.subdomain, locale)}
                  </span>
                )}
                {selected.city_state && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <MapPin className="h-3.5 w-3.5" /> {selected.city_state}
                  </span>
                )}
              </div>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-navy">
                {dict.bioLabel}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink sm:text-base">
                {selected.bio}
              </p>
              {selected.linkedin && (
                <div className="mt-6 border-t border-navy-50 pt-5">
                  <a
                    href={selected.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply dialog */}
      {applyOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={dict.applyCta}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setApplyOpen(false)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setApplyOpen(false)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-navy-900 px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                {dict.hero.eyebrow}
              </p>
              <h2 className="mt-1 pe-8 font-heading text-lg font-bold text-white">
                {dict.applyCta}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-100">{dict.applyIntro}</p>
            </div>
            <div className="p-8">
              <ExpertApplyForm locale={locale} dict={dict} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
