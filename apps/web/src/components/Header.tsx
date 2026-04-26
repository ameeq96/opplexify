"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/build-your-project", label: "Builder" },
  { href: "/contact", label: "Contact" }
];

export function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const nextDark = !(dark ?? document.documentElement.classList.contains("dark"));
    setDark(nextDark);
    window.localStorage.setItem("theme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.style.colorScheme = nextDark ? "dark" : "light";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/95 text-white shadow-[0_10px_40px_rgba(7,17,31,0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Opplexify home">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-neon text-sm font-black text-ink">OX</span>
          <span className="truncate text-base font-bold">Opplexify Product Lab</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white",
                pathname === item.href && "bg-white/12 text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring grid size-10 place-items-center rounded-md border border-white/12 bg-white/8 transition hover:bg-white/14"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Sun size={18} className="hidden dark:block" />
            <Moon size={18} className="dark:hidden" />
          </button>
          <Link
            href="/build-your-project"
            className="focus-ring hidden rounded-md bg-signal px-4 py-2 text-sm font-bold text-white shadow-lg shadow-signal/20 transition hover:bg-[#ef6949] sm:inline-flex"
          >
            Start a Project
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="focus-ring grid size-10 place-items-center rounded-md border border-white/12 bg-white/8 lg:hidden"
            aria-label="Toggle navigation"
            title="Toggle navigation"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#07111f] px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white/82 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
