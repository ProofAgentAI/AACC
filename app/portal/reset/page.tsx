"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    const res = await fetch("/api/auth/reset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not reset the password. Request a new link.");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <p className="mt-4 text-center text-sm text-muted">
        This reset link is incomplete. Use the link from your email, or request a new one from
        the{" "}
        <a href="/portal/login" className="font-semibold text-green-600 hover:underline">
          sign-in page
        </a>
        .
      </p>
    );
  }

  if (done) {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-ink">
          Your password has been updated. Sign in with your new password.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href="/portal/login"
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
          >
            Member Portal Sign In
          </a>
          <a
            href="/admin/login"
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface"
          >
            Back Office Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="mt-2 text-center text-sm text-muted">Choose a new password.</p>
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
          {saving ? "Saving..." : "Set New Password"}
        </button>
      </form>
    </>
  );
}

export default function PasswordResetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
        <div className="flex justify-center">
          <Image src="/aacc-logo.png" alt="AACC-USA" width={180} height={104} priority />
        </div>
        <h1 className="mt-6 text-center font-heading text-xl font-bold text-navy">
          Reset Your Password
        </h1>
        <Suspense fallback={<p className="mt-4 text-center text-sm text-muted">Loading...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
