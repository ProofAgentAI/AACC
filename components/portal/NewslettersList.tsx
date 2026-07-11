"use client";

import { useCallback, useEffect, useState } from "react";
import { MailOpen, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Section = {
  title?: string;
  date?: string;
  html?: string;
  description?: string;
  url?: string;
  image?: string;
};

type Newsletter = {
  id: string;
  subject: string;
  headline: string | null;
  intro: string | null;
  main_image: string | null;
  main_image_credit: string | null;
  items: Section[];
  sent_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewslettersList({ onNotice }: { onNotice: (msg: string) => void }) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Newsletter | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletters")
      .select("id, subject, headline, intro, main_image, main_image_credit, items, sent_at")
      .eq("status", "sent")
      .order("sent_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load newsletters: ${error.message}`);
      return;
    }
    setNewsletters((data as Newsletter[]) ?? []);
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading newsletters...</p>;
  }

  if (newsletters.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-muted">
        No newsletters have been sent yet. Past editions will be archived here.
      </p>
    );
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {newsletters.map((newsletter) => (
          <button
            key={newsletter.id}
            type="button"
            onClick={() => setOpen(newsletter)}
            className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 text-start shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <MailOpen className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-heading text-base font-bold leading-snug text-navy">
              {newsletter.headline || newsletter.subject}
            </h3>
            <p className="mt-1 text-xs font-semibold text-muted">
              {formatDate(newsletter.sent_at)} · {newsletter.items.length} section
              {newsletter.items.length === 1 ? "" : "s"}
            </p>
            {newsletter.intro && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                {newsletter.intro}
              </p>
            )}
            <span className="mt-3 text-sm font-semibold text-green-600">Read edition</span>
          </button>
        ))}
      </div>

      {/* Edition reader */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Newsletter edition"
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setOpen(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-navy-900 px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                {formatDate(open.sent_at)}
              </p>
              <h2 className="mt-1 pe-8 font-heading text-xl font-bold text-white">
                {open.headline || open.subject}
              </h2>
            </div>
            <div className="p-8">
              {open.main_image && (
                <figure className="mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={open.main_image}
                    alt=""
                    className="max-h-72 w-full rounded-xl object-cover"
                  />
                  {open.main_image_credit && (
                    <figcaption className="mt-1 text-xs italic text-muted">
                      Photo: {open.main_image_credit}
                    </figcaption>
                  )}
                </figure>
              )}
              {open.intro && (
                <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {open.intro}
                </p>
              )}
              <div className="space-y-6">
                {open.items.map((section, index) => (
                  <section
                    key={index}
                    className="overflow-hidden rounded-xl border border-navy-100"
                  >
                    {section.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={section.image}
                        alt=""
                        className="max-h-56 w-full object-cover"
                      />
                    )}
                    <div className="p-5">
                      {section.date && (
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                          {section.date}
                        </p>
                      )}
                      {section.title && (
                        <h3 className="mt-1 font-heading text-base font-bold text-navy">
                          {section.title}
                        </h3>
                      )}
                      {section.html ? (
                        <div
                          className="prose prose-sm mt-2 max-w-none text-ink"
                          dangerouslySetInnerHTML={{ __html: section.html }}
                        />
                      ) : section.description ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                          {section.description}
                        </p>
                      ) : null}
                      {section.url && (
                        <a
                          href={section.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm font-semibold text-green-600 hover:underline"
                        >
                          Read more →
                        </a>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
