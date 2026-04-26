import type { Metadata } from "next";
import { Suspense } from "react";
import { CTA } from "@/components/CTA";
import { PortfolioPager } from "@/components/PortfolioPager";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Professional case study portfolio for web applications, SaaS platforms, mobile apps, and admin dashboards."
};

export default function PortfolioPage() {
  return (
    <main className="pt-16">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Portfolio"
            title="Case studies focused on outcomes, structure, and execution."
            description="Review examples of business requirements translated into polished full-stack product systems."
          />
          <div className="mt-10">
            <Suspense fallback={<div className="text-sm text-muted">Loading portfolio...</div>}>
              <PortfolioPager />
            </Suspense>
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
}
