"use client";

import { useState } from "react";
import { Facebook, Linkedin, Link2, Check, Twitter, MessageCircle } from "lucide-react";

export default function ShareBar({ title, label }: { title: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function currentUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the link is in the address bar.
    }
  }

  const buttonClasses =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-muted">{label}</span>
      <button
        type="button"
        onClick={() =>
          open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`)
        }
        className={buttonClasses}
        aria-label="Share on Facebook"
        title="Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() =>
          open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl())}&text=${encodeURIComponent(title)}`
          )
        }
        className={buttonClasses}
        aria-label="Share on X"
        title="X (Twitter)"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() =>
          open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl())}`
          )
        }
        className={buttonClasses}
        aria-label="Share on LinkedIn"
        title="LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() =>
          open(`https://wa.me/?text=${encodeURIComponent(`${title} ${currentUrl()}`)}`)
        }
        className={buttonClasses}
        aria-label="Share on WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        className={buttonClasses}
        aria-label="Copy link (paste anywhere, including Instagram)"
        title="Copy link — paste anywhere, including Instagram"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
