import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";

export function Testimonials() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Client notes"
          title="Designed for clarity, usability, and long-term maintainability."
          description="Each delivery is structured for business owners, operators, and future developers who need a product they can understand and extend."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="surface rounded-lg p-6">
              <Quote className="text-signal" size={28} />
              <p className="mt-4 text-sm leading-7 text-muted">{item.quote}</p>
              <div className="mt-6">
                <p className="font-black">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
