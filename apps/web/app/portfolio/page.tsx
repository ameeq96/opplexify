import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { opplexifyCompany } from "@adon/shared";
import { PortfolioGridScroller } from "../../components/site/PortfolioGridScroller";
import { PageHero, SectionHead } from "../../components/site/Blocks";
import { PublicShell } from "../../components/site/PublicShell";
import { assetUrl, fetchApi, type PortfolioItem } from "../../lib/api";
import { seoMetadata } from "../../lib/seo";

export const revalidate = 300;

export const metadata: Metadata = seoMetadata({
  title: "Portfolio - Private Client Software Work | Opplexify LLC",
  description:
    "Selected private client work from Opplexify LLC is available upon request. Public portfolio visuals use privacy-safe labels only.",
  path: "/portfolio"
});

const portfolioThumbnailFolder = "portfolio/thumbs";
const imageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);
const tags = ["Website", "SaaS", "Dashboard", "Mobile App", "Backend/API", "Automation"];

type PublicAsset = {
  name: string;
  src: string;
  title?: string;
  tag?: string;
  alt?: string | null;
};

function publicRoot() {
  const localPublic = join(process.cwd(), "public");
  if (existsSync(localPublic)) return localPublic;

  return join(process.cwd(), "apps", "web", "public");
}

function readPublicAssets(folder: string, extensions: Set<string>): PublicAsset[] {
  const root = publicRoot();
  const absoluteFolder = join(root, folder);
  if (!existsSync(absoluteFolder)) return [];
  const encodedFolder = folder.split("/").map(encodeURIComponent).join("/");

  return readdirSync(absoluteFolder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => extensions.has(name.slice(name.lastIndexOf(".")).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => ({
      name,
      src: `/${encodedFolder}/${encodeURIComponent(name)}`.replaceAll("\\", "/")
    }));
}

function assetName(src: string) {
  try {
    return decodeURIComponent(src.split("/").pop() ?? src);
  } catch {
    return src.split("/").pop() ?? src;
  }
}

function neutralPortfolioTitle(index: number) {
  return `Private client work ${String(index + 1).padStart(2, "0")}`;
}

export default async function PortfolioPage() {
  const cmsItems = await fetchApi<PortfolioItem[]>("/public/portfolio-items", []);
  const cmsImages = cmsItems.filter((item) => item.mediaType !== "video");
  const cmsVideos = cmsItems.filter((item) => item.mediaType === "video");
  const localImages = readPublicAssets(portfolioThumbnailFolder, imageExtensions);
  const imageSource = cmsImages.length
    ? cmsImages.map((item) => ({ name: assetName(item.mediaUrl), src: assetUrl(item.mediaUrl), alt: item.alt }))
    : localImages;
  const videoSource = cmsVideos.length
    ? cmsVideos.map((item) => ({ name: assetName(item.mediaUrl), src: assetUrl(item.mediaUrl), alt: item.alt }))
    : readPublicAssets("portfolio/videos", videoExtensions);
  const portfolioItems = imageSource.map((image, index) => ({
    ...image,
    title: neutralPortfolioTitle(index),
    tag: tags[index % tags.length],
    alt: image.alt ?? `${neutralPortfolioTitle(index)} preview`
  }));
  const filters = Array.from(new Set(portfolioItems.map((item) => item.tag)));
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opplexify LLC portfolio",
    url: `${opplexifyCompany.website}/portfolio`,
    description:
      "Selected private client work is available upon request. Public portfolio visuals use privacy-safe labels only.",
    isPartOf: { "@type": "WebSite", name: opplexifyCompany.legalName, url: opplexifyCompany.website }
  };

  return (
    <PublicShell smooth={false} showLoader={false}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }} />
      <PageHero
        eyebrow="Portfolio"
        title="Selected Private Client Work"
        subtitle="Selected private client work is available upon request. Public examples are shown with privacy-safe labels only and do not include client names, results, or testimonials."
      />
      <section className="section">
        <div className="container rr-container-1650">
          <SectionHead title="Privacy-Safe Work Samples" subtitle="These visuals are presented as general work samples. Detailed case studies require verified project details and client permission." />
          {portfolioItems.length ? (
            <PortfolioGridScroller items={portfolioItems} filters={filters} batchSize={9} />
          ) : (
            <p className="notice">Selected private client work is available upon request.</p>
          )}
        </div>
      </section>

      {videoSource.length > 0 ? (
        <section className="section">
          <div className="container rr-container-1650">
            <SectionHead title="Private Work Videos" subtitle="Video previews are shown with neutral labels only." />
            <div className="portfolio-video-grid fade-anim">
              {videoSource.map((video, index) => (
                <div className="portfolio-video-item" key={video.src}>
                  <video controls preload="metadata">
                    <source src={video.src} type="video/mp4" />
                  </video>
                  <div className="portfolio-video-caption">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{neutralPortfolioTitle(index)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}
