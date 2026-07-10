import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import EventCard from "@/components/EventCard";
import CTASection from "@/components/CTASection";
import { CalendarClock } from "lucide-react";
import { upcomingEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Events — Summits, Briefings, Workshops & Roundtables",
  description:
    "Upcoming AACC-USA events: the Algerian-American Business Summit, Algeria Investment Briefing, export/import workshops, founding roundtables, and live podcast recordings.",
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Where the Network Comes Together"
        description="Summits, investment briefings, workshops, roundtables, and live podcasts — in person and virtual, across the United States."
      />

      {/* Upcoming */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="Save Your Seat"
            description="Placeholder dates for the chamber's inaugural event calendar. Registration details announced to members first."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Past events */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Past Events" title="Event Archive" />
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-dashed border-navy-200 bg-surface p-14 text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
            <h3 className="mt-5 font-heading text-lg font-bold text-navy">
              Our story starts now
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              AACC-USA is launching its inaugural event season. Past event recaps, photos, and
              recordings will appear here after our first gatherings.
            </p>
            <Link
              href="#newsletter"
              className="mt-6 inline-block rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-white"
            >
              Get Event Announcements
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Host an Event With Us"
        description="Partner with AACC-USA to host a summit, briefing, or networking event — and put your organization in front of the Algerian-American business network."
        primaryLabel="Become an Event Sponsor"
        primaryHref="/sponsors"
        secondaryLabel="Propose an Event"
        secondaryHref="/contact?inquiry=event"
      />
    </>
  );
}
