import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectBuilder } from "@/components/ProjectBuilder";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Build Your Project",
  description: "Interactive project estimator for websites, web applications, SaaS platforms, mobile apps, and complete product systems."
};

export default function BuildYourProjectPage() {
  return (
    <main className="pt-16">
      <section className="px-4 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Build Your Project"
          title="Define your project requirements and receive a structured estimate."
          description="Select the product type, features, delivery preference, and budget range to receive a recommended package before submitting your request."
        />
      </section>
      <Suspense fallback={<div className="px-4 py-16 text-center text-sm text-muted">Loading builder...</div>}>
        <ProjectBuilder />
      </Suspense>
    </main>
  );
}
