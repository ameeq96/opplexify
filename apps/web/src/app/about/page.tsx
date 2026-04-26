import type { Metadata } from "next";
import { CTA } from "@/components/CTA";
import { SectionHeading } from "@/components/SectionHeading";
import { labSignals, trustStack } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "About Opplexify Product Lab, a product-focused software studio for websites, web apps, SaaS platforms, mobile apps, and admin dashboards."
};

export default function AboutPage() {
  return (
    <main className="pt-16">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">About</p>
            <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-6xl">A focused software studio for founders and growing teams.</h1>
            <p className="mt-6 text-base leading-8 text-muted">
              Opplexify brings product strategy, frontend development, backend systems, database design, admin dashboards, and handoff into one coordinated delivery process.
            </p>
          </div>
          <div className="surface rounded-lg p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {labSignals.map((item) => (
                <div key={item.label} className="rounded-md bg-mist p-5 dark:bg-white/6">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="mt-2 text-sm font-semibold text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist px-4 py-16 dark:bg-white/5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Operating principles"
            title="Premium interface design, practical systems, and clear communication."
            description="The frontend, API, database, and admin experience are planned together so the final product feels cohesive, maintainable, and ready for real use."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {trustStack.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="surface rounded-lg p-6 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-md bg-cobalt text-white dark:bg-neon dark:text-ink">
                    <Icon size={23} />
                  </div>
                  <h2 className="mt-5 text-xl font-black">{item.label}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Every engagement begins with a practical structure and is refined into a polished, maintainable product experience.
                  </p>
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
