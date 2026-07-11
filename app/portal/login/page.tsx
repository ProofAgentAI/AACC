"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { isStaffUser } from "@/lib/admin";
import ForgotPassword from "@/components/ForgotPassword";

export default function PortalLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setError("The member portal is not configured (missing Supabase environment variables).");
      return;
    }
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const { error: signInError, data: signedIn } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    });
    setLoading(false);
    if (signInError) {
      setError("Invalid email or password.");
      return;
    }
    // First sign-in with a temporary password: choose a real password first.
    const mustChange = Boolean(signedIn.user?.user_metadata?.must_change_password);
    const isStaff = isStaffUser(signedIn.user);
    if (mustChange) {
      router.push(isStaff ? "/admin/setup" : "/portal/setup");
      return;
    }
    // Staff accounts work here too, but their home is the back office.
    router.push(isStaff ? "/admin" : "/portal");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
        <div className="flex justify-center">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={180} height={104} priority />
        </div>
        <h1 className="mt-6 text-center font-heading text-xl font-bold text-navy">
          Member Portal Sign In
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          For invited AACC-USA members and state ambassadors.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <ForgotPassword />
        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          Membership is by invitation. Not a member yet?{" "}
          <a href="/en/membership" className="font-semibold text-green-600 hover:underline">
            Apply to join
          </a>{" "}
          and the chamber team will send your invitation.
        </p>
      </div>
    </main>
  );
}
