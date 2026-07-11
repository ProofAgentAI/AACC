"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Globe, Mail, MapPin, Phone, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Listing = {
  id: string;
  business_name: string;
  category: string;
  business_type: string | null;
  city: string | null;
  state: string | null;
  description: string;
  website: string | null;
  services: string[];
  contact_name: string;
  email: string;
  phone: string | null;
};

export default function DirectoryBrowser({ onNotice }: { onNotice: (msg: string) => void }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("directory_submissions")
      .select(
        "id, business_name, category, business_type, city, state, description, website, services, contact_name, email, phone"
      )
      .eq("status", "approved")
      .order("business_name", { ascending: true });
    setLoading(false);
    if (error) {
      onNotice(`Could not load the directory: ${error.message}`);
      return;
    }
    setListings((data as Listing[]) ?? []);
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(listings.map((l) => l.category))).sort()],
    [listings]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (category !== "all" && listing.category !== category) return false;
      if (!q) return true;
      return [
        listing.business_name,
        listing.description,
        listing.city ?? "",
        listing.state ?? "",
        listing.services.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [listings, query, category]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search businesses, services, cities..."
            className="w-full rounded-lg border border-navy-200 bg-white py-2.5 pe-4 ps-10 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy"
          aria-label="Filter by industry"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All industries" : c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading the directory...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-muted">
          {listings.length === 0
            ? "No approved businesses in the directory yet."
            : "No businesses match your search."}
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <article
              key={listing.id}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-base font-bold leading-tight text-navy">
                    {listing.business_name}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-gold-600">{listing.category}</p>
                </div>
              </div>
              {(listing.city || listing.state) && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {[listing.city, listing.state].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                {listing.description}
              </p>
              {listing.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {listing.services.slice(0, 4).map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-navy"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-1 border-t border-navy-50 pt-3">
                <a
                  href={`mailto:${listing.email}`}
                  className="rounded-lg p-2 text-muted hover:bg-green-50 hover:text-green-600"
                  aria-label={`Email ${listing.business_name}`}
                  title={listing.email}
                >
                  <Mail className="h-4 w-4" />
                </a>
                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                    aria-label={`Call ${listing.business_name}`}
                    title={listing.phone}
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                    aria-label={`Visit ${listing.business_name} website`}
                    title={listing.website}
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                <span className="ms-auto truncate text-xs text-muted">{listing.contact_name}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
