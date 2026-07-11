"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { isStaffUser } from "@/lib/admin";

export default function PortalSetupPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // The invite link signs the member in automatically; they just choose a password.
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSaving(true);
    const { error: updateError, data: updated } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push(isStaffUser(updated.user) ? "/admin" : "/portal");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
        <div className="flex justify-center">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={180} height={104} priority />
        </div>
        <h1 className="mt-6 text-center font-heading text-xl font-bold text-navy">
          Welcome to the AACC-USA Member Portal
        </h1>
        {!ready ? (
          <p className="mt-4 text-center text-sm text-muted">Loading...</p>
        ) : hasSession ? (
          <>
            <p className="mt-2 text-center text-sm text-muted">
              Choose a password to activate your membership account.
            </p>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-navy">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Set Password & Enter"}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-4 text-center text-sm text-muted">
            This setup link is invalid or has expired. Ask the chamber team for a new
            invitation, or{" "}
            <a href="/portal/login" className="font-semibold text-green-600 hover:underline">
              sign in
            </a>{" "}
            if you already have a password.
          </p>
        )}
      </div>
    </main>
  );
}
