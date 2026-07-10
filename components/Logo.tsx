import Link from "next/link";

function BridgeMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bridge arc spanning two shores */}
      <path
        d="M4 34 C12 14, 36 14, 44 34"
        stroke="#C9A227"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Bridge deck */}
      <path d="M4 34 H44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Suspension lines */}
      <path d="M12 34 V25.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 34 V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 34 V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 34 V25.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Two stars — Algeria and the U.S. */}
      <path
        d="M9 12.5 L9.9 14.4 L12 14.7 L10.5 16.1 L10.85 18.2 L9 17.2 L7.15 18.2 L7.5 16.1 L6 14.7 L8.1 14.4 Z"
        fill="#007A3D"
      />
      <path
        d="M39 12.5 L39.9 14.4 L42 14.7 L40.5 16.1 L40.85 18.2 L39 17.2 L37.15 18.2 L37.5 16.1 L36 14.7 L38.1 14.4 Z"
        fill="#D71920"
      />
    </svg>
  );
}

export default function Logo({
  variant = "dark",
  compact = false,
}: {
  variant?: "dark" | "light";
  compact?: boolean;
}) {
  const textColor = variant === "light" ? "text-white" : "text-navy";
  const subColor = variant === "light" ? "text-navy-200" : "text-muted";

  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="AACC-USA home">
      <span className={`${textColor} transition-transform group-hover:scale-105`}>
        <BridgeMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-heading font-extrabold tracking-tight ${textColor} ${compact ? "text-lg" : "text-xl"}`}>
          AACC<span className="text-gold">-</span>USA
        </span>
        {!compact && (
          <span className={`text-[10px] font-medium uppercase tracking-[0.14em] ${subColor}`}>
            Algerian American Chamber of Commerce
          </span>
        )}
      </span>
    </Link>
  );
}

export { BridgeMark };
