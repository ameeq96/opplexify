export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

function renderBlock(block: LegalBlock, index: number) {
  if (block.type === "subheading") {
    return <h3 key={index}>{block.text}</h3>;
  }
  if (block.type === "list") {
    return (
      <ul key={index}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p key={index}>{block.text}</p>;
}

export function LegalDoc({
  lastUpdated,
  intro,
  sections
}: {
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <section className="section">
      <div className="container rich-block legal-doc">
        <p className="legal-updated">Last updated: {lastUpdated}</p>
        {intro ? <p>{intro}</p> : null}
        {sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.blocks.map((block, index) => renderBlock(block, index))}
          </div>
        ))}
        <p>
          Questions about this document? Email us at{" "}
          <a href="mailto:admin@opplexify.com">admin@opplexify.com</a>.
        </p>
      </div>
    </section>
  );
}
