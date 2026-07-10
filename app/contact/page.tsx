import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { Mail, Linkedin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Membership, Sponsorship & Partnership Inquiries",
  description:
    "Contact AACC-USA for membership, sponsorship, partnership, business directory, event, or media inquiries. Reach us at info@aaccusa.org.",
};

const contacts = [
  {
    label: "General Inquiries",
    email: "info@aaccusa.org",
  },
  {
    label: "Membership",
    email: "membership@aaccusa.org",
  },
  {
    label: "Sponsorship",
    email: "sponsorship@aaccusa.org",
  },
];

const validInquiries = new Set([
  "membership",
  "sponsorship",
  "partnership",
  "directory",
  "event",
  "media",
  "general",
]);

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const params = await searchParams;
  const inquiry =
    params.inquiry && validInquiries.has(params.inquiry) ? params.inquiry : "";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Build the Bridge Together"
        description="Whether you're exploring membership, sponsorship, a partnership, or a story — the AACC-USA team wants to hear from you."
      />

      <section className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6">
              {contacts.map((contact) => (
                <div
                  key={contact.email}
                  className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {contact.label}
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-2 inline-flex items-center gap-2 font-semibold text-navy transition-colors hover:text-green-600"
                  >
                    <Mail className="h-4 w-4 text-gold-600" aria-hidden="true" />
                    {contact.email}
                  </a>
                </div>
              ))}
              <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Connect
                </p>
                <a
                  href="https://www.linkedin.com"
                  className="mt-2 inline-flex items-center gap-2 font-semibold text-navy transition-colors hover:text-green-600"
                >
                  <Linkedin className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  Algerian American Chamber of Commerce
                </a>
              </div>
              <div className="rounded-2xl bg-navy p-6 text-white">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Response Time
                </p>
                <p className="mt-2 text-sm leading-relaxed text-navy-100">
                  We aim to respond to all inquiries within 2–3 business days. Founding member and
                  sponsor inquiries are prioritized.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
                <h2 className="font-heading text-2xl font-bold text-navy">Send Us a Message</h2>
                <p className="mt-2 text-sm text-muted">
                  Fields marked with * are required.
                </p>
                <div className="mt-8">
                  <ContactForm defaultInquiry={inquiry} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
