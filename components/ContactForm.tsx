"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

type FormDict = Dictionary["form"];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

export default function ContactForm({
  dict,
  defaultInquiry = "",
  showInquiryType = true,
  submitLabel,
}: {
  dict: FormDict;
  defaultInquiry?: string;
  showInquiryType?: boolean;
  submitLabel?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-green-100 bg-green-50 p-10 text-center"
        role="status"
      >
        <h3 className="font-heading text-xl font-bold text-green-700">{dict.thanksTitle}</h3>
        <p className="mt-2 text-sm text-ink">{dict.thanksText}</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.name} *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={dict.namePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.email} *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={dict.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder={dict.phonePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="organization" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.organization}
        </label>
        <input
          id="organization"
          name="organization"
          type="text"
          placeholder={dict.organizationPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.location}
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder={dict.locationPlaceholder}
          className={inputClasses}
        />
      </div>
      {showInquiryType ? (
        <div>
          <label htmlFor="inquiry" className="mb-1.5 block text-sm font-semibold text-navy">
            {dict.inquiryType} *
          </label>
          <select
            id="inquiry"
            name="inquiry"
            required
            defaultValue={defaultInquiry}
            className={inputClasses}
          >
            <option value="" disabled>
              {dict.selectInquiry}
            </option>
            {dict.inquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="interest" className="mb-1.5 block text-sm font-semibold text-navy">
            {dict.membershipInterest} *
          </label>
          <select
            id="interest"
            name="interest"
            required
            defaultValue={defaultInquiry}
            className={inputClasses}
          >
            <option value="" disabled>
              {dict.selectTier}
            </option>
            {dict.tierOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={dict.messagePlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full rounded-lg bg-navy px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-600 sm:w-auto"
        >
          {submitLabel ?? dict.send}
        </button>
        <p className="mt-3 text-xs text-muted">
          {dict.disclaimer}{" "}
          <a href="mailto:info@aaccusa.org" className="font-semibold text-green-600">
            info@aaccusa.org
          </a>{" "}
          {dict.disclaimerSuffix}
        </p>
      </div>
    </form>
  );
}
