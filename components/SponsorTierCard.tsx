import Link from "next/link";
import { Check } from "lucide-react";
import type { SponsorTier } from "@/data/sponsors";

export default function SponsorTierCard({ tier }: { tier: SponsorTier }) {
  return (
    <article
      className={`flex flex-col rounded-2xl border p-8 shadow-card transition-shadow hover:shadow-card-hover ${
        tier.featured
          ? "border-gold bg-navy text-white ring-1 ring-gold"
          : "border-navy-100 bg-white"
      }`}
    >
      <h3 className={`font-heading text-lg font-bold ${tier.featured ? "text-gold" : "text-navy"}`}>
        {tier.name}
      </h3>
      <p className={`mt-2 font-heading text-3xl font-extrabold ${tier.featured ? "text-white" : "text-navy"}`}>
        {tier.price}
      </p>
      <p className={`mt-3 text-sm leading-relaxed ${tier.featured ? "text-navy-100" : "text-muted"}`}>
        {tier.description}
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {tier.benefits.map((benefit) => (
          <li
            key={benefit}
            className={`flex items-start gap-2.5 text-sm ${tier.featured ? "text-navy-100" : "text-ink"}`}
          >
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${tier.featured ? "text-gold" : "text-green-600"}`}
              aria-hidden="true"
            />
            {benefit}
          </li>
        ))}
      </ul>
      <Link
        href={`/contact?inquiry=sponsorship&tier=${tier.slug}`}
        className={`mt-8 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-colors ${
          tier.featured
            ? "bg-gold text-navy hover:bg-gold-400"
            : "border border-navy-200 text-navy hover:border-navy hover:bg-surface"
        }`}
      >
        Become a Sponsor
      </Link>
    </article>
  );
}
