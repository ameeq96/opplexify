"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { postJson } from "@/lib/api";

const projectTypes = ["Website", "Web App", "SaaS", "Mobile App", "Mobile + Web App"];
const budgets = ["Under $300", "$300 - $700", "$700 - $1200", "$1200 - $2000", "$2000+"];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);

    try {
      await postJson("/contacts", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        projectType: form.get("projectType"),
        budget: form.get("budget"),
        message: form.get("message")
      });
      event.currentTarget.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submitContact} className="surface grid gap-4 rounded-lg p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Name
          <input name="name" required className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input name="email" type="email" required className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        WhatsApp / Phone
        <input name="phone" className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Project type
          <select name="projectType" className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white">
            {projectTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Budget
          <select name="budget" className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white">
            {budgets.map((budget) => (
              <option key={budget}>{budget}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Message
        <textarea name="message" required rows={6} className="focus-ring rounded-md border border-[var(--line)] bg-white px-3 py-3 font-normal text-ink dark:bg-[#07111f] dark:text-white" />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ef6949] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Send Message
      </button>
      {status === "success" ? <p className="text-sm font-semibold text-cobalt dark:text-neon">Your message has been submitted successfully.</p> : null}
      {status === "error" ? <p className="text-sm font-semibold text-signal">Submission service unavailable. Please confirm the backend is running and try again.</p> : null}
    </form>
  );
}
