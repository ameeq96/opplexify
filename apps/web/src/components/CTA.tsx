import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-ink px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-neon">Ready to discuss your project</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
            Start with a clear scope, realistic timeline, and a professional delivery plan.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href="/build-your-project"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ef6949]"
          >
            Build an Estimate <ArrowRight size={18} />
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-md border border-white/16 px-5 py-3 text-sm font-bold text-white/86 transition hover:bg-white/10"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}
