import Link from "next/link";
import { Linkedin, Facebook, Instagram, Mail } from "lucide-react";
import Logo from "./Logo";
import NewsletterSignup from "./NewsletterSignup";

const organization = [
  { href: "/about", label: "About" },
  { href: "/membership", label: "Membership" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/advocacy", label: "Advocacy" },
];

const resources = [
  { href: "/directory", label: "Business Directory" },
  { href: "/news", label: "News" },
  { href: "/sponsors", label: "Sponsorship" },
  { href: "/contact", label: "Contact" },
  { href: "#newsletter", label: "Newsletter" },
];

export default function Footer() {
  return (
    <footer className="relative bg-navy text-navy-100">
      <div className="tricolor-bar h-1" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-light" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div id="newsletter" className="glass-dark mb-14 rounded-2xl p-8 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">
                Stay Connected to the Bridge
              </h2>
              <p className="mt-2 text-sm text-navy-200">
                Chamber updates, market insights, and event invitations — straight to your inbox.
              </p>
            </div>
            <NewsletterSignup />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
              A U.S.-based nonprofit chamber-style association building the bridge between
              Algerian talent, trade, and opportunity.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.linkedin.com"
                aria-label="AACC-USA on LinkedIn"
                className="rounded-md bg-navy-600 p-2 text-navy-100 transition-colors hover:bg-gold hover:text-navy"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com"
                aria-label="AACC-USA on Facebook"
                className="rounded-md bg-navy-600 p-2 text-navy-100 transition-colors hover:bg-gold hover:text-navy"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com"
                aria-label="AACC-USA on Instagram"
                className="rounded-md bg-navy-600 p-2 text-navy-100 transition-colors hover:bg-gold hover:text-navy"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Organization
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
              Resources
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:info@aaccusa.org"
                  className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-gold" />
                  info@aaccusa.org
                </a>
              </li>
              <li>
                <a
                  href="mailto:membership@aaccusa.org"
                  className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-gold" />
                  membership@aaccusa.org
                </a>
              </li>
              <li>
                <a
                  href="mailto:sponsorship@aaccusa.org"
                  className="flex items-center gap-2 text-sm text-navy-200 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-gold" />
                  sponsorship@aaccusa.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-navy-600 pt-8">
          <p className="text-xs text-navy-300">
            © 2026 AACC-USA. Algerian American Chamber of Commerce USA. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-navy-300">
            AACC-USA is an independent U.S.-based nonprofit chamber-style association and is not a
            government agency.
          </p>
        </div>
      </div>
    </footer>
  );
}
