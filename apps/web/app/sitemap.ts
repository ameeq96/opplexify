import type { MetadataRoute } from "next";
import { fetchApi, type BlogPost, type Project, type Service, type TeamMember } from "../lib/api";
import { absoluteUrl } from "../lib/seo";

export const revalidate = 300;

type SitemapEntry = MetadataRoute.Sitemap[number];

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

function route(path: string, priority: number, changeFrequency: SitemapEntry["changeFrequency"] = "monthly"): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
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
    ...staticRoutes.map((item) => ({ ...item, lastModified: new Date() })),
    ...services.map((item) => route(`/services/${item.slug}`, 0.75, "monthly")),
    ...projects.map((item) => route(`/work/${item.slug}`, 0.75, "monthly")),
    ...posts.map((item) => route(`/blog/${item.slug}`, 0.65, "weekly")),
    ...team.map((item) => route(`/team/${item.slug}`, 0.55, "monthly"))
  ];
}
