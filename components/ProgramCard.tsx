import Link from "next/link";
import Icon from "./Icon";

export default function ProgramCard({
  program,
  contactHref,
}: {
  program: { title: string; description: string; icon: string; cta: string };
  contactHref: string;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy transition-colors group-hover:bg-navy group-hover:text-gold">
        <Icon name={program.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 font-heading text-lg font-bold text-navy">{program.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{program.description}</p>
      <Link
        href={contactHref}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-600 transition-colors hover:text-green-700"
      >
        {program.cta}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180">
          →
        </span>
      </Link>
    </article>
  );
}
