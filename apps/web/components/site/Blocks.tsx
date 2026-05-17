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
      <div className="container">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}

export function HomeHero({ section }: { section?: Section }) {
  const content = section?.content ?? {};
  const primary = content.primaryCta ?? { label: "View portfolio", href: "/portfolio" };
  const secondary = content.secondaryCta ?? { label: "Get a development quote", href: "/contact" };

  return (
    <section className="container hero">
      <div>
        <p className="eyebrow">{content.eyebrow ?? "Full-stack web development agency"}</p>
        <h1>{section?.title ?? "Websites, SaaS apps and dashboards built to grow"}</h1>
        <p>
          {section?.subtitle ??
            "Opplexify builds SEO-friendly websites, Next.js web applications, SaaS platforms, mobile apps, admin dashboards, and backend systems."}
        </p>
        <div className="hero-actions">
          <Link className="btn accent" href={primary.href ?? "/portfolio"}>
            {primary.label ?? "View portfolio"} <ArrowRight size={18} />
          </Link>
          <Link className="btn secondary" href={secondary.href ?? "/contact"}>
            {secondary.label ?? "Start a project"}
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
  const visibleTeam = team.slice(0, 3);

  return (
    <div className="grid team-grid">
      {visibleTeam.map((member) => (
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

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections
        .filter((section) => section.type !== "hero")
        .map((section) => {
          const content = section.content ?? {};
          const stats = recordItems(content.items);
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

          if (section.type === "rich-text") {
            return (
              <section className="section" key={section.id}>
                <div className="container rich-block">
                  <div>
                    <SectionHead title={section.title ?? "About"} subtitle={section.subtitle ?? undefined} />
                    <p>{content.body}</p>
                  </div>
                  <img src={assetUrl(content.image)} alt={section.title ?? "Opplexify"} loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 44vw" />
                </div>
              </section>
            );
          }

          return (
            <section className="section" key={section.id}>
              <div className="container">
                <SectionHead title={section.title ?? section.key} subtitle={section.subtitle ?? undefined} />
              </div>
            </section>
          );
        })}
    </>
  );
}
