"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, ClipboardList, Linkedin, UserRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BioHtml from "@/components/BioHtml";
import type { Locale, Dictionary } from "@/lib/i18n";

type TeamDict = Dictionary["team"];
type LeadershipDict = Dictionary["about"]["leadership"];

export type TeamMember = {
  id: string;
  name: string | null;
  name_ar: string | null;
  role_title: string;
  role_title_ar: string | null;
  tier: "executive" | "board" | "leadership" | "advisory" | "team";
  photo_url: string | null;
  bio: string | null;
  bio_ar: string | null;
  duties: string | null;
  duties_ar: string | null;
  suggested_profile: string | null;
  linkedin: string | null;
  sort_order: number;
};

const TIERS = ["executive", "board", "leadership", "advisory"] as const;

// Public organization structure: every role (filled or open) comes from the
// database, managed in the admin Team tab. Each card opens a popup with a few
// words on the role's responsibilities — and the bio for filled roles.
export default function TeamDirectory({
  locale,
  dict,
  leadership,
  comingSoon,
}: {
  locale: Locale;
  dict: TeamDict;
  leadership: LeadershipDict;
  comingSoon: string;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    supabase
      .from("team_members")
      .select(
        "id, name, name_ar, role_title, role_title_ar, tier, photo_url, bio, bio_ar, duties, duties_ar, suggested_profile, linkedin, sort_order"
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setMembers((data as TeamMember[]) ?? []);
        setLoaded(true);
      });
  }, []);

  const isAr = locale === "ar";
  const nameOf = (m: TeamMember) => (isAr && m.name_ar ? m.name_ar : m.name) ?? "";
  const roleOf = (m: TeamMember) => (isAr && m.role_title_ar ? m.role_title_ar : m.role_title);
  const bioOf = (m: TeamMember) => ((isAr && m.bio_ar ? m.bio_ar : m.bio) ?? "").trim();
  const dutiesOf = (m: TeamMember) => ((isAr && m.duties_ar ? m.duties_ar : m.duties) ?? "").trim();

  // Until schema v19/v20 is applied (or if the database is unreachable), the
  // president still appears, sourced from the dictionary.
  const president = leadership.president;
  const fallbackPresident: TeamMember = {
    id: "president-fallback",
    name: president.name,
    name_ar: null,
    role_title: president.role,
    role_title_ar: null,
    tier: "executive",
    photo_url: president.photo,
    bio: [...president.bio, `${president.recognitionTitle}: ${president.recognition.join(" · ")}.`].join(
      "\n\n"
    ),
    bio_ar: null,
    duties: null,
    duties_ar: null,
    suggested_profile: null,
    linkedin: president.linkedin || null,
    sort_order: 1,
  };

  return (
    <div className="space-y-14">
      {TIERS.map((tier) => {
        let tierMembers = members.filter(
          (m) => m.tier === tier || (tier === "leadership" && m.tier === "team")
        );
        if (tier === "executive" && loaded && tierMembers.length === 0) {
          tierMembers = [fallbackPresident];
        }
        if (!loaded || tierMembers.length === 0) return null;
        return (
          <div key={tier}>
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-xl font-bold text-navy">{dict.sections[tier]}</h2>
              <span className="h-px flex-1 bg-navy-100" aria-hidden="true" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-5 sm:justify-start">
              {tierMembers.map((member) => {
                const filled = Boolean(nameOf(member));
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelected(member)}
                    className={`w-full max-w-52 rounded-2xl p-6 text-center transition-shadow hover:shadow-card-hover sm:w-52 ${
                      filled
                        ? "border border-navy-100 bg-white shadow-card"
                        : "border border-dashed border-navy-200 bg-white/60"
                    }`}
                  >
                    {member.photo_url && filled ? (
                      <Image
                        src={member.photo_url}
                        alt={nameOf(member)}
                        width={96}
                        height={96}
                        className="mx-auto h-24 w-24 rounded-full border border-navy-100 object-cover"
                      />
                    ) : (
                      <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-navy-50 text-navy-300">
                        <UserRound className="h-10 w-10" aria-hidden="true" />
                      </span>
                    )}
                    {filled ? (
                      <>
                        <p className="mt-4 font-heading text-base font-bold leading-snug text-navy">
                          {nameOf(member)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gold-600">{roleOf(member)}</p>
                        <span className="mt-3 inline-block rounded-lg border border-navy-200 px-4 py-1.5 text-xs font-semibold text-navy">
                          {dict.readBio}
                        </span>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 font-heading text-sm font-bold leading-snug text-navy">
                          {roleOf(member)}
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                          {comingSoon}
                        </span>
                        <span className="mt-2 block text-xs font-semibold text-green-700">
                          {dict.details}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Role / member dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={nameOf(selected) || roleOf(selected)}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-5 bg-navy-900 px-8 py-7">
              {selected.photo_url && nameOf(selected) ? (
                <Image
                  src={selected.photo_url}
                  alt={nameOf(selected)}
                  width={88}
                  height={88}
                  className="h-22 w-22 rounded-2xl border border-white/20 object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-navy-200">
                  <UserRound className="h-10 w-10" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-bold text-white">
                  {nameOf(selected) || roleOf(selected)}
                </h2>
                <p className="mt-0.5 text-sm font-semibold text-gold">
                  {nameOf(selected) ? roleOf(selected) : comingSoon}
                </p>
              </div>
            </div>
            <div className="p-8">
              {dutiesOf(selected) && (
                <div className="rounded-xl border border-navy-100 bg-surface p-5">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
                    <ClipboardList className="h-4 w-4 text-green-600" /> {dict.dutiesLabel}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">
                    {dutiesOf(selected)}
                  </p>
                  {!nameOf(selected) && selected.suggested_profile && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <BadgeCheck className="h-3.5 w-3.5 text-gold-600" />
                      {dict.profileLabel}: {selected.suggested_profile}
                    </p>
                  )}
                </div>
              )}
              {bioOf(selected) && (
                <div className={dutiesOf(selected) ? "mt-6" : ""}>
                  <BioHtml text={bioOf(selected)} />
                </div>
              )}
              {selected.linkedin && nameOf(selected) && (
                <div className="mt-7 border-t border-navy-50 pt-5">
                  <a
                    href={selected.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
