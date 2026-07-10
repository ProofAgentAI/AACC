"use client";

import { useState } from "react";
import { supabase, DUPLICATE_KEY_CODE } from "@/lib/supabase";

export default function NewsletterSignup({
  locale = "en",
  placeholder = "Your email address",
  buttonLabel = "Subscribe",
  thanksMessage = "Thank you for subscribing. Welcome to the AACC-USA network.",
}: {
  locale?: string;
  placeholder?: string;
  buttonLabel?: string;
  thanksMessage?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  if (status === "done") {
    return (
      <p className="rounded-lg bg-green/20 px-4 py-3 text-sm font-medium text-white" role="status">
        {thanksMessage}
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");

    if (supabase) {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: email.trim().toLowerCase(),
        locale,
      });
      // A duplicate signup still reads as success to the subscriber.
      if (error && error.code !== DUPLICATE_KEY_CODE) {
        setStatus("idle");
        return;
      }
    }
    setStatus("done");
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">
        {placeholder}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-500 bg-navy-800 px-4 py-3 text-sm text-white placeholder:text-navy-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="shrink-0 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
