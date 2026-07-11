import PageHero from "./PageHero";

type LegalContent = {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

export default function LegalPage({ content }: { content: LegalContent }) {
  return (
    <>
      <PageHero
        eyebrow="AACC-USA"
        title={content.title}
        description={content.updated}
        image="/images/hero-bridge.jpg"
      />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-base leading-relaxed text-ink">{content.intro}</p>
          <div className="mt-10 space-y-8">
            {content.sections.map((section, index) => (
              <div key={section.heading}>
                <h2 className="font-heading text-lg font-bold text-navy">
                  {index + 1}. {section.heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
