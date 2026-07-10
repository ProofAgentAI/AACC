"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/membership", label: "Membership" },
  { href: "/directory", label: "Directory" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/advocacy", label: "Advocacy" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-navy font-semibold"
                    : "text-muted hover:text-navy hover:bg-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link
            href="/sponsors"
            className="whitespace-nowrap rounded-lg border border-navy-200 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-600"
          >
            Sponsor
          </Link>
          <Link
            href="/membership"
            className="whitespace-nowrap rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-600"
          >
            Join AACC-USA
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-navy xl:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-navy-100 bg-white px-4 pb-6 pt-2 xl:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-medium text-navy hover:bg-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/membership"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-navy px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Join AACC-USA
            </Link>
            <Link
              href="/sponsors"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-navy-200 px-4 py-3 text-center text-sm font-semibold text-navy"
            >
              Sponsor
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
