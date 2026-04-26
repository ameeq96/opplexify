import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { portfolioProjects, type PortfolioProject } from "@/lib/data";
import { ProjectPreview } from "@/components/ProjectPreview";

type PortfolioGridProps = {
  limit?: number;
  projects?: PortfolioProject[];
};

export function PortfolioGrid({ limit, projects }: PortfolioGridProps) {
  const sourceProjects = projects ?? portfolioProjects;
  const visibleProjects = limit ? sourceProjects.slice(0, limit) : sourceProjects;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {visibleProjects.map((project) => (
        <article key={project.slug} className="surface overflow-hidden rounded-lg">
          <ProjectPreview project={project} />
          <div className="p-5">
            <p className="text-xs font-bold uppercase text-cobalt dark:text-neon">{project.category}</p>
            <h3 className="mt-3 text-2xl font-black">{project.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.slice(0, 3).map((tech) => (
                <span key={tech} className="rounded-md bg-cobalt/10 px-2.5 py-1 text-xs font-bold text-cobalt dark:bg-neon/12 dark:text-neon">
                  {tech}
                </span>
              ))}
            </div>
            <Link href={`/portfolio/${project.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-signal">
              Open case study <ArrowUpRight size={17} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
