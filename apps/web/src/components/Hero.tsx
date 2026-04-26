import Link from "next/link";
import { ArrowRight, CheckCircle2, Gauge, Layers3 } from "lucide-react";
import { labSignals, trustStack } from "@/lib/data";

export function Hero() {
  return (
    <section className="hero-image relative flex min-h-[88vh] items-end overflow-hidden text-white">
      <div className="absolute inset-0 lab-grid opacity-20" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl animate-panel">
          <p className="inline-flex items-center gap-2 rounded-md border border-white/16 bg-white/10 px-3 py-2 text-sm font-bold text-neon backdrop-blur">
            <Gauge size={17} /> Software Product Lab
          </p>
          <h1 className="mt-6 text-5xl font-black tracking-normal sm:text-6xl lg:text-7xl">
            Opplexify Product Lab
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
            I design and develop production-ready digital products for businesses and founders, including websites, web applications, SaaS platforms, mobile apps, and admin dashboards.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/build-your-project"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white shadow-lg shadow-signal/20 transition hover:bg-[#ef6949]"
            >
              Build an Estimate <ArrowRight size={18} />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-md border border-white/18 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16"
            >
              View Portfolio
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {trustStack.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.label} className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-2 text-sm text-white/78 backdrop-blur">
                  <Icon size={16} /> {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="surface animate-panel self-end rounded-lg p-4 text-ink shadow-glow dark:text-white">
          <div className="rounded-md bg-white p-4 text-ink dark:bg-[#07111f] dark:text-white">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-cobalt dark:text-neon">Live project builder</p>
                <h2 className="mt-1 text-xl font-black">Scope preview</h2>
              </div>
              <Layers3 className="text-signal" />
            </div>
            <div className="mt-5 grid gap-3">
              {["SaaS platform", "Admin dashboard", "JWT authentication", "Prisma database"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-md bg-mist px-4 py-3 text-ink dark:border dark:border-white/10 dark:bg-[#0f1e33] dark:text-white"
                >
                  <span className="text-sm font-semibold">{item}</span>
                  <CheckCircle2 size={18} className="text-cobalt dark:text-neon" />
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {labSignals.map((item) => (
                <div key={item.label} className="rounded-md border border-[var(--line)] bg-white p-4 text-ink dark:bg-[#0b1829] dark:text-white">
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
