"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase, DUPLICATE_KEY_CODE } from "@/lib/supabase";
import type { Locale, Dictionary } from "@/lib/i18n";

type BoardDict = Dictionary["about"]["board"];
type FormDict = Dictionary["form"];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

export default function BoardApplicationForm({
  locale,
  dict,
  formDict,
}: {
  locale: Locale;
  dict: BoardDict;
  formDict: FormDict;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const [areas, setAreas] = useState<string[]>([]);

  if (status === "success" || status === "duplicate") {
    return (
      <div
        className="rounded-2xl border border-green-100 bg-green-50 p-10 text-center"
        role="status"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
        <h3 className="mt-4 font-heading text-xl font-bold text-green-700">
          {status === "success" ? dict.successTitle : dict.duplicateTitle}
        </h3>
        <p className="mt-2 text-sm text-ink">
          {status === "success" ? dict.successText : dict.duplicateText}
        </p>
      </div>
    );
  }

  function toggleArea(value: string) {
    setAreas((current) =>
      current.includes(value) ? current.filter((a) => a !== value) : [...current, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;

    const data = new FormData(e.currentTarget);
    setStatus("submitting");

    const { error } = await supabase.from("board_applications").insert({
      first_name: String(data.get("firstName") ?? "").trim(),
      last_name: String(data.get("lastName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("cell") ?? "").trim() || null,
      city_state: String(data.get("location") ?? "").trim() || null,
      linkedin: String(data.get("linkedin") ?? "").trim() || null,
      areas,
      background: String(data.get("background") ?? "").trim(),
      leadership: String(data.get("leadership") ?? "").trim() || null,
      businesses: String(data.get("businesses") ?? "").trim() || null,
      algeria_ties: String(data.get("algeriaTies") ?? "").trim() || null,
      aspiration: String(data.get("aspiration") ?? "").trim() || null,
      locale,
    });

    if (!error) {
      setStatus("success");
    } else if (error.code === DUPLICATE_KEY_CODE) {
      setStatus("duplicate");
    } else {
      setErrorDetail(error.message ?? "");
      setStatus("error");
    }
  }

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="b-first-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.firstName} *
        </label>
        <input id="b-first-name" name="firstName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="b-last-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.lastName} *
        </label>
        <input id="b-last-name" name="lastName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="b-email" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.email} *
        </label>
        <input
          id="b-email"
          name="email"
          type="email"
          required
          placeholder={formDict.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="b-cell" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.phone}
        </label>
        <input
          id="b-cell"
          name="cell"
          type="tel"
          placeholder={formDict.phonePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="b-location" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.location}
        </label>
        <input
          id="b-location"
          name="location"
          type="text"
          placeholder={formDict.locationPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="b-linkedin" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.linkedin}
        </label>
        <input
          id="b-linkedin"
          name="linkedin"
          type="url"
          placeholder={dict.linkedinPlaceholder}
          className={inputClasses}
        />
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="mb-3 block text-sm font-semibold text-navy">{dict.areasLabel} *</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {dict.areas.map((area) => (
            <label
              key={area.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                areas.includes(area.value)
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-navy-200 bg-white text-ink hover:border-navy-300"
              }`}
            >
              <input
                type="checkbox"
                checked={areas.includes(area.value)}
                onChange={() => toggleArea(area.value)}
                className="h-4 w-4 accent-[#007A3D]"
              />
              {area.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <label htmlFor="b-background" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.background} *
        </label>
        <textarea
          id="b-background"
          name="background"
          rows={4}
          required
          placeholder={dict.backgroundPlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="b-leadership" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.leadership}
        </label>
        <textarea
          id="b-leadership"
          name="leadership"
          rows={3}
          placeholder={dict.leadershipPlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="b-businesses" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.businesses}
        </label>
        <textarea
          id="b-businesses"
          name="businesses"
          rows={3}
          placeholder={dict.businessesPlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="b-algeria" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.algeriaTies}
        </label>
        <textarea
          id="b-algeria"
          name="algeriaTies"
          rows={3}
          placeholder={dict.algeriaTiesPlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="b-aspiration" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.aspiration}
        </label>
        <textarea
          id="b-aspiration"
          name="aspiration"
          rows={3}
          placeholder={dict.aspirationPlaceholder}
          className={inputClasses}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting" || !supabase || areas.length === 0}
          className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? dict.submitting : dict.submitLabel}
        </button>
        {status === "error" && (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {dict.errorText}{" "}
            <a href="mailto:contact@aacc-usa.org" className="underline">
              contact@aacc-usa.org
            </a>
            {errorDetail && (
              <span className="mt-1 block text-xs font-normal text-red-500">
                ({errorDetail})
              </span>
            )}
          </p>
        )}
        {!supabase && (
          <p className="mt-3 text-xs text-muted">
            {dict.offlineText}{" "}
            <a href="mailto:contact@aacc-usa.org" className="font-semibold text-green-600">
              contact@aacc-usa.org
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
