"use client";

import { useState } from "react";
import { CheckCircle2, ImagePlus, Send, X } from "lucide-react";
import { supabase, DUPLICATE_KEY_CODE } from "@/lib/supabase";
import { EXPERT_DOMAINS } from "@/data/expertise";
import { US_STATES_FULL, DZ_WILAYAS } from "@/data/locations";
import type { Locale, Dictionary } from "@/lib/i18n";

type ExpertsDict = Dictionary["experts"];
type ApplyStatus = "idle" | "submitting" | "success" | "duplicate" | "error";

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

// The Expert Council application, shared by the popup on /experts and the
// standalone shareable page at /experts/apply. Location is a country choice
// (United States or Algeria) with the matching state / wilaya dropdown.
export default function ExpertApplyForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: ExpertsDict;
}) {
  const [status, setStatus] = useState<ApplyStatus>("idle");
  const [domain, setDomain] = useState("");
  const [country, setCountry] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const domainEntry = EXPERT_DOMAINS.find((d) => d.value === domain);

  async function uploadPhoto(file: File) {
    if (!supabase) return;
    if (file.size > 2 * 1024 * 1024) return;
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("expert-photos").upload(path, file);
    setUploading(false);
    if (error) return;
    const { data } = supabase.storage.from("expert-photos").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const data = new FormData(e.currentTarget);
    setStatus("submitting");
    // Stored display-ready in English for a consistent directory, e.g.
    // "Illinois, United States" or "Algiers, Algeria".
    const region = String(data.get("region") ?? "");
    const cityState = region
      ? `${region}, ${country === "dz" ? "Algeria" : "United States"}`
      : country
        ? country === "dz"
          ? "Algeria"
          : "United States"
        : null;
    const { error } = await supabase.from("experts").insert({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      title: String(data.get("title") ?? "").trim(),
      organization: String(data.get("organization") ?? "").trim() || null,
      city_state: cityState,
      linkedin: String(data.get("linkedin") ?? "").trim() || null,
      domain: String(data.get("domain") ?? ""),
      subdomain: String(data.get("subdomain") ?? "") || null,
      bio: String(data.get("bio") ?? "").trim(),
      photo_url: photoUrl || null,
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

  if (status === "success" || status === "duplicate") {
    return (
      <div className="py-6 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
        <h3 className="mt-4 font-heading text-lg font-bold text-green-700">
          {status === "success" ? dict.form.successTitle : dict.form.duplicateTitle}
        </h3>
        <p className="mt-2 text-sm text-ink">
          {status === "success" ? dict.form.successText : dict.form.duplicateText}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="ex-name" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.name} *
        </label>
        <input id="ex-name" name="name" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="ex-email" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.email} *
        </label>
        <input id="ex-email" name="email" type="email" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="ex-title" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.title} *
        </label>
        <input
          id="ex-title"
          name="title"
          required
          placeholder={dict.form.titlePlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="ex-org" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.organization}
        </label>
        <input id="ex-org" name="organization" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="ex-domain" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.domain} *
        </label>
        <select
          id="ex-domain"
          name="domain"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={inputClasses}
        >
          <option value="">{dict.form.selectDomain}</option>
          {EXPERT_DOMAINS.map((d) => (
            <option key={d.value} value={d.value}>
              {d[locale]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ex-sub" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.subdomain}
        </label>
        <select
          id="ex-sub"
          name="subdomain"
          disabled={!domainEntry}
          className={`${inputClasses} disabled:opacity-50`}
        >
          <option value="">{dict.form.selectSubdomain}</option>
          {domainEntry?.subs.map((sub) => (
            <option key={sub.value} value={sub.value}>
              {sub[locale]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ex-country" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.country} *
        </label>
        <select
          id="ex-country"
          name="country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={inputClasses}
        >
          <option value="">{dict.form.selectCountry}</option>
          <option value="us">{dict.form.usa}</option>
          <option value="dz">{dict.form.algeria}</option>
        </select>
      </div>
      <div>
        <label htmlFor="ex-region" className="mb-1.5 block text-sm font-semibold text-navy">
          {country === "dz" ? dict.form.wilaya : dict.form.state}
        </label>
        <select
          id="ex-region"
          name="region"
          disabled={!country}
          className={`${inputClasses} disabled:opacity-50`}
        >
          <option value="">
            {country === "dz" ? dict.form.selectWilaya : dict.form.selectState}
          </option>
          {country === "us" &&
            US_STATES_FULL.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          {country === "dz" &&
            DZ_WILAYAS.map((wilaya) => (
              <option key={wilaya.en} value={wilaya.en}>
                {wilaya[locale]}
              </option>
            ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ex-li" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.linkedin}
        </label>
        <input
          id="ex-li"
          name="linkedin"
          type="url"
          placeholder="https://linkedin.com/in/..."
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ex-bio" className="mb-1.5 block text-sm font-semibold text-navy">
          {dict.form.bio} *
        </label>
        <textarea id="ex-bio" name="bio" required rows={4} className={inputClasses} />
      </div>
      <div className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-navy">{dict.form.photo}</span>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <span className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt=""
                className="h-16 w-16 rounded-full border border-navy-100 object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="absolute -end-1 -top-1 rounded-full bg-red-600 p-1 text-white"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-navy-200 px-5 py-3 text-sm font-semibold text-navy hover:border-navy hover:bg-surface">
              <ImagePlus className="h-4 w-4" />
              {uploading ? dict.form.uploading : dict.form.uploadPhoto}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto(file);
                }}
              />
            </label>
          )}
          <span className="text-xs text-muted">{dict.form.photoHint}</span>
        </div>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "submitting" || uploading || !supabase}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {status === "submitting" ? dict.form.submitting : dict.form.submit}
        </button>
        {status === "error" && (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {dict.form.error}{" "}
            <a href="mailto:contact@aacc-usa.org" className="underline">
              contact@aacc-usa.org
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
