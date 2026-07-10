const stats = [
  { value: "12+", label: "U.S. States Represented" },
  { value: "50+", label: "Founding Members Target" },
  { value: "20+", label: "Business Sectors" },
  { value: "2", label: "Countries Connected" },
];

export default function StatsSection() {
  return (
    <section className="border-y border-navy-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="px-6 py-10 text-center">
            <p className="font-heading text-4xl font-extrabold text-navy">
              {stat.value.replace("+", "")}
              {stat.value.includes("+") && <span className="text-gold">+</span>}
            </p>
            <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
