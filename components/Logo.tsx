import Link from "next/link";
import Image from "next/image";

export default function Logo({
  variant = "dark",
  compact = false,
}: {
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
    <Link href="/" className="flex items-center gap-3 group" aria-label="AACC-USA home">
      {variant === "light" ? (
        <span className="inline-block rounded-xl bg-white px-3 py-2 shadow-card transition-transform group-hover:scale-[1.03]">
          {img}
        </span>
      ) : (
        <span className="transition-transform group-hover:scale-[1.03]">{img}</span>
      )}
      <span className="hidden flex-col leading-tight sm:flex">
        <span
          className={`font-heading font-extrabold tracking-tight ${
            variant === "light" ? "text-white" : "text-navy"
          } ${compact ? "text-base" : "text-lg"}`}
        >
          AACC<span className="text-gold">-</span>USA
        </span>
        <span
          className={`text-[9px] font-medium uppercase tracking-[0.14em] ${
            variant === "light" ? "text-navy-200" : "text-muted"
          }`}
        >
          Algerian American Chamber of Commerce
        </span>
      </span>
    </Link>
  );
}
