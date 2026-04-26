import type { Metadata } from "next";
import { PricingGrid } from "@/components/PricingGrid";
import { CTA } from "@/components/CTA";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent starting prices for websites, web applications, SaaS products, mobile apps, and complete mobile plus web app systems."
};

export default function PricingPage() {
  return (
    <main className="pt-16">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent starting packages for professional product delivery."
            description="Use the project builder when your feature requirements change the scope. The packages below provide clear baseline options."
          />
          <div className="mt-10">
            <PricingGrid />
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
}
