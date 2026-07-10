import { UserRound } from "lucide-react";

export default function LeadershipCard({
  role,
  description,
  badge,
  person,
}: {
  role: string;
  description: string;
  badge?: string;
  person?: string;
}) {
  return (
    <article
      className={`flex flex-col items-center rounded-2xl border bg-white p-8 text-center shadow-card transition-shadow hover:shadow-card-hover ${
        person ? "border-gold ring-1 ring-gold" : "border-navy-100"
      }`}
    >
      <span
        className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${
          person ? "from-gold-600 to-gold-400 text-white" : "from-navy to-navy-500 text-gold"
        }`}
      >
        <UserRound className="h-9 w-9" aria-hidden="true" />
      </span>
      {person ? (
        <>
          <h3 className="mt-5 font-heading text-lg font-bold text-navy">{person}</h3>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold-600">
            {role}
          </p>
        </>
      ) : (
        <h3 className="mt-5 font-heading text-lg font-bold text-navy">{role}</h3>
      )}
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      {badge && (
        <span className="mt-4 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
          {badge}
        </span>
      )}
    </article>
  );
}
