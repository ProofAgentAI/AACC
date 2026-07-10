const placeholders = [
  "Corporate Partner",
  "Airline Partner",
  "Banking Partner",
  "University Partner",
  "Legal Partner",
  "Consulting Partner",
];

export default function LogoCloud({ title = "Founding partners and sponsors" }: { title?: string }) {
  return (
    <div>
      <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {placeholders.map((name) => (
          <div
            key={name}
            className="flex h-20 items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {name}
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Your organization could be here.{" "}
        <a href="/sponsors" className="font-semibold text-green-600 hover:text-green-700">
          Become a founding sponsor →
        </a>
      </p>
    </div>
  );
}
