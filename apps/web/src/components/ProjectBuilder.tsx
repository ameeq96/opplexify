"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, Loader2, Send } from "lucide-react";
import clsx from "clsx";
import { estimateProject, featureOptions, ProjectType, Timeline } from "@/lib/data";
import { postJson } from "@/lib/api";

const projectTypes: ProjectType[] = ["Website", "Web App", "SaaS", "Mobile App", "Mobile + Web App"];
const timelineOptions: Timeline[] = ["Standard", "Fast Delivery"];
const budgetRanges = ["Under $300", "$300 - $700", "$700 - $1200", "$1200 - $2000", "$2000+"];

const packageToType: Record<string, ProjectType> = {
  "simple-website": "Website",
  "complete-web-app": "Web App",
  "complete-saas": "SaaS",
  "mobile-admin": "Mobile App",
  "mobile-web": "Mobile + Web App"
};

export function ProjectBuilder() {
  const searchParams = useSearchParams();
  const initialType = packageToType[searchParams.get("package") ?? ""] ?? "SaaS";
  const [projectType, setProjectType] = useState<ProjectType>(initialType);
  const [features, setFeatures] = useState<string[]>(["Authentication", "Admin Dashboard"]);
  const [timeline, setTimeline] = useState<Timeline>("Standard");
  const [budget, setBudget] = useState("$700 - $1200");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const estimate = useMemo(() => estimateProject(projectType, features, timeline), [projectType, features, timeline]);

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature]
    );
  }

  async function submitQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      await postJson("/quotes", {
        name,
        email,
        phone,
        projectType,
        features,
        timeline,
        budget,
        message,
        recommendedPackage: estimate.packageName,
        estimatedPrice: estimate.startingPrice
      });
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="surface self-start rounded-lg p-5 sm:p-7">
          <div className="grid gap-8">
            <div>
              <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Project type</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {projectTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setProjectType(type)}
                    className={clsx(
                      "focus-ring min-h-16 rounded-md border px-3 py-3 text-left text-sm font-bold transition",
                      projectType === type
                        ? "border-cobalt bg-cobalt text-white dark:border-neon dark:bg-neon dark:text-ink"
                        : "border-[var(--line)] bg-white/62 hover:border-cobalt/40 dark:bg-white/6"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Features</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featureOptions.map((feature) => {
                  const active = features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={clsx(
                        "focus-ring flex min-h-14 items-center gap-3 rounded-md border px-3 py-3 text-left text-sm font-semibold transition",
                        active
                          ? "border-cobalt bg-cobalt/10 text-cobalt dark:border-neon dark:bg-neon/12 dark:text-neon"
                          : "border-[var(--line)] bg-white/62 text-[var(--foreground)] hover:border-cobalt/40 dark:bg-white/6"
                      )}
                    >
                      <span className={clsx("grid size-5 shrink-0 place-items-center rounded", active ? "bg-cobalt text-white dark:bg-neon dark:text-ink" : "bg-[var(--line)]")}>
                        {active ? <Check size={14} /> : null}
                      </span>
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Timeline</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {timelineOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTimeline(option)}
                      className={clsx(
                        "focus-ring rounded-md border px-3 py-3 text-sm font-bold transition",
                        timeline === option
                          ? "border-cobalt bg-cobalt text-white dark:border-neon dark:bg-neon dark:text-ink"
                          : "border-[var(--line)] bg-white/62 dark:bg-white/6"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="budget" className="text-sm font-bold uppercase text-cobalt dark:text-neon">
                  Budget range
                </label>
                <select
                  id="budget"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="focus-ring mt-4 h-12 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold text-ink dark:bg-[#07111f] dark:text-white"
                >
                  {budgetRanges.map((range) => (
                    <option key={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <aside className="surface self-start rounded-lg p-5 sm:p-7">
          <p className="text-sm font-bold uppercase text-signal">Recommended</p>
          <h2 className="mt-3 text-3xl font-black">{estimate.packageName}</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Estimated starting point based on your selected product type, feature requirements, and delivery preference.
          </p>
          <div className="mt-6 rounded-md bg-ink p-5 text-white dark:bg-white dark:text-ink">
            <p className="text-sm font-semibold opacity-75">Starting price</p>
            <p className="mt-2 text-5xl font-black">${estimate.startingPrice}</p>
            <p className="mt-3 text-sm font-bold text-neon dark:text-cobalt">{estimate.timeline}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Suggested scope</p>
            <div className="mt-3 grid gap-2">
              {estimate.suggested.map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-muted">
                  <Check size={16} className="text-cobalt dark:text-neon" /> {item}
                </p>
              ))}
            </div>
          </div>

          <form onSubmit={submitQuote} className="mt-7 grid gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Name"
              className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-ink dark:bg-[#07111f] dark:text-white"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              placeholder="Email"
              className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-ink dark:bg-[#07111f] dark:text-white"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="WhatsApp / Phone"
              className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-ink dark:bg-[#07111f] dark:text-white"
            />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Brief project requirements"
              rows={4}
              className="focus-ring rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-ink dark:bg-[#07111f] dark:text-white"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ef6949] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Request This Project
            </button>
            {status === "success" ? <p className="text-sm font-semibold text-cobalt dark:text-neon">Project request submitted successfully.</p> : null}
            {status === "error" ? <p className="text-sm font-semibold text-signal">Submission service unavailable. Please confirm the backend is running and try again.</p> : null}
          </form>
        </aside>
      </div>
    </section>
  );
}
