"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import BoardApplicationForm from "./BoardApplicationForm";
import type { Locale, Dictionary } from "@/lib/i18n";

export default function BoardApplyModal({
  locale,
  dict,
  formDict,
  buttonLabel,
}: {
  locale: Locale;
  dict: Dictionary["about"]["board"];
  formDict: Dictionary["form"];
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // Lock page scroll and close on Escape while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow-green transition-all hover:from-green-500 hover:to-green-400"
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={dict.title}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute end-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-600">
              {dict.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
              {dict.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{dict.description}</p>
            <div className="mt-8">
              <BoardApplicationForm locale={locale} dict={dict} formDict={formDict} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
