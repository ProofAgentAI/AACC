import Link from "next/link";
import { MapPin, Globe } from "lucide-react";
import type { DirectoryListing } from "@/data/directory";

export default function DirectoryCard({ listing }: { listing: DirectoryListing }) {
  return (
    <article className="flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-500 font-heading text-lg font-bold text-gold"
          aria-hidden="true"
        >
          {listing.initials}
        </span>
        <div>
          <h3 className="font-heading text-lg font-bold leading-snug text-navy">{listing.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-green-600">
            {listing.category}
          </p>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
        <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
        {listing.city}, {listing.state}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{listing.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {listing.services.map((service) => (
          <span
            key={service}
            className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-navy"
          >
            {service}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-navy-50 pt-5">
        <span className="inline-flex items-center gap-1.5 truncate text-sm text-muted">
          <Globe className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
          <span className="truncate">{listing.website}</span>
        </span>
        <Link
          href={`/contact?inquiry=directory&business=${listing.slug}`}
          className="shrink-0 rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-surface"
        >
          Contact
        </Link>
      </div>
    </article>
  );
}
