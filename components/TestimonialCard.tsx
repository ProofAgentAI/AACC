import { Quote } from "lucide-react";

export default function TestimonialCard({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <figure className="flex flex-col rounded-2xl border border-navy-100 bg-white p-8 shadow-card">
      <Quote className="h-8 w-8 text-gold" aria-hidden="true" />
      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 border-t border-navy-50 pt-5">
        <p className="font-semibold text-navy">{name}</p>
        <p className="text-sm text-muted">{title}</p>
      </figcaption>
    </figure>
  );
}
