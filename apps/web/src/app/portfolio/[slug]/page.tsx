import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { portfolioProjects } from "@/lib/data";
import { CTA } from "@/components/CTA";
import { ProjectPreview } from "@/components/ProjectPreview";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = portfolioProjects.find((item) => item.slug === params.slug);
  if (!project) {
    return {
      title: "Project"
    };
  }

  const isVideo = project.image.toLowerCase().endsWith(".mp4");

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: isVideo ? undefined : [{ url: project.image }]
    }
  };
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = portfolioProjects.find((item) => item.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="pt-16">
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-bold text-cobalt dark:text-neon">
            <ArrowLeft size={17} /> Back to portfolio
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-signal">{project.category}</p>
              <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-6xl">{project.title}</h1>
              <p className="mt-5 text-base leading-8 text-muted">{project.summary}</p>
              {(project.liveUrl || project.githubUrl) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.liveUrl && (
                    <a href={project.liveUrl} className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-3 text-sm font-bold text-white">
                      Live demo <ArrowUpRight size={17} />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-4 py-3 text-sm font-bold">
                      GitHub <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
              )}
            </div>
            <ProjectPreview project={project} large />
          </div>
        </div>
      </section>

      <section className="bg-mist px-4 py-16 dark:bg-white/5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            ["Problem", project.problem],
            ["Solution", project.solution],
            ["Result", project.result]
          ].map(([title, body]) => (
            <article key={title} className="surface rounded-lg p-6">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">Features Built</h2>
            <div className="mt-5 grid gap-3">
              {project.features.map((feature) => (
                <p key={feature} className="flex items-center gap-2 text-sm text-muted">
                  <CheckCircle2 size={18} className="text-cobalt dark:text-neon" /> {feature}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black">Technology Stack</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="rounded-md bg-cobalt/10 px-3 py-2 text-sm font-bold text-cobalt dark:bg-neon/12 dark:text-neon">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
}
