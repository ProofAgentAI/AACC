"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import DirectoryCard from "./DirectoryCard";
import { directoryListings, type DirectoryListing } from "@/data/directory";
import { supabase } from "@/lib/supabase";
import type { Locale, Dictionary } from "@/lib/i18n";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type ExplorerDict = Dictionary["directory"]["explorer"];

const selectClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

export default function DirectoryExplorer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ExplorerDict;
}) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [algeriaInterest, setAlgeriaInterest] = useState(false);
  const [usInterest, setUsInterest] = useState(false);
  // Approved real listings from the database; the mock listings are the
  // placeholder shown until real businesses are approved.
  const [listings, setListings] = useState<DirectoryListing[]>(directoryListings);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    async function loadSponsored() {
      // The public page shows only sponsored listings, capped by the
      // admin-managed limit; the full directory lives in the member portal.
      let limit = 50;
      const { data: setting } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "directory_public_limit")
        .maybeSingle();
      if (setting?.value != null) limit = Number(setting.value) || 50;

      const { data, error } = await client
        .from("directory_submissions")
        .select(
          "id, business_name, category, business_type, city, state, description, website, logo_url, services, algeria_interest, us_interest"
        )
        .eq("featured", true)
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error || !data || data.length === 0) return;
      setListings(
        data.map((row) => ({
          slug: row.id as string,
          name: row.business_name as string,
          category: (row.category as string) ?? "",
          businessType: (row.business_type as string) ?? "",
          city: (row.city as string) ?? "",
          state: (row.state as string) ?? "",
          description: (row.description as string) ?? "",
          website: (row.website as string) ?? "",
          logoUrl: (row.logo_url as string) ?? "",
          services: (row.services as string[]) ?? [],
          algeriaInterest: Boolean(row.algeria_interest),
          usInterest: Boolean(row.us_interest),
          initials: initialsOf(row.business_name as string),
        }))
      );
    }
    loadSponsored();
  }, []);

  const industries = useMemo(
    () => Array.from(new Set([...listings.map((l) => l.category).filter(Boolean)])).sort(),
    [listings]
  );
  const states = useMemo(
    () => Array.from(new Set([...listings.map((l) => l.state).filter(Boolean)])).sort(),
    [listings]
  );
  const businessTypes = useMemo(
    () => Array.from(new Set([...listings.map((l) => l.businessType).filter(Boolean)])).sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (industry && listing.category !== industry) return false;
      if (state && listing.state !== state) return false;
      if (businessType && listing.businessType !== businessType) return false;
      if (algeriaInterest && !listing.algeriaInterest) return false;
      if (usInterest && !listing.usInterest) return false;
      if (q) {
        const haystack = [
          listing.name,
          listing.category,
          listing.city,
          listing.state,
          listing.description,
          ...listing.services,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [listings, query, industry, state, businessType, algeriaInterest, usInterest]);

  return (
    <div>
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="directory-search" className="sr-only">
            {dict.searchLabel}
          </label>
          <input
            id="directory-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className="w-full rounded-lg border border-navy-200 bg-white py-3 ps-12 pe-4 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="filter-industry" className="sr-only">
              {dict.allIndustries}
            </label>
            <select
              id="filter-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={selectClasses}
            >
              <option value="">{dict.allIndustries}</option>
              {industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-state" className="sr-only">
              {dict.allStates}
            </label>
            <select
              id="filter-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={selectClasses}
            >
              <option value="">{dict.allStates}</option>
              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-type" className="sr-only">
              {dict.allTypes}
            </label>
            <select
              id="filter-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={selectClasses}
            >
              <option value="">{dict.allTypes}</option>
              {businessTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
            <input
              type="checkbox"
              checked={algeriaInterest}
              onChange={(e) => setAlgeriaInterest(e.target.checked)}
              className="h-4 w-4 rounded border-navy-200 accent-[#007A3D]"
            />
            {dict.algeriaInterest}
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
            <input
              type="checkbox"
              checked={usInterest}
              onChange={(e) => setUsInterest(e.target.checked)}
              className="h-4 w-4 rounded border-navy-200 accent-[#0B1F3A]"
            />
            {dict.usInterest}
          </label>
        </div>
      </div>

      <p className="mt-8 text-sm font-medium text-muted" role="status">
        {dict.showing} {filtered.length} {dict.of} {listings.length} {dict.businesses}
      </p>

      <p className="mt-2 text-sm text-muted">
        {dict.portalNote}{" "}
        <a href="/portal/login" className="font-semibold text-green-600 hover:underline">
          {dict.portalCta}
        </a>
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((listing) => (
          <DirectoryCard
            key={listing.slug}
            listing={listing}
            contactLabel={dict.contact}
            contactHref={`/${locale}/contact?inquiry=directory&business=${listing.slug}`}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-navy-200 bg-white p-14 text-center">
          <p className="font-heading text-lg font-bold text-navy">{dict.noResults}</p>
          <p className="mt-2 text-sm text-muted">{dict.noResultsHint}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIndustry("");
              setState("");
              setBusinessType("");
              setAlgeriaInterest(false);
              setUsInterest(false);
            }}
            className="mt-5 rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-surface"
          >
            {dict.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
}
