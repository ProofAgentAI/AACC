"use client";

import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const FIELDS = [
  { key: "full_name", label: "Full Name", placeholder: "First and last name" },
  { key: "phone", label: "Phone", placeholder: "(555) 000-0000" },
  { key: "organization", label: "Business / Organization", placeholder: "Your company" },
  { key: "job_title", label: "Title / Function", placeholder: "e.g. Founder, Engineer, CPA" },
  { key: "city", label: "City", placeholder: "e.g. Chicago" },
  { key: "state", label: "State", placeholder: "e.g. IL" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export default function ProfileEditor({
  email,
  onSaved,
  onNotice,
}: {
  email: string;
  onSaved: (fullName: string) => void;
  onNotice: (msg: string) => void;
}) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    full_name: "",
    phone: "",
    organization: "",
    job_title: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {};
      setValues((current) => {
        const next = { ...current };
        for (const field of FIELDS) {
          next[field.key] = String(meta[field.key] ?? "");
        }
        return next;
      });
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    const data: Record<string, string> = {};
    for (const field of FIELDS) data[field.key] = values[field.key].trim();
    const { error } = await supabase.auth.updateUser({ data });
    setSaving(false);
    if (error) {
      onNotice(`Could not save your profile: ${error.message}`);
      return;
    }
    onSaved(data.full_name);
    onNotice("Profile saved.");
  }

  return (
    <div className="mt-6 max-w-2xl rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
      <h2 className="inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
        <UserCircle className="h-4 w-4" /> My Profile
      </h2>
      <p className="mt-1 text-sm text-muted">
        Signed in as <span className="font-semibold text-navy">{email}</span>. Keep your details
        current so the chamber team can reach you.
      </p>
      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading your profile...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className={field.key === "full_name" ? "sm:col-span-2" : ""}>
              <label
                htmlFor={`profile-${field.key}`}
                className="mb-1.5 block text-sm font-semibold text-navy"
              >
                {field.label}
              </label>
              <input
                id={`profile-${field.key}`}
                value={values[field.key]}
                onChange={(e) =>
                  setValues((current) => ({ ...current, [field.key]: e.target.value }))
                }
                placeholder={field.placeholder}
                className={inputClasses}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-8 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
