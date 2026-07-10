import Image from "next/image";

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-700 text-white">
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-navy-900/65 to-navy-800/55"
            aria-hidden="true"
          />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
            {eyebrow}
          </p>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-lg leading-relaxed text-navy-100">{description}</p>
          )}
        </div>
      </div>
      <div className="tricolor-bar relative h-1" aria-hidden="true" />
    </section>
  );
}
