"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import Logo from "./Logo";
import type { Locale, Dictionary } from "@/lib/i18n";

type NavDict = Dictionary["nav"];

type NavGroup = {
  label: string;
  items: { href: string; label: string }[];
};

export default function Header({ locale, nav }: { locale: Locale; nav: NavDict }) {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const p = (href: string) => `/${locale}${href}`;

  const groups: NavGroup[] = [
    {
      label: nav.about,
      items: [
        { href: "/about", label: nav.aboutUs },
        { href: "/diaspora", label: nav.diaspora },
        { href: "/advocacy", label: nav.advocacy },
      ],
    },
    {
      label: nav.membership,
      items: [
        { href: "/membership", label: nav.membershipOverview },
        { href: "/sponsors", label: nav.sponsors },
      ],
    },
    {
      label: nav.business,
      items: [
        { href: "/directory", label: nav.directory },
        { href: "/programs", label: nav.programs },
        { href: "/events", label: nav.events },
      ],
    },
  ];

  const singles = [
    { href: "/news", label: nav.news },
    { href: "/contact", label: nav.contact },
  ];

  const otherLocale = locale === "en" ? "ar" : "en";
  const switchedPath = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${otherLocale}`);

  // Close dropdowns when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const isActive = (href: string) => pathname.startsWith(p(href));

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="tricolor-bar h-1" aria-hidden="true" />
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo locale={locale} />

        <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {groups.map((group) => {
            const groupActive = group.items.some((item) => isActive(item.href));
            const isOpen = openGroup === group.label;
            return (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  aria-expanded={isOpen}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    groupActive
                      ? "font-semibold text-navy"
                      : "text-muted hover:bg-surface hover:text-navy"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="absolute start-0 top-full z-50 mt-1 w-60 rounded-xl border border-navy-100 bg-white p-2 shadow-card-hover">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={p(item.href)}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? "bg-surface font-semibold text-navy"
                            : "text-ink hover:bg-surface hover:text-navy"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {singles.map((item) => (
            <Link
              key={item.href}
              href={p(item.href)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "font-semibold text-navy"
                  : "text-muted hover:bg-surface hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={switchedPath}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold-600"
            aria-label={nav.languageName}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            {nav.languageName}
          </Link>
          <Link
            href={p("/membership")}
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-green-500 hover:to-green-400 hover:shadow-glow-green"
          >
            {nav.join}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-navy lg:hidden"
          aria-expanded={open}
          aria-label={open ? nav.closeMenu : nav.openMenu}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="max-h-[calc(100vh-80px)] overflow-y-auto border-t border-navy-100 bg-white px-4 pb-8 pt-2 lg:hidden"
          aria-label="Mobile navigation"
        >
          {groups.map((group) => (
            <div key={group.label} className="border-b border-navy-50 py-2">
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={p(item.href)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-base font-medium text-navy hover:bg-surface"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="py-2">
            {singles.map((item) => (
              <Link
                key={item.href}
                href={p(item.href)}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-base font-medium text-navy hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <Link
              href={p("/membership")}
              onClick={() => setOpen(false)}
              className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {nav.join}
            </Link>
            <Link
              href={switchedPath}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-200 px-4 py-3 text-center text-sm font-semibold text-navy"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              {nav.languageName}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
