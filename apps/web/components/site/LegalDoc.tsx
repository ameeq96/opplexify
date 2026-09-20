import { BUSINESS_EMAIL, LEGAL_NAME } from "../../lib/seo";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption: string; headers: string[]; rows: string[][] };

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
  if (block.type === "table") {
    return (
      <div className="legal-table-wrap" key={index}>
        <table>
          <caption>{block.caption}</caption>
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th scope="col" key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join("|")}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={`${cellIndex}-${cell}`}>{cell}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          General website questions about this document may be sent to {LEGAL_NAME} at{" "}
          <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>. For an engagement-specific question, use the
          contact details supplied by the provider named on your quotation or invoice.
        </p>
      </div>
    </section>
  );
}
