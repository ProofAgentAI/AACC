// Renders a team member bio. Bios are authored as HTML in the admin Team tab
// (styled with the same .article-content rules as news articles, so the look
// stays consistent). Plain-text bios with blank-line paragraphs still work.
export default function BioHtml({ text }: { text: string }) {
  const isHtml = /<[a-z][^>]*>/i.test(text);
  if (isHtml) {
    return <div className="article-content" dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return (
    <div className="space-y-4">
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="text-sm leading-relaxed text-ink sm:text-base"
          >
            {paragraph}
          </p>
        ))}
    </div>
  );
}
