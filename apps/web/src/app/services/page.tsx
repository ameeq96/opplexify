import type { Metadata } from "next";
import { CTA } from "@/components/CTA";
import { SectionHeading } from "@/components/SectionHeading";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Professional software development services for websites, web applications, SaaS platforms, mobile apps, admin dashboards, and NestJS backends."
};

export default function ServicesPage() {
  return (
    <main className="pt-16">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Services"
            title="Choose a focused service or build the complete product system."
            description="From a concise business website to a complete mobile and web application suite, each service is structured for a clear, production-minded launch."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="surface rounded-lg p-6">
                  <div className="grid size-12 place-items-center rounded-md bg-cobalt text-white dark:bg-neon dark:text-ink">
                    <Icon size={23} />
                  </div>
                  <h2 className="mt-5 text-2xl font-black">{service.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{service.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
}
