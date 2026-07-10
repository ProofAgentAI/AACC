import { UserRound } from "lucide-react";

export default function LeadershipCard({
  role,
  description,
}: {
  role: string;
  description: string;
}) {
  return (
    <article className="flex flex-col items-center rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-card transition-shadow hover:shadow-card-hover">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-500 text-gold">
        <UserRound className="h-9 w-9" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-heading text-lg font-bold text-navy">{role}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      <span className="mt-4 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
        Announcing Soon
      </span>
    </article>
  );
}
