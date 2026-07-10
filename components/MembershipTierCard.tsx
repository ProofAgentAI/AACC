import Link from "next/link";
import { Check } from "lucide-react";

export type TierContent = {
  slug: string;
  name: string;
  price: string;
  period: string;
  audience: string;
  benefits: string[];
  featured: boolean;
  cta: string;
};

export default function MembershipTierCard({
  tier,
  href,
  mostPopular,
  pricingNote,
}: {
  tier: TierContent;
  href: string;
  mostPopular: string;
  pricingNote: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover ${
        tier.featured ? "border-gold ring-1 ring-gold" : "border-navy-100"
      }`}
    >
      {tier.featured && (
        <span className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy">
          {mostPopular}
        </span>
      )}
      <h3 className="font-heading text-lg font-bold text-navy">{tier.name}</h3>
      <p className="mt-3">
        <span className="font-heading text-3xl font-extrabold text-navy">{tier.price}</span>
        {tier.period && <span className="text-sm text-muted">{tier.period}</span>}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{tier.audience}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {tier.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-colors ${
          tier.featured
            ? "bg-navy text-white hover:bg-navy-600"
            : "border border-navy-200 text-navy hover:border-navy hover:bg-surface"
        }`}
      >
        {tier.cta}
      </Link>
      <p className="mt-3 text-center text-xs text-muted">{pricingNote}</p>
    </article>
  );
}
