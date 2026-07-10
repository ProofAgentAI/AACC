"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import DirectoryCard from "./DirectoryCard";
import {
  directoryListings,
  industries,
  states,
  businessTypes,
} from "@/data/directory";

const selectClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

export default function DirectoryExplorer() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [algeriaInterest, setAlgeriaInterest] = useState(false);
  const [usInterest, setUsInterest] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return directoryListings.filter((listing) => {
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
  }, [query, industry, state, businessType, algeriaInterest, usInterest]);

  return (
    <div>
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="directory-search" className="sr-only">
            Search businesses
          </label>
          <input
            id="directory-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, service, or keyword..."
            className="w-full rounded-lg border border-navy-200 bg-white py-3 pl-12 pr-4 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="filter-industry" className="sr-only">
              Filter by industry
            </label>
            <select
              id="filter-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={selectClasses}
            >
              <option value="">All Industries</option>
              {industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-state" className="sr-only">
              Filter by state
            </label>
            <select
              id="filter-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={selectClasses}
            >
              <option value="">All States</option>
              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-type" className="sr-only">
              Filter by business type
            </label>
            <select
              id="filter-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={selectClasses}
            >
              <option value="">All Business Types</option>
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
            Algeria market interest
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
            <input
              type="checkbox"
              checked={usInterest}
              onChange={(e) => setUsInterest(e.target.checked)}
              className="h-4 w-4 rounded border-navy-200 accent-[#0B1F3A]"
            />
            U.S. market interest
          </label>
        </div>
      </div>

      <p className="mt-8 text-sm font-medium text-muted" role="status">
        Showing {filtered.length} of {directoryListings.length} businesses
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((listing) => (
          <DirectoryCard key={listing.slug} listing={listing} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-navy-200 bg-white p-14 text-center">
          <p className="font-heading text-lg font-bold text-navy">No businesses match your filters</p>
          <p className="mt-2 text-sm text-muted">
            Try broadening your search — or be the first to represent this category.
          </p>
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
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
