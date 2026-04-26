import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";

const footerLinks = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/build-your-project", label: "Build Your Project" },
  { href: "/contact", label: "Contact" }
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-neon font-black text-ink">OX</span>
            <span className="text-lg font-bold">Opplexify Product Lab</span>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/72">
            Professional websites, full-stack applications, SaaS platforms, mobile apps, and admin dashboards delivered with a structured product workflow.
          </p>
          <Link
            href="/build-your-project"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-neon"
          >
            Build an Estimate <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold uppercase text-white/52">Explore</h2>
            <div className="mt-4 grid gap-3">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-white/72 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase text-white/52">Connect</h2>
            <div className="mt-4 flex gap-2">
              <a
                href="mailto:hello@opplexify.dev"
                className="grid size-10 place-items-center rounded-md border border-white/12 text-white/72 hover:bg-white/10 hover:text-white"
                aria-label="Email"
                title="Email"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://github.com"
                className="grid size-10 place-items-center rounded-md border border-white/12 text-white/72 hover:bg-white/10 hover:text-white"
                aria-label="GitHub"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com"
                className="grid size-10 place-items-center rounded-md border border-white/12 text-white/72 hover:bg-white/10 hover:text-white"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        Built for clear launches, maintainable handoffs, and products prepared for growth.
      </div>
    </footer>
  );
}
