import Link from "next/link";
import { Calendar, MapPin, Video } from "lucide-react";
import type { ChamberEvent } from "@/data/events";

export default function EventCard({ event }: { event: ChamberEvent }) {
  return (
    <article className="flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy">
          {event.category}
        </span>
        {event.isVirtual && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <Video className="h-3.5 w-3.5" aria-hidden="true" />
            Virtual
          </span>
        )}
      </div>
      <h3 className="mt-4 font-heading text-lg font-bold text-navy">{event.title}</h3>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gold-600" aria-hidden="true" />
          {event.date}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
          {event.location}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{event.description}</p>
      <Link
        href={`/contact?inquiry=event&event=${event.slug}`}
        className="mt-6 rounded-lg bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-600"
      >
        Register
      </Link>
    </article>
  );
}
