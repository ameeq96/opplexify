"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/api";

type AdminOverview = {
  contacts: Array<{ id: string; name: string; email: string; projectType: string; budget: string; message: string; createdAt: string }>;
  quotes: Array<{ id: string; name: string; email: string; projectType: string; recommendedPackage: string; estimatedPrice: number; createdAt: string }>;
  projects: Array<{ id: string; title: string; slug: string; category: string; summary: string }>;
  testimonials: Array<{ id: string; name: string; role: string; quote: string }>;
  pricing: Array<{ id: string; name: string; price: number; label: string }>;
};

const emptyOverview: AdminOverview = {
  contacts: [],
  quotes: [],
  projects: [],
  testimonials: [],
  pricing: []
};

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const request = useCallback(
    async (path: string, options?: RequestInit) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    [token]
  );

  const loadOverview = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await request("/admin/overview");
      setOverview(data);
    } catch {
      setMessage("Could not load admin data. Login again or start the backend.");
    } finally {
      setLoading(false);
    }
  }, [request, token]);

  useEffect(() => {
    const saved = window.localStorage.getItem("opplexify_admin_token") ?? "";
    setToken(saved);
    if (!saved) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  async function addProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");

    try {
      await request("/projects", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          slug: form.get("slug"),
          category: form.get("category"),
          summary: form.get("summary"),
          problem: form.get("problem"),
          solution: form.get("solution"),
          result: form.get("result"),
          image: form.get("image") || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
          liveUrl: form.get("liveUrl") || "https://example.com",
          githubUrl: form.get("githubUrl") || "https://github.com",
          tech: String(form.get("tech") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
          features: String(form.get("features") ?? "").split(",").map((item) => item.trim()).filter(Boolean)
        })
      });
      event.currentTarget.reset();
      await loadOverview();
      setMessage("Project added.");
    } catch {
      setMessage("Could not add project.");
    }
  }

  async function deleteProject(id: string) {
    setMessage("");
    try {
      await request(`/projects/${id}`, { method: "DELETE" });
      await loadOverview();
      setMessage("Project deleted.");
    } catch {
      setMessage("Could not delete project.");
    }
  }

  async function addTestimonial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage("");

    try {
      await request("/testimonials", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          role: form.get("role"),
          quote: form.get("quote")
        })
      });
      event.currentTarget.reset();
      await loadOverview();
      setMessage("Testimonial added.");
    } catch {
      setMessage("Could not add testimonial.");
    }
  }

  if (!token) {
    return (
      <div className="surface mx-auto max-w-xl rounded-lg p-6 text-center">
        <h2 className="text-2xl font-black">Admin session required.</h2>
        <p className="mt-3 text-sm text-muted">Please sign in from `/admin/login` to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={loadOverview}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] px-4 py-3 text-sm font-bold"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      {message ? <p className="mt-6 rounded-md bg-signal/10 px-4 py-3 text-sm font-bold text-signal">{message}</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {[
          ["Contacts", overview.contacts.length],
          ["Quotes", overview.quotes.length],
          ["Projects", overview.projects.length],
          ["Testimonials", overview.testimonials.length],
          ["Pricing", overview.pricing.length]
        ].map(([label, value]) => (
          <div key={label} className="surface rounded-lg p-5">
            <p className="text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="surface rounded-lg p-5">
          <h2 className="text-2xl font-black">Project Requests</h2>
          <div className="mt-5 grid gap-3">
            {overview.quotes.map((quote) => (
              <article key={quote.id} className="rounded-md border border-[var(--line)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{quote.name}</p>
                    <p className="mt-1 text-sm text-muted">{quote.email}</p>
                  </div>
                  <p className="text-sm font-black text-signal">${quote.estimatedPrice}</p>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {quote.projectType} {" -> "} {quote.recommendedPackage}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="text-2xl font-black">Contact Submissions</h2>
          <div className="mt-5 grid gap-3">
            {overview.contacts.map((contact) => (
              <article key={contact.id} className="rounded-md border border-[var(--line)] p-4">
                <p className="font-bold">{contact.name}</p>
                <p className="mt-1 text-sm text-muted">{contact.email}</p>
                <p className="mt-3 text-sm text-muted">{contact.projectType} | {contact.budget}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{contact.message}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface rounded-lg p-5">
          <h2 className="text-2xl font-black">Portfolio Projects</h2>
          <div className="mt-5 grid gap-3">
            {overview.projects.map((project) => (
              <article key={project.id} className="flex items-start justify-between gap-4 rounded-md border border-[var(--line)] p-4">
                <div>
                  <p className="font-bold">{project.title}</p>
                  <p className="mt-1 text-sm text-muted">{project.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteProject(project.id)}
                  className="focus-ring grid size-10 place-items-center rounded-md border border-[var(--line)] text-signal"
                  aria-label={`Delete ${project.title}`}
                  title="Delete project"
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
          <form onSubmit={addProject} className="mt-6 grid gap-3">
            <h3 className="text-lg font-black">Add Portfolio Project</h3>
            {["title", "slug", "category", "summary", "problem", "solution", "result", "image", "liveUrl", "githubUrl", "tech", "features"].map((field) => (
              <input
                key={field}
                name={field}
                required={["title", "slug", "category", "summary"].includes(field)}
                placeholder={field}
                className="focus-ring h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-ink dark:bg-[#07111f] dark:text-white"
              />
            ))}
            <button type="submit" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white dark:bg-neon dark:text-ink">
              <Plus size={18} /> Add Project
            </button>
          </form>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="text-2xl font-black">Testimonials</h2>
          <div className="mt-5 grid gap-3">
            {overview.testimonials.map((item) => (
              <article key={item.id} className="rounded-md border border-[var(--line)] p-4">
                <p className="font-bold">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.role}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{item.quote}</p>
              </article>
            ))}
          </div>
          <form onSubmit={addTestimonial} className="mt-6 grid gap-3">
            <h3 className="text-lg font-black">Add Testimonial</h3>
            <input name="name" required placeholder="name" className="focus-ring h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-ink dark:bg-[#07111f] dark:text-white" />
            <input name="role" required placeholder="role" className="focus-ring h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-ink dark:bg-[#07111f] dark:text-white" />
            <textarea name="quote" required placeholder="quote" rows={4} className="focus-ring rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm text-ink dark:bg-[#07111f] dark:text-white" />
            <button type="submit" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white dark:bg-neon dark:text-ink">
              <Plus size={18} /> Add Testimonial
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
