import Link from "next/link";
import { Check } from "lucide-react";
import Icon from "./Icon";

export type TierContent = {
  slug: string;
  name: string;
  icon: string;
  audience: string;
  benefits: string[];
  featured: boolean;
  cta: string;
};

export default function MembershipTierCard({
  tier,
  href,
  mostPopular,
  comingSoon,
}: {
  tier: TierContent;
  href: string;
  mostPopular: string;
  comingSoon: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover ${
        tier.featured ? "border-gold ring-1 ring-gold" : "border-navy-100"
      }`}
    >
      {tier.featured && (
        <span className="absolute -top-3 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy rtl:translate-x-1/2">
          {mostPopular}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            tier.featured ? "bg-gold-100 text-gold-600" : "bg-navy-50 text-navy"
          }`}
        >
          <Icon name={tier.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading text-base font-bold leading-tight text-navy">{tier.name}</h3>
          <span className="text-xs font-semibold text-gold-600">{comingSoon}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{tier.audience}</p>
      <ul className="mt-4 flex-1 space-y-2 border-t border-navy-50 pt-4">
        {tier.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-5 rounded-lg px-5 py-2.5 text-center text-sm font-semibold transition-colors ${
          tier.featured
            ? "bg-navy text-white hover:bg-navy-600"
            : "border border-navy-200 text-navy hover:border-navy hover:bg-surface"
        }`}
      >
        {tier.cta}
      </Link>
    </article>
  );
}
