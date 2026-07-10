const colors = ["text-green-600", "text-navy", "text-red-600", "text-gold-600"];

export default function StatsSection({
  stats,
}: {
  stats: { value: string; suffix: string; label: string }[];
}) {
  return (
    <section className="border-b border-navy-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="px-6 py-10 text-center">
            <p className={`font-heading text-4xl font-extrabold sm:text-5xl ${colors[index % colors.length]}`}>
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
