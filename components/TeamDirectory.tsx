"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Linkedin,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { supabase, DUPLICATE_KEY_CODE } from "@/lib/supabase";
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
  tier: "executive" | "board" | "leadership" | "ambassadors" | "advisory" | "experts" | "team";
  photo_url: string | null;
  bio: string | null;
  bio_ar: string | null;
  duties: string | null;
  duties_ar: string | null;
  suggested_profile: string | null;
  suggested_profile_ar: string | null;
  seat_status: string | null;
  linkedin: string | null;
  sort_order: number;
};

const TIERS = ["executive", "board", "leadership", "ambassadors", "advisory", "experts"] as const;

type ApplyStatus = "idle" | "submitting" | "success" | "duplicate" | "error";

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

// Public organization page: filled seats render as profile cards with a bio
// popup; open seats live in a compact "Open Positions" list with requirements
// and an Apply button that collects a short application for admin review.
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
  const [applyFor, setApplyFor] = useState<TeamMember | null>(null);
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>("idle");

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    supabase
      .from("team_members")
      .select(
        "id, name, name_ar, role_title, role_title_ar, tier, photo_url, bio, bio_ar, duties, duties_ar, suggested_profile, suggested_profile_ar, seat_status, linkedin, sort_order"
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
  const profileOf = (m: TeamMember) =>
    ((isAr && m.suggested_profile_ar ? m.suggested_profile_ar : m.suggested_profile) ?? "").trim();
  const statusLabel = (m: TeamMember) => {
    const key = (m.seat_status ?? "open") as keyof TeamDict["open"]["statuses"];
    return dict.open.statuses[key] ?? dict.open.statuses.open;
  };

  // Until the schema is applied (or if the database is unreachable), the
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
    suggested_profile_ar: null,
    seat_status: "confirmed",
    linkedin: president.linkedin || null,
    sort_order: 1,
  };

  const filledIn = (tier: string) =>
    members.filter(
      (m) => Boolean((m.name ?? "").trim()) && (m.tier === tier || (tier === "leadership" && m.tier === "team"))
    );
  const anyFilled = members.some((m) => Boolean((m.name ?? "").trim()));
  const openRoles = members.filter((m) => !(m.name ?? "").trim());

  async function submitApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || !applyFor) return;
    const data = new FormData(e.currentTarget);
    setApplyStatus("submitting");
    const { error } = await supabase.from("role_applications").insert({
      role_id: applyFor.id.includes("-fallback") ? null : applyFor.id,
      role_title: applyFor.role_title,
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("phone") ?? "").trim() || null,
      linkedin: String(data.get("linkedin") ?? "").trim() || null,
      city_state: String(data.get("cityState") ?? "").trim() || null,
      motivation: String(data.get("motivation") ?? "").trim(),
      background: String(data.get("background") ?? "").trim(),
      locale,
    });
    if (!error) {
      setApplyStatus("success");
    } else if (error.code === DUPLICATE_KEY_CODE) {
      setApplyStatus("duplicate");
    } else {
      setApplyStatus("error");
    }
  }

  return (
    <div className="space-y-14">
      {/* Filled seats: name, profile, and details */}
      {TIERS.map((tier) => {
        let tierMembers = filledIn(tier);
        if (tier === "executive" && loaded && tierMembers.length === 0 && !anyFilled) {
          tierMembers = [fallbackPresident];
        }
        if (tierMembers.length === 0) return null;
        return (
          <div key={tier}>
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-xl font-bold text-navy">{dict.sections[tier]}</h2>
              <span className="h-px flex-1 bg-navy-100" aria-hidden="true" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-5 sm:justify-start">
              {tierMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelected(member)}
                  className="w-full max-w-52 rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-card transition-shadow hover:shadow-card-hover sm:w-52"
                >
                  {member.photo_url ? (
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
                  <p className="mt-4 font-heading text-base font-bold leading-snug text-navy">
                    {nameOf(member)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gold-600">{roleOf(member)}</p>
                  <span className="mt-3 inline-block rounded-lg border border-navy-200 px-4 py-1.5 text-xs font-semibold text-navy">
                    {dict.readBio}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Open positions: compact, transparent, apply-able */}
      {loaded && openRoles.length > 0 && (
        <div>
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-xl font-bold text-navy">{dict.open.title}</h2>
            <span className="h-px flex-1 bg-navy-100" aria-hidden="true" />
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            {dict.open.description}
          </p>
          <div className="mt-8 space-y-10">
            {TIERS.map((tier) => {
              const roles = openRoles.filter(
                (m) => m.tier === tier || (tier === "leadership" && m.tier === "team")
              );
              if (roles.length === 0) return null;
              return (
                <div key={tier}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                    {dict.sections[tier]}
                  </h3>
                  <ul className="mt-3 divide-y divide-navy-50 rounded-2xl border border-navy-100 bg-white shadow-card">
                    {roles.map((role) => (
                      <li
                        key={role.id}
                        className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4"
                      >
                        <div className="min-w-56 flex-1">
                          <p className="flex flex-wrap items-center gap-2 font-heading text-sm font-bold text-navy">
                            {roleOf(role)}
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                role.seat_status === "priority"
                                  ? "bg-red-50 text-red-700"
                                  : role.seat_status === "candidate"
                                    ? "bg-navy-50 text-navy"
                                    : role.seat_status === "future"
                                      ? "bg-surface text-muted"
                                      : "bg-gold-100 text-gold-600"
                              }`}
                            >
                              {statusLabel(role)}
                            </span>
                          </p>
                          {dutiesOf(role) && (
                            <p className="mt-1 text-sm leading-relaxed text-muted">
                              {dutiesOf(role)}
                            </p>
                          )}
                          {profileOf(role) && (
                            <p className="mt-1.5 inline-flex items-start gap-1.5 text-xs font-medium text-ink">
                              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                              {dict.open.requirementLabel}: {profileOf(role)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setApplyStatus("idle");
                            setApplyFor(role);
                          }}
                          className="shrink-0 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-green-400"
                        >
                          {dict.open.apply}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member bio dialog */}
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
              {selected.photo_url ? (
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
                <h2 className="font-heading text-xl font-bold text-white">{nameOf(selected)}</h2>
                <p className="mt-0.5 text-sm font-semibold text-gold">{roleOf(selected)}</p>
              </div>
            </div>
            <div className="p-8">
              {dutiesOf(selected) && (
                <div className="mb-6 rounded-xl border border-navy-100 bg-surface p-5">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
                    <ClipboardList className="h-4 w-4 text-green-600" /> {dict.dutiesLabel}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">
                    {dutiesOf(selected)}
                  </p>
                </div>
              )}
              {bioOf(selected) && <BioHtml text={bioOf(selected)} />}
              {selected.linkedin && (
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

      {/* Apply dialog */}
      {applyFor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={dict.open.form.title}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setApplyFor(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setApplyFor(null)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-navy-900 px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                {dict.open.form.title}
              </p>
              <h2 className="mt-1 pe-8 font-heading text-lg font-bold text-white">
                {roleOf(applyFor)}
              </h2>
              {dutiesOf(applyFor) && (
                <p className="mt-2 text-sm leading-relaxed text-navy-100">{dutiesOf(applyFor)}</p>
              )}
              {profileOf(applyFor) && (
                <p className="mt-2 text-xs font-semibold text-gold">
                  {dict.open.requirementLabel}: {profileOf(applyFor)}
                </p>
              )}
            </div>
            <div className="p-8">
              {applyStatus === "success" || applyStatus === "duplicate" ? (
                <div className="text-center" role="status">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
                  <h3 className="mt-4 font-heading text-lg font-bold text-green-700">
                    {applyStatus === "success"
                      ? dict.open.form.successTitle
                      : dict.open.form.duplicateTitle}
                  </h3>
                  <p className="mt-2 text-sm text-ink">
                    {applyStatus === "success"
                      ? dict.open.form.successText
                      : dict.open.form.duplicateText}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitApplication} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="apply-name" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.name} *
                    </label>
                    <input id="apply-name" name="name" required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="apply-email" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.email} *
                    </label>
                    <input id="apply-email" name="email" type="email" required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="apply-phone" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.phone}
                    </label>
                    <input id="apply-phone" name="phone" type="tel" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="apply-city" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.cityState}
                    </label>
                    <input id="apply-city" name="cityState" className={inputClasses} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="apply-linkedin" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.linkedin}
                    </label>
                    <input
                      id="apply-linkedin"
                      name="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      className={inputClasses}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="apply-motivation" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.motivation} *
                    </label>
                    <textarea
                      id="apply-motivation"
                      name="motivation"
                      required
                      rows={3}
                      className={inputClasses}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="apply-background" className="mb-1.5 block text-sm font-semibold text-navy">
                      {dict.open.form.background} *
                    </label>
                    <textarea
                      id="apply-background"
                      name="background"
                      required
                      rows={3}
                      className={inputClasses}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={applyStatus === "submitting" || !supabase}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {applyStatus === "submitting"
                        ? dict.open.form.submitting
                        : dict.open.form.submit}
                    </button>
                    {applyStatus === "error" && (
                      <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                        {dict.open.form.error}{" "}
                        <a href="mailto:contact@aacc-usa.org" className="underline">
                          contact@aacc-usa.org
                        </a>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
