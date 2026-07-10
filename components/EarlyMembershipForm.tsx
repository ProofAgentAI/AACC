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

    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");

    const { error } = await supabase.from("membership_applications").insert({
      full_name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("phone") ?? "").trim() || null,
      organization: String(data.get("organization") ?? "").trim() || null,
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
        <label htmlFor="early-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.name} *
        </label>
        <input
          id="early-name"
          name="name"
          type="text"
          required
          placeholder={formDict.namePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="early-email" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.email} *
        </label>
        <input
          id="early-email"
          name="email"
          type="email"
          required
          placeholder={formDict.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="early-phone" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.phone}
        </label>
        <input
          id="early-phone"
          name="phone"
          type="tel"
          placeholder={formDict.phonePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="early-organization" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.organization}
        </label>
        <input
          id="early-organization"
          name="organization"
          type="text"
          placeholder={formDict.organizationPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="early-location" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.location}
        </label>
        <input
          id="early-location"
          name="location"
          type="text"
          placeholder={formDict.locationPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="early-tier" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.membershipInterest} *
        </label>
        <select id="early-tier" name="tier" required defaultValue="" className={inputClasses}>
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
        <label htmlFor="early-message" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.message}
        </label>
        <textarea
          id="early-message"
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
            <a href="mailto:membership@aaccusa.org" className="underline">
              membership@aaccusa.org
            </a>
          </p>
        )}
        {!supabase && (
          <p className="mt-3 text-xs text-muted">
            {dict.offlineText}{" "}
            <a href="mailto:membership@aaccusa.org" className="font-semibold text-green-600">
              membership@aaccusa.org
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
