import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  assetUrl,
  type BlogPost,
  type Faq,
  type Project,
  type Section,
  type Service,
  type TeamMember,
  type Testimonial
} from "../../lib/api";

export function PageHero({
  title,
  subtitle,
  eyebrow
}: {
  title: string;
  subtitle?: string | null;
  eyebrow?: string;
}) {
  return (
    <section className="page-hero">
      <div className="container rr-container-1650">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}

/**
 * Renders CMS body text as discrete paragraphs instead of one giant <p>.
 * Splits on blank lines (or single newlines) so authored multi-paragraph
 * content gains real structure — better readability and AEO extraction.
 * Falls back to a single paragraph for unbroken prose.
 */
export function Prose({ text, className = "detail-copy" }: { text?: string | null; className?: string }) {
  const paragraphs = (text ?? "")
    .split(/\n{2,}|\r\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!paragraphs.length) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p className={className} key={`${index}-${paragraph.slice(0, 24)}`}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

export function HomeHero({ section }: { section?: Section }) {
  const content = section?.content ?? {};
  const primary = content.primaryCta ?? { label: "View portfolio", href: "/portfolio" };
  const secondary = content.secondaryCta ?? { label: "Get a development quote", href: "/contact" };

  return (
    <section className="container hero">
      <div>
        <p className="eyebrow">{content.eyebrow ?? "Wyoming-formed software development company"}</p>
        <h1>{section?.title ?? "Custom websites, SaaS platforms and business software development"}</h1>
        <p>
          {section?.subtitle ??
            "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations."}
        </p>
        <div className="hero-actions">
          <Link className="btn accent" href={primary.href ?? "/portfolio"}>
            {primary.label ?? "Request a Quote"} <ArrowRight size={18} />
          </Link>
          <Link className="btn secondary" href={secondary.href ?? "/contact"}>
            {secondary.label ?? "Book a Consultation"}
          </Link>
        </div>
      </div>
      <div className="hero-media">
        <img src={assetUrl(content.image)} alt={section?.title ?? "Opplexify hero"} decoding="async" fetchPriority="high" sizes="(max-width: 760px) 100vw, 48vw" />
      </div>
    </section>
  );
}

export function SectionHead({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {href ? (
        <Link className="btn secondary" href={href}>
          View all <ArrowRight size={18} />
        </Link>
      ) : null}
    </div>
  );
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid">
      {services.map((service) => (
        <Link className="card" href={`/services/${service.slug}`} key={service.id}>
          <div>
            {service.icon ? <img src={assetUrl(service.icon)} alt="" width={42} height={42} loading="lazy" decoding="async" /> : null}
            <h3>{service.title}</h3>
          </div>
          <p>{service.shortDescription}</p>
          <span>
            Explore <ArrowRight size={15} />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid">
      {projects.map((project) => (
        <Link className="card" href={`/work/${project.slug}`} key={project.id}>
          <div className="card-media">
            <img src={assetUrl(project.mainImage)} alt={project.title} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 33vw" />
          </div>
          <div>
            <p className="eyebrow">{project.category?.name ?? project.client ?? "Project"}</p>
            <h3>{project.title}</h3>
          </div>
          <p>{project.shortDescription}</p>
        </Link>
      ))}
    </div>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid">
      {posts.map((post) => (
        <Link className="card" href={`/blog/${post.slug}`} key={post.id}>
          <div className="card-media">
            <img src={assetUrl(post.featuredImage)} alt={post.title} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 33vw" />
          </div>
          <p className="eyebrow">{post.category?.name ?? "Journal"}</p>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </Link>
      ))}
    </div>
  );
}

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="grid team-grid">
      {team.map((member) => (
        <Link className="card" href={`/team/${member.slug}`} key={member.id}>
          <div className="card-media">
            <img src={assetUrl(member.image)} alt={member.name} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 33vw" />
          </div>
          <h3>{member.name}</h3>
          <p>{member.role}</p>
        </Link>
      ))}
    </div>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid">
      {testimonials.map((item) => (
        <article className="card" key={item.id}>
          <p>{item.reviewText}</p>
          <div>
            <h3>{item.clientName}</h3>
            <p>
              {item.position} {item.company ? `at ${item.company}` : ""}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="faq-list">
      {faqs.map((faq) => (
        <article className="faq-item" key={faq.id}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </article>
      ))}
    </div>
  );
}

function recordItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function stringItems(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections
        .filter((section) => section.type !== "hero")
        .map((section) => {
          const content = section.content ?? {};
          const stats = recordItems(content.items);
          const cta = content.cta ?? {};
          if (section.type === "stats" && stats.length) {
            return (
              <section className="section" key={section.id}>
                <div className="container stats">
                  {stats.map((item) => (
                    <div className="stat" key={String(item.label)}>
                      <strong>{String(item.value ?? "")}</strong>
                      <span>{String(item.label ?? "")}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === "pricing" && stats.length) {
            return (
              <section className="section" key={section.id}>
                <div className="container rr-container-1650">
                  <SectionHead title={section.title ?? "Pricing"} subtitle={section.subtitle ?? undefined} />
                  <div className="grid">
                    {stats.map((item, index) => (
                      <article className="card" key={`${item.title}-${index}`}>
                        <p className="eyebrow">{String(item.label ?? "")}</p>
                        <h3>{String(item.title ?? "Package")}</h3>
                        <p>{String(item.description ?? "")}</p>
                        <strong>{String(item.price ?? "")}</strong>
                        <ul>
                          {stringItems(item.features).map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                        {item.href ? (
                          <Link className="btn secondary" href={String(item.href)}>
                            {String(item.ctaLabel ?? "Request Package")}
                          </Link>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (section.type === "capability-list" && stats.length) {
            return (
              <section className="section" key={section.id}>
                <div className="container rr-container-1650">
                  <SectionHead title={section.title ?? "Capabilities"} subtitle={section.subtitle ?? undefined} />
                  <div className="grid">
                    {stats.map((item, index) => (
                      <article className="card" key={`${item.category}-${index}`}>
                        <p className="eyebrow">{String(item.category ?? `0${index + 1}`)}</p>
                        <h3>{String(item.text ?? item.title ?? "")}</h3>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (section.type === "logo-strip" && recordItems(content.logos).length) {
            return (
              <section className="section" key={section.id}>
                <div className="container rr-container-1650">
                  <SectionHead title={section.title ?? "Partners"} subtitle={section.subtitle ?? undefined} />
                  <div className="logo-strip-grid">
                    {recordItems(content.logos).map((logo, index) => (
                      <img src={assetUrl(String(logo.image ?? logo.lightImage ?? ""))} alt={String(logo.alt ?? `Logo ${index + 1}`)} key={`${logo.image}-${index}`} loading="lazy" decoding="async" />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (section.type === "contact-info") {
            return (
              <section className="section" key={section.id}>
                <div className="container rr-container-1650">
                  <SectionHead title={section.title ?? "Contact"} subtitle={section.subtitle ?? undefined} />
                  <div className="grid">
                    {["email", "phone", "address"].map((key) =>
                      content[key] ? (
                        <article className="card" key={key}>
                          <p className="eyebrow">{key}</p>
                          <h3>{String(content[key])}</h3>
                        </article>
                      ) : null
                    )}
                  </div>
                </div>
              </section>
            );
          }

          if (["rich-text", "text-media", "services", "projects", "portfolio", "blog", "team", "faq", "contact"].includes(section.type)) {
            const paragraphs = stringItems(content.paragraphs).length ? stringItems(content.paragraphs) : content.body ? [String(content.body)] : [];
            return (
              <section className="section" key={section.id}>
                <div className="container rich-block">
                  <div>
                    <SectionHead title={section.title ?? "About"} subtitle={section.subtitle ?? undefined} />
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {cta.href ? (
                      <Link className="btn secondary" href={cta.href ?? "/"}>
                        {cta.label ?? "Learn more"}
                      </Link>
                    ) : null}
                  </div>
                  {content.image ? (
                    <img src={assetUrl(content.image)} alt={section.title ?? "Opplexify"} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 44vw" />
                  ) : null}
                </div>
              </section>
            );
          }

          return (
            <section className="section" key={section.id}>
              <div className="container rr-container-1650">
                <SectionHead title={section.title ?? section.key} subtitle={section.subtitle ?? undefined} />
              </div>
            </section>
          );
        })}
    </>
  );
}
