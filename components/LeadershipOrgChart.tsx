"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, Linkedin, PenLine, UserRound, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

type LeadershipDict = Dictionary["about"]["leadership"];

// FACC-style leadership org chart: the president at the top, then the
// Executive Committee, Board of Directors, and Our Team tiers. Every seat
// except the president is a coming-soon placeholder until members are added
// in lib/content (photos live in public/images/team/ — see the README there).
export default function LeadershipOrgChart({
  leadership,
  comingSoon,
}: {
  leadership: LeadershipDict;
  comingSoon: string;
}) {
  const [bioOpen, setBioOpen] = useState(false);
  const president = leadership.president;

  return (
    <div className="mt-14">
      {/* Tier 1: President */}
      <div className="mx-auto max-w-xs">
        <div className="rounded-2xl border-2 border-gold bg-white p-6 text-center shadow-card">
          <Image
            src={president.photo}
            alt={president.name}
            width={112}
            height={112}
            className="mx-auto h-28 w-28 rounded-2xl border border-navy-100 object-cover"
          />
          <h3 className="mt-4 font-heading text-lg font-bold text-navy">{president.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-gold-600">{president.role}</p>
          <button
            type="button"
            onClick={() => setBioOpen(true)}
            className="mt-4 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-600"
          >
            {president.readBio}
          </button>
        </div>
      </div>

      {/* Tiers 2-4 with connector lines */}
      {leadership.tiers.map((tier) => (
        <div key={tier.title}>
          <div className="mx-auto h-8 w-px bg-navy-200" aria-hidden="true" />
          <div className="text-center">
            <span className="inline-block rounded-full bg-navy px-5 py-1.5 font-heading text-sm font-bold text-white">
              {tier.title}
            </span>
          </div>
          <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {tier.roles.map((role) => (
              <div
                key={role}
                className={`rounded-2xl border border-dashed border-navy-200 bg-white/60 p-5 text-center ${
                  tier.roles.length === 3 ? "md:[&:first-child]:col-start-1" : ""
                }`}
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-300">
                  <UserRound className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-3 font-heading text-sm font-bold leading-snug text-navy">
                  {role}
                </p>
                <span className="mt-2 inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold text-gold-600">
                  {comingSoon}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* President bio dialog */}
      {bioOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={president.name}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setBioOpen(false)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setBioOpen(false)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-5 bg-navy-900 px-8 py-7">
              <Image
                src={president.photo}
                alt={president.name}
                width={88}
                height={88}
                className="h-22 w-22 rounded-2xl border border-white/20 object-cover"
              />
              <div>
                <h2 className="font-heading text-xl font-bold text-white">{president.name}</h2>
                <p className="mt-0.5 text-sm font-semibold text-gold">{president.role}</p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {president.bio.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-ink sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
              <h3 className="mt-7 inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
                <Award className="h-4 w-4 text-gold-600" /> {president.recognitionTitle}
              </h3>
              <ul className="mt-3 space-y-2">
                {president.recognition.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {(president.linkedin || president.medium) && (
                <div className="mt-7 flex flex-wrap gap-3 border-t border-navy-50 pt-5">
                  {president.linkedin && (
                    <a
                      href={president.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {president.medium && (
                    <a
                      href={president.medium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
                    >
                      <PenLine className="h-4 w-4" /> Medium
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
