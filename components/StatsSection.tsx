const stats = [
  { value: "12", suffix: "+", label: "U.S. States Represented", color: "text-green-600" },
  { value: "50", suffix: "+", label: "Founding Members Target", color: "text-navy" },
  { value: "20", suffix: "+", label: "Business Sectors", color: "text-red-600" },
  { value: "2", suffix: "", label: "Countries Connected", color: "text-gold-600" },
];

export default function StatsSection() {
  return (
    <section className="relative border-b border-navy-100 bg-white">
      <div className="absolute inset-0 bg-grid-navy" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="px-6 py-10 text-center">
            <p className={`font-heading text-4xl font-extrabold sm:text-5xl ${stat.color}`}>
              {stat.value}
              {stat.suffix && <span className="text-gold">{stat.suffix}</span>}
            </p>
            <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
