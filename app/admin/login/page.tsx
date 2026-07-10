"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setError("Back office is not configured (missing Supabase environment variables).");
      return;
    }
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
    });
    setLoading(false);
    if (signInError) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
        <div className="flex justify-center">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={180} height={104} priority />
        </div>
        <h1 className="mt-6 text-center font-heading text-xl font-bold text-navy">
          Back Office Sign In
        </h1>
        <p className="mt-1 text-center text-sm text-muted">Staff access only.</p>
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
            className="w-full rounded-lg bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-600 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
