import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { PricingGrid } from "@/components/PricingGrid";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { SectionHeading } from "@/components/SectionHeading";
import { process } from "@/lib/data";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ServicesSection />

      <section className="bg-ink px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-neon">Interactive scoping</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-5xl">Estimate your project scope before the first consultation.</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">
                Select the product type, required features, delivery preference, and budget range to receive a structured package recommendation.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/6 p-5">
              <div className="grid gap-3">
                {[
                  "Choose a website, web application, SaaS platform, mobile app, or complete product suite",
                  "Select authentication, admin tools, payments, booking, chat, notifications, and API integrations",
                  "Review the recommended package, starting price, estimated timeline, and suggested scope",
                  "Submit a structured project request directly to the admin dashboard"
                ].map((item) => (
                  <p key={item} className="flex gap-3 rounded-md bg-white/8 px-4 py-3 text-sm text-white/78">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-neon" /> {item}
                  </p>
                ))}
              </div>
              <Link
                href="/build-your-project"
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-neon px-4 py-3 text-sm font-bold text-ink transition hover:bg-white"
              >
                Open Builder <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Portfolio"
              title="Selected case studies with practical product strategy."
              description="Each project outlines the business challenge, proposed solution, core features, technology stack, and outcome."
            />
            <Link href="/portfolio" className="inline-flex items-center gap-2 self-center text-sm font-bold text-signal md:self-auto">
              View all work <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-10">
            <PortfolioGrid limit={3} />
          </div>
        </div>
      </section>

      <section className="bg-mist px-4 py-16 dark:bg-white/5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent packages for focused digital product delivery."
            description="Each package provides a clear starting point while the project builder adapts the scope to your feature requirements."
          />
          <div className="mt-10">
            <PricingGrid />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Process"
            title="A structured delivery process from strategy to launch."
            description="The workflow is built around clear scope, purposeful product screens, reliable APIs, database design, and launch readiness."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {process.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="surface rounded-lg p-6">
                  <div className="grid size-12 place-items-center rounded-md bg-signal text-white">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />
      <CTA />
    </main>
  );
}
