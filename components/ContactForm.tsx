"use client";

import { useState } from "react";

const inquiryTypes = [
  { value: "membership", label: "Membership" },
  { value: "sponsorship", label: "Sponsorship" },
  { value: "partnership", label: "Partnership" },
  { value: "directory", label: "Business Directory" },
  { value: "event", label: "Event" },
  { value: "media", label: "Media" },
  { value: "general", label: "General inquiry" },
];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

export default function ContactForm({
  defaultInquiry = "",
  showInquiryType = true,
  submitLabel = "Send Message",
}: {
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
        <h3 className="font-heading text-xl font-bold text-green-700">Thank you for reaching out</h3>
        <p className="mt-2 text-sm text-ink">
          Your message has been received. A member of the AACC-USA team will follow up shortly.
        </p>
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
          Name *
        </label>
        <input id="name" name="name" type="text" required placeholder="Full name" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy">
          Email *
        </label>
        <input id="email" name="email" type="email" required placeholder="you@company.com" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-navy">
          Phone
        </label>
        <input id="phone" name="phone" type="tel" placeholder="(555) 000-0000" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="organization" className="mb-1.5 block text-sm font-semibold text-navy">
          Organization
        </label>
        <input id="organization" name="organization" type="text" placeholder="Company or organization" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-navy">
          City / State
        </label>
        <input id="location" name="location" type="text" placeholder="e.g. Houston, TX" className={inputClasses} />
      </div>
      {showInquiryType ? (
        <div>
          <label htmlFor="inquiry" className="mb-1.5 block text-sm font-semibold text-navy">
            Inquiry Type *
          </label>
          <select id="inquiry" name="inquiry" required defaultValue={defaultInquiry} className={inputClasses}>
            <option value="" disabled>
              Select an inquiry type
            </option>
            {inquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor="interest" className="mb-1.5 block text-sm font-semibold text-navy">
            Membership Interest *
          </label>
          <select id="interest" name="interest" required defaultValue={defaultInquiry} className={inputClasses}>
            <option value="" disabled>
              Select a membership tier
            </option>
            <option value="individual">Individual Member</option>
            <option value="business">Business Member</option>
            <option value="corporate">Corporate Partner</option>
            <option value="founding-sponsor">Founding Sponsor</option>
          </select>
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-navy">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us about your goals, business, or how you'd like to get involved..."
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full rounded-lg bg-navy px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-600 sm:w-auto"
        >
          {submitLabel}
        </button>
        <p className="mt-3 text-xs text-muted">
          This form is a placeholder for the MVP — submissions are not yet transmitted. Email{" "}
          <a href="mailto:info@aaccusa.org" className="font-semibold text-green-600">
            info@aaccusa.org
          </a>{" "}
          directly for immediate inquiries.
        </p>
      </div>
    </form>
  );
}
