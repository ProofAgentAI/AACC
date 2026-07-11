"use client";

import { useState } from "react";

// "Forgot password?" block shared by the back-office and portal sign-in pages.
// Posts to /api/auth/reset, which emails a one-time link from contact@aacc-usa.org.
export default function ForgotPassword() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("resetEmail") ?? "").trim();
    if (!email) return;
    setError("");
    setSending(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSending(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not send the reset email. Try again.");
      return;
    }
    setSent(true);
  }

  if (!open) {
    return (
      <p className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Forgot password?
        </button>
      </p>
    );
  }

  if (sent) {
    return (
      <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-700">
        If an account exists for that email, a reset link from contact@aacc-usa.org is on its
        way. The link works once and expires in 60 minutes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-navy-100 bg-surface p-4">
      <label htmlFor="resetEmail" className="mb-1.5 block text-sm font-semibold text-navy">
        Email for the reset link
      </label>
      <div className="flex gap-2">
        <input
          id="resetEmail"
          name="resetEmail"
          type="email"
          required
          autoComplete="email"
          className="min-w-0 flex-1 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
        />
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Link"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
