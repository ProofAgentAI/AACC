"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase, DUPLICATE_KEY_CODE } from "@/lib/supabase";
import type { Locale, Dictionary } from "@/lib/i18n";

type EarlyDict = Dictionary["membership"]["early"];
type FormDict = Dictionary["form"];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

export default function EarlyMembershipForm({
  locale,
  dict,
  formDict,
}: {
  locale: Locale;
  dict: EarlyDict;
  formDict: FormDict;
}) {
  const [status, setStatus] = useState<Status>("idle");

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;

    const data = new FormData(e.currentTarget);
    setStatus("submitting");

    const { error } = await supabase.from("membership_applications").insert({
      first_name: String(data.get("firstName") ?? "").trim(),
      last_name: String(data.get("lastName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("cell") ?? "").trim() || null,
      job_title: String(data.get("jobFunction") ?? "").trim() || null,
      business_name: String(data.get("businessName") ?? "").trim() || null,
      city_state: String(data.get("location") ?? "").trim() || null,
      tier: String(data.get("tier") ?? "individual"),
      message: String(data.get("message") ?? "").trim() || null,
      locale,
    });

    if (!error) {
      setStatus("success");
    } else if (error.code === DUPLICATE_KEY_CODE) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="m-first-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.firstName} *
        </label>
        <input id="m-first-name" name="firstName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="m-last-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.lastName} *
        </label>
        <input id="m-last-name" name="lastName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="m-email" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.email} *
        </label>
        <input
          id="m-email"
          name="email"
          type="email"
          required
          placeholder={formDict.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="m-cell" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.cell}
        </label>
        <input
          id="m-cell"
          name="cell"
          type="tel"
          placeholder={formDict.phonePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="m-function" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.jobFunction}
        </label>
        <input
          id="m-function"
          name="jobFunction"
          type="text"
          placeholder={dict.jobFunctionPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="m-business" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.businessName}
        </label>
        <input
          id="m-business"
          name="businessName"
          type="text"
          placeholder={dict.businessNamePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="m-location" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.location}
        </label>
        <input
          id="m-location"
          name="location"
          type="text"
          placeholder={formDict.locationPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="m-tier" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.membershipInterest} *
        </label>
        <select id="m-tier" name="tier" required defaultValue="" className={inputClasses}>
          <option value="" disabled>
            {formDict.selectTier}
          </option>
          {formDict.tierOptions.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="m-message" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.message}
        </label>
        <textarea
          id="m-message"
          name="message"
          rows={4}
          placeholder={formDict.messagePlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting" || !supabase}
          className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? dict.submitting : dict.submitLabel}
        </button>
        {status === "error" && (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {dict.errorText}{" "}
            <a href="mailto:membership@aacc-usa.org" className="underline">
              membership@aacc-usa.org
            </a>
          </p>
        )}
        {!supabase && (
          <p className="mt-3 text-xs text-muted">
            {dict.offlineText}{" "}
            <a href="mailto:membership@aacc-usa.org" className="font-semibold text-green-600">
              membership@aacc-usa.org
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
