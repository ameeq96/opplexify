import type { Metadata } from "next";
import { Mail, MessageCircle, Timer } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Opplexify Product Lab for websites, SaaS platforms, web applications, mobile apps, and admin dashboards."
};

export default function ContactPage() {
  return (
    <main className="pt-16">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Contact</p>
            <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-6xl">Share your project requirements.</h1>
            <p className="mt-5 text-base leading-8 text-muted">
              Provide your product type, budget range, and key requirements. Your submission is saved securely and reviewed from the admin dashboard.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { icon: Mail, label: "hello@opplexify.dev" },
                { icon: MessageCircle, label: "WhatsApp consultation available" },
                { icon: Timer, label: "Priority response for scoped projects" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <p key={item.label} className="flex items-center gap-3 rounded-md border border-[var(--line)] px-4 py-3 text-sm font-semibold">
                    <Icon size={18} className="text-signal" /> {item.label}
                  </p>
                );
              })}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
