import type { MetadataRoute } from "next";
import { fetchApi, type BlogPost, type Project, type Service, type TeamMember } from "../lib/api";
import { absoluteUrl } from "../lib/seo";

export const revalidate = 300;

type SitemapEntry = MetadataRoute.Sitemap[number];

// Captured once when the module is first loaded (deploy/boot time), not per
// request — so static routes get a stable lastModified instead of "now" on
// every 5-minute revalidation, which crawlers learn to ignore.
const BUILD_TIME = new Date();

function pickDate(...candidates: Array<string | Date | null | undefined>): Date {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return BUILD_TIME;
}

const staticRoutes: Array<Pick<SitemapEntry, "url" | "changeFrequency" | "priority">> = [
  { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
  { url: absoluteUrl("/portfolio"), changeFrequency: "weekly", priority: 0.95 },
  { url: absoluteUrl("/services"), changeFrequency: "weekly", priority: 0.9 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.8 },
  { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.7 },
  { url: absoluteUrl("/work"), changeFrequency: "weekly", priority: 0.7 },
  { url: absoluteUrl("/team"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/pricing"), changeFrequency: "monthly", priority: 0.85 },
  { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
  { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
  { url: absoluteUrl("/refund-policy"), changeFrequency: "yearly", priority: 0.3 }
];

function route(
  path: string,
  priority: number,
  lastModified: Date,
  changeFrequency: SitemapEntry["changeFrequency"] = "monthly"
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts, team] = await Promise.all([
    fetchApi<Service[]>("/public/services", []),
    fetchApi<Project[]>("/public/projects", []),
    fetchApi<BlogPost[]>("/public/blog", []),
    fetchApi<TeamMember[]>("/public/team", [])
  ]);

  return [
    ...staticRoutes.map((item) => ({ ...item, lastModified: BUILD_TIME })),
    ...services.map((item) => route(`/services/${item.slug}`, 0.75, pickDate(item.updatedAt), "monthly")),
    ...projects.map((item) => route(`/work/${item.slug}`, 0.75, pickDate(item.updatedAt, item.date), "monthly")),
    ...posts.map((item) => route(`/blog/${item.slug}`, 0.65, pickDate(item.updatedAt, item.publishedAt), "weekly")),
    ...team.map((item) => route(`/team/${item.slug}`, 0.55, pickDate(item.updatedAt), "monthly"))
  ];
}
