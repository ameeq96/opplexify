import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { pricingPackages } from "@/lib/data";

export function PricingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {pricingPackages.map((tier, index) => (
        <article
          key={tier.id}
          className={`surface flex min-h-[420px] flex-col rounded-lg p-5 ${index === 2 ? "shadow-glow ring-2 ring-cobalt/25 dark:ring-neon/35" : ""}`}
        >
          <p className="text-xs font-bold uppercase text-cobalt dark:text-neon">{tier.label}</p>
          <h3 className="mt-3 text-xl font-black">{tier.name}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{tier.description}</p>
          <div className="mt-5">
            <span className="text-4xl font-black">${tier.price}</span>
            <span className="ml-1 text-sm font-semibold text-muted">starting</span>
          </div>
          <p className="mt-2 text-sm font-bold text-signal">{tier.timeline}</p>
          <div className="mt-5 grid gap-3">
            {tier.features.map((feature) => (
              <p key={feature} className="flex gap-2 text-sm text-muted">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-cobalt dark:text-neon" />
                {feature}
              </p>
            ))}
          </div>
          <div className="mt-auto pt-7">
            <Link
              href={`/build-your-project?package=${tier.id}`}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-cobalt dark:bg-neon dark:text-ink dark:hover:bg-white"
            >
              Request Package
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
