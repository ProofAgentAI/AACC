import Link from "next/link";
import { Linkedin, Facebook, Instagram, Mail, ExternalLink } from "lucide-react";
import Logo from "./Logo";
import NewsletterSignup from "./NewsletterSignup";
import type { Locale, Dictionary } from "@/lib/i18n";

const officialLinks = [
  { key: "embassy" as const, url: "https://embwashington.mfa.gov.dz/en" },
  { key: "consulate" as const, url: "https://www.algeria-cgny.org/" },
  { key: "mfa" as const, url: "https://www.mfa.gov.dz/" },
];

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const nav = dict.nav;
  const p = (href: string) => `/${locale}${href}`;

  const organization = [
    { href: p("/about"), label: nav.aboutUs },
    { href: p("/membership"), label: nav.membership },
    { href: p("/programs"), label: nav.programs },
    { href: p("/events"), label: nav.events },
    { href: p("/advocacy"), label: nav.advocacy },
    { href: p("/diaspora"), label: nav.diaspora },
  ];

  const resources = [
    { href: p("/directory"), label: nav.directory },
    { href: p("/news"), label: nav.news },
    { href: p("/sponsors"), label: f.sponsorship },
    { href: p("/contact"), label: nav.contact },
    { href: "#newsletter", label: f.newsletter },
    { href: "/portal", label: f.memberPortal },
    { href: "/admin", label: f.admin },
  ];

  return (
    <footer className="relative bg-navy text-navy-100">
      <div className="tricolor-bar h-1" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div id="newsletter" className="glass-dark mb-14 rounded-2xl p-8 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">{f.newsletterTitle}</h2>
              <p className="mt-2 text-sm text-navy-200">{f.newsletterText}</p>
            </div>
            <NewsletterSignup
              locale={locale}
              placeholder={f.emailPlaceholder}
              buttonLabel={f.subscribe}
              thanksMessage={f.newsletterThanks}
            />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo locale={locale} variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-200">{f.tagline}</p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.linkedin.com"
                aria-label="LinkedIn"
                className="rounded-md bg-navy-600 p-2 text-navy-100 transition-colors hover:bg-gold hover:text-navy"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com"
                aria-label="Facebook"
                className="rounded-md bg-navy-600 p-2 text-navy-100 transition-colors hover:bg-gold hover:text-navy"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com"
                aria-label="Instagram"
                className="rounded-md bg-navy-600 p-2 text-navy-100 transition-colors hover:bg-gold hover:text-navy"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-6">
              <a
                href="mailto:contact@aacc-usa.org"
                className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-gold" />
                contact@aacc-usa.org
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {f.organization}
            </h3>
            <ul className="mt-4 space-y-3">
              {organization.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-200 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {f.resources}
            </h3>
            <ul className="mt-4 space-y-3">
              {resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-200 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              {f.officialLinks}
            </h3>
            <ul className="mt-4 space-y-3">
              {officialLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm text-navy-200 transition-colors hover:text-white"
                  >
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                    {f[link.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-navy-600 pt-8">
          <p className="text-xs text-navy-300">{f.legal}</p>
          <p className="mt-2 text-xs text-navy-300">{f.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
