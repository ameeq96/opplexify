import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";

export function ServicesSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Services"
          title="Full-stack services for professional digital product delivery."
          description="Each service is planned around business objectives, maintainable architecture, and a user experience that supports real operational needs."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="surface rounded-lg p-6 transition hover:-translate-y-1 hover:shadow-glow">
                <div className="grid size-12 place-items-center rounded-md bg-cobalt text-white dark:bg-neon dark:text-ink">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 text-xl font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{service.description}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-cobalt dark:text-neon">
            Explore services <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
