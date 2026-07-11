"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase, DUPLICATE_KEY_CODE } from "@/lib/supabase";
import type { Locale, Dictionary } from "@/lib/i18n";

type SubmitDict = Dictionary["directory"]["submit"];
type FormDict = Dictionary["form"];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

export default function DirectorySubmitForm({
  locale,
  dict,
  formDict,
}: {
  locale: Locale;
  dict: SubmitDict;
  formDict: FormDict;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState("");

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

    const services = String(data.get("services") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from("directory_submissions").insert({
      business_name: String(data.get("businessName") ?? "").trim(),
      category: String(data.get("category") ?? "").trim(),
      business_type: String(data.get("businessType") ?? "").trim() || null,
      city: String(data.get("city") ?? "").trim() || null,
      state: String(data.get("state") ?? "").trim().toUpperCase() || null,
      description: String(data.get("description") ?? "").trim(),
      website: String(data.get("website") ?? "").trim() || null,
      services,
      contact_name: String(data.get("contactName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("phone") ?? "").trim() || null,
      algeria_interest: data.get("algeriaInterest") === "on",
      us_interest: data.get("usInterest") === "on",
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
      <div className="sm:col-span-2">
        <label htmlFor="d-business-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.businessName} *
        </label>
        <input id="d-business-name" name="businessName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="d-category" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.category} *
        </label>
        <select id="d-category" name="category" required defaultValue="" className={inputClasses}>
          <option value="" disabled>
            {dict.selectCategory}
          </option>
          {dict.categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="d-type" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.businessType}
        </label>
        <input
          id="d-type"
          name="businessType"
          type="text"
          placeholder={dict.businessTypePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="d-city" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.city}
        </label>
        <input id="d-city" name="city" type="text" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="d-state" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.state}
        </label>
        <input
          id="d-state"
          name="state"
          type="text"
          maxLength={2}
          placeholder={dict.statePlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="d-description" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.descriptionLabel} *
        </label>
        <textarea
          id="d-description"
          name="description"
          rows={4}
          required
          placeholder={dict.descriptionPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="d-website" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.website}
        </label>
        <input
          id="d-website"
          name="website"
          type="url"
          placeholder={dict.websitePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="d-services" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.servicesLabel}
        </label>
        <input
          id="d-services"
          name="services"
          type="text"
          placeholder={dict.servicesPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="d-contact" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.contactName} *
        </label>
        <input id="d-contact" name="contactName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="d-email" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.email} *
        </label>
        <input
          id="d-email"
          name="email"
          type="email"
          required
          placeholder={formDict.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="d-phone" className="mb-1.5 block text-sm font-semibold text-navy">
          {formDict.phone}
        </label>
        <input
          id="d-phone"
          name="phone"
          type="tel"
          placeholder={formDict.phonePlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
          <input type="checkbox" name="algeriaInterest" className="h-4 w-4 accent-[#007A3D]" />
          {dict.algeriaInterest}
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
          <input type="checkbox" name="usInterest" className="h-4 w-4 accent-[#0B1F3A]" />
          {dict.usInterest}
        </label>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting" || !supabase}
          className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 text-base font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? dict.submitting : dict.submitLabel}
        </button>
        <p className="mt-3 text-xs text-muted">{dict.reviewNote}</p>
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
