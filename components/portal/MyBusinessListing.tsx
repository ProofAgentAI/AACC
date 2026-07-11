"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, ImagePlus, Star, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Submission = {
  id: string;
  created_at: string;
  business_name: string;
  category: string;
  status: string;
  featured: boolean;
  logo_url: string | null;
};

const INDUSTRIES = [
  "Technology Consulting",
  "Technology & AI",
  "Import/Export",
  "Food & Hospitality",
  "Real Estate",
  "Legal Services",
  "Healthcare",
  "Education",
  "Logistics",
  "Finance & Accounting",
  "Energy & Industry",
  "Media & Marketing",
  "Influencer / Content Creator",
  "Other",
];

const BUSINESS_TYPES = [
  "LLC",
  "Corporation",
  "Sole Proprietorship",
  "Partnership",
  "Startup",
  "Nonprofit",
  "Influencer / Creator",
  "Freelancer / Independent",
];

const COMPANY_SIZES = ["Solo (1)", "2-10", "11-50", "51-200", "200+"];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbusiness" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourbusiness" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbusiness" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourbusiness" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourbusiness" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourbusiness" },
];

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const statusColors: Record<string, string> = {
  pending: "bg-gold-100 text-gold-600",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default function MyBusinessListing({
  email,
  onNotice,
}: {
  email: string;
  onNotice: (msg: string) => void;
}) {
  const [mine, setMine] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !email) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("directory_submissions")
      .select("id, created_at, business_name, category, status, featured, logo_url")
      .eq("submitted_by", email)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load your listings: ${error.message}`);
      return;
    }
    setMine((data as Submission[]) ?? []);
  }, [email, onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadLogo(file: File) {
    if (!supabase) return;
    if (file.size > 2 * 1024 * 1024) {
      onNotice("Logo must be under 2 MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${email.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("business-logos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      onNotice(`Logo upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("business-logos").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const social: Record<string, string> = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const value = String(data.get(`social_${platform.key}`) ?? "").trim();
      if (value) social[platform.key] = value;
    }
    const services = String(data.get("services") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    const { error } = await supabase.from("directory_submissions").insert({
      business_name: String(data.get("business_name") ?? "").trim(),
      category: String(data.get("category") ?? ""),
      business_type: String(data.get("business_type") ?? "") || null,
      company_size: String(data.get("company_size") ?? "") || null,
      city: String(data.get("city") ?? "").trim() || null,
      state: String(data.get("state") ?? "") || null,
      description: String(data.get("description") ?? "").trim(),
      website: String(data.get("website") ?? "").trim() || null,
      logo_url: logoUrl || null,
      social_links: social,
      services,
      contact_name: String(data.get("contact_name") ?? "").trim(),
      email,
      phone: String(data.get("phone") ?? "").trim() || null,
      algeria_interest: data.get("algeria_interest") === "on",
      us_interest: data.get("us_interest") === "on",
      submitted_by: email,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      onNotice(`Could not submit your listing: ${error.message}`);
      return;
    }
    form.reset();
    setLogoUrl("");
    setFormOpen(false);
    onNotice(
      "Your business listing was submitted. The chamber team reviews every request; once approved it appears in the member directory."
    );
    load();
  }

  return (
    <div className="mt-6 space-y-6">
      {/* My submissions */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
            <Building2 className="h-4 w-4" /> My Business Listings
          </h2>
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
          >
            {formOpen ? "Close Form" : "Submit a Business Listing"}
          </button>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading your listings...</p>
        ) : mine.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-navy-200 p-6 text-center text-sm text-muted">
            You have not submitted a business listing yet. Submit one and the chamber team will
            review it for the member directory.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.map((submission) => (
              <li
                key={submission.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-navy-100 p-4"
              >
                {submission.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={submission.logo_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy">
                    <Building2 className="h-5 w-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-bold text-navy">
                    {submission.business_name}
                  </p>
                  <p className="text-xs text-muted">{submission.category}</p>
                </div>
                {submission.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
                    <Star className="h-3 w-3" /> Sponsored
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[submission.status] ?? "bg-surface text-navy"
                  }`}
                >
                  {submission.status === "pending" ? "In review" : submission.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submission form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
        >
          <h3 className="font-heading text-base font-bold text-navy">New Business Listing</h3>
          <p className="mt-1 text-sm text-muted">
            Influencers and content creators are welcome — list your brand like any small
            business, with your social channels front and center.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-name">
                Business / Brand Name *
              </label>
              <input id="biz-name" name="business_name" required className={inputClasses} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-cat">
                Industry *
              </label>
              <select id="biz-cat" name="category" required className={inputClasses}>
                <option value="">Select an industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-type">
                Business Type
              </label>
              <select id="biz-type" name="business_type" className={inputClasses}>
                <option value="">Select a type</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-size">
                Company Size
              </label>
              <select id="biz-size" name="company_size" className={inputClasses}>
                <option value="">Select a size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-state">
                State
              </label>
              <select id="biz-state" name="state" className={inputClasses}>
                <option value="">Select a state</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-city">
                City
              </label>
              <input id="biz-city" name="city" className={inputClasses} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-web">
                Website
              </label>
              <input
                id="biz-web"
                name="website"
                type="url"
                placeholder="https://..."
                className={inputClasses}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-desc">
                What does your business do? *
              </label>
              <textarea
                id="biz-desc"
                name="description"
                required
                rows={4}
                className={inputClasses}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-serv">
                Services (comma separated)
              </label>
              <input
                id="biz-serv"
                name="services"
                placeholder="Consulting, Distribution, Content..."
                className={inputClasses}
              />
            </div>

            {/* Logo */}
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-navy">Logo</span>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <span className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="absolute -end-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                      aria-label="Remove logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : (
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-navy-200 px-5 py-3 text-sm font-semibold text-navy hover:border-navy hover:bg-surface">
                    <ImagePlus className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload logo (PNG/JPG, max 2 MB)"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadLogo(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Social media */}
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-navy">Social Media</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key}>
                    <label
                      className="mb-1 block text-xs font-semibold text-muted"
                      htmlFor={`social-${platform.key}`}
                    >
                      {platform.label}
                    </label>
                    <input
                      id={`social-${platform.key}`}
                      name={`social_${platform.key}`}
                      type="url"
                      placeholder={platform.placeholder}
                      className={inputClasses}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-contact">
                Contact Name *
              </label>
              <input id="biz-contact" name="contact_name" required className={inputClasses} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="biz-phone">
                Phone
              </label>
              <input id="biz-phone" name="phone" type="tel" className={inputClasses} />
            </div>
            <div className="flex flex-wrap gap-5 sm:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                <input
                  type="checkbox"
                  name="algeria_interest"
                  className="h-4 w-4 rounded border-navy-200 accent-[#007A3D]"
                />
                Interested in the Algerian market
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy">
                <input
                  type="checkbox"
                  name="us_interest"
                  className="h-4 w-4 rounded border-navy-200 accent-[#0B1F3A]"
                />
                Interested in the U.S. market
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-6 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit for Review"}
          </button>
          <p className="mt-3 text-xs text-muted">
            Submitted as {email}. The chamber team reviews every listing before it appears in the
            directory.
          </p>
        </form>
      )}
    </div>
  );
}
