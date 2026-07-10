import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { Mail, Linkedin, Clock } from "lucide-react";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : "en");
  return { title: dict.contact.hero.title, description: dict.contact.hero.description };
}

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
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const c = dict.contact;

  const sp = await searchParams;
  const inquiry = sp.inquiry && validInquiries.has(sp.inquiry) ? sp.inquiry : "";

  const contacts = [
    { label: c.general, email: "info@aacc-usa.org" },
    { label: c.membershipLabel, email: "membership@aacc-usa.org" },
    { label: c.sponsorshipLabel, email: "sponsorship@aacc-usa.org" },
  ];

  return (
    <>
      <PageHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        description={c.hero.description}
        image="/images/hero-monuments.jpg"
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
                  {c.connect}
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
                  {c.responseTime}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-navy-100">{c.responseText}</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-card sm:p-10">
                <h2 className="font-heading text-2xl font-bold text-navy">{c.formTitle}</h2>
                <p className="mt-2 text-sm text-muted">{c.formNote}</p>
                <div className="mt-8">
                  <ContactForm dict={dict.form} defaultInquiry={inquiry} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
