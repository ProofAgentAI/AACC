import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

export default function Logo({
  locale = "en",
  variant = "dark",
  compact = false,
}: {
  locale?: Locale;
  variant?: "dark" | "light";
  compact?: boolean;
}) {
  const img = (
    <Image
      src="/aacc-logo.png"
      alt="AACC — Algerian American Chamber of Commerce"
      width={580}
      height={335}
      priority
      className={compact ? "h-10 w-auto" : "h-14 w-auto"}
    />
  );

  return (
    <Link
      href={`/${locale}`}
      className="group flex items-center gap-3"
      aria-label="AACC-USA home"
    >
      {variant === "light" ? (
        <span className="inline-block rounded-xl bg-white px-3 py-2 shadow-card transition-transform group-hover:scale-[1.03]">
          {img}
        </span>
      ) : (
        <span className="transition-transform group-hover:scale-[1.03]">{img}</span>
      )}
      <span className="flex flex-col leading-tight">
        <span
          className={`font-heading font-extrabold tracking-tight ${
            variant === "light" ? "text-white" : "text-navy"
          } ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}
        >
          AACC<span className="text-gold">-</span>USA
        </span>
        <span
          className={`max-w-[150px] text-[8px] font-medium uppercase tracking-[0.1em] sm:max-w-none sm:text-[9px] sm:tracking-[0.14em] ${
            variant === "light" ? "text-navy-200" : "text-muted"
          }`}
        >
          Algerian American Chamber of Commerce
        </span>
      </span>
    </Link>
  );
}
