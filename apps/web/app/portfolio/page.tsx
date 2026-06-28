import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { PortfolioGridScroller } from "../../components/site/PortfolioGridScroller";
import { PublicShell } from "../../components/site/PublicShell";
import { assetUrl, fetchApi, getSection, pageMetadata, type Page, type PortfolioItem } from "../../lib/api";
import { absoluteUrl, breadcrumbList, siteUrl } from "../../lib/seo";

export const revalidate = 300;

const portfolioImageFolder = "portfolio/images";
const portfolioThumbnailFolder = "portfolio/thumbs";
export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/portfolio", null);
  return pageMetadata(page, "Portfolio - Website Design, SaaS UI, Web App & Mobile App Work", "/portfolio");
}

const imageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);
const tags = ["Website", "SaaS UI", "Dashboard", "Mobile App", "Backend/API", "Automation"];
const hiddenPortfolioImages = new Set(["33-0041.webp", "33-0042.webp"]);

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
    .filter((name) => {
      const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
      return extensions.has(ext);
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => ({
      name,
      src: `/${encodedFolder}/${encodeURIComponent(name)}`.replaceAll("\\", "/")
    }));
}

function projectTitle(index: number) {
  const projectNumber = String(index + 1).padStart(2, "0");

  return `Private client work sample ${projectNumber}`;
}

function fallbackImages() {
  const thumbnails = readPublicAssets(portfolioThumbnailFolder, imageExtensions);
  if (thumbnails.length) return thumbnails;

  return readPublicAssets(portfolioImageFolder, imageExtensions).filter((image) => !hiddenPortfolioImages.has(image.name));
}

function portfolioAssetName(src: string) {
  try {
    return decodeURIComponent(src.split("/").pop() ?? src);
  } catch {
    return src.split("/").pop() ?? src;
  }
}

function isLegacyPortfolioImage(src: string) {
  try {
    return new URL(src, "https://opplexify.local").pathname.startsWith(`/${portfolioImageFolder}/`);
  } catch {
    return src.startsWith(`/${portfolioImageFolder}/`);
  }
}

export default async function PortfolioGridPage() {
  const [page, cmsItems] = await Promise.all([
    fetchApi<Page | null>("/public/pages/portfolio", null),
    fetchApi<PortfolioItem[]>("/public/portfolio-items", [])
  ]);
  const visibleCmsItems = cmsItems.filter((item) => !hiddenPortfolioImages.has(portfolioAssetName(item.mediaUrl)));
  const cmsImages = visibleCmsItems.filter((item) => item.mediaType !== "video");
  const cmsVideos = visibleCmsItems.filter((item) => item.mediaType === "video");
  const localImages = fallbackImages();
  const images: PublicAsset[] = cmsImages.length
    ? cmsImages.map((item, index) => ({
        name: localImages[index]?.name ?? portfolioAssetName(item.mediaUrl),
        src: isLegacyPortfolioImage(item.mediaUrl) && localImages[index] ? localImages[index].src : assetUrl(item.mediaUrl),
        title: item.title,
        tag: item.tag ?? undefined,
        alt: item.alt
      }))
    : localImages;
  const videos: PublicAsset[] = cmsVideos.length
    ? cmsVideos.map((item) => ({
        name: portfolioAssetName(item.mediaUrl),
        src: assetUrl(item.mediaUrl),
        title: item.title,
        tag: item.tag ?? undefined,
        alt: item.alt
      }))
    : readPublicAssets("portfolio/videos", videoExtensions);
  const portfolioItems = images.map((image, index) => ({
    ...image,
    title: image.title ?? projectTitle(index),
    tag: image.tag ?? tags[index % tags.length],
    alt: image.alt
  }));
  const filters = Array.from(new Set(portfolioItems.map((item) => item.tag).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
  const heroPreviews = portfolioItems.slice(0, 3);
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Opplexify web development portfolio",
    url: absoluteUrl("/portfolio"),
    description:
      "Selected Opplexify LLC portfolio visuals for websites, SaaS interfaces, mobile app screens, dashboards, and business software. Private client details are available upon request.",
    isPartOf: { "@type": "WebSite", name: "Opplexify", url: siteUrl() }
  };
  const intro = getSection(page, "intro");

  return (
    <PublicShell smooth={false} showLoader={false}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList([{ name: "Home", path: "/" }, { name: "Portfolio", path: "/portfolio" }])) }} />
      <main>
        <section className="opplexify-portfolio-hero mb-4">
          <div className="container rr-container-1650">
            <div className="opplexify-portfolio-hero__inner">
              <div className="opplexify-portfolio-hero__content fade-anim">
                <span className="section-subtitle">Portfolio</span>
                <h1>{intro?.title ?? page?.title ?? "Web development portfolio for websites, SaaS products and apps."}</h1>
                <p>
                  {intro?.subtitle ??
                    page?.summary ??
                    "Selected private client work is available upon request. Public portfolio visuals show the types of websites, SaaS interfaces, mobile app screens, dashboards, and business software Opplexify LLC can build."}
                </p>

                <div className="opplexify-portfolio-hero__stats" aria-label="Portfolio overview">
                  <span>
                    <strong>Private</strong>
                    <small> client work</small>
                  </span>
                  <span>
                    <strong>Upon request</strong>
                    <small> details</small>
                  </span>
                  <span>
                    <strong>Scoped</strong>
                    <small> services</small>
                  </span>
                </div>
              </div>

              {heroPreviews.length > 0 ? (
                <div className="opplexify-portfolio-hero__collage fade-anim" aria-label="Featured portfolio previews">
                  {heroPreviews.map((item, index) => (
                    <a
                      className={`opplexify-portfolio-hero__preview opplexify-portfolio-hero__preview--${index + 1}`}
                      href={item.src}
                      target="_blank"
                      rel="noreferrer"
                      key={item.src}
                    >
                      <img
                        src={item.src}
                        alt={item.alt ?? item.title}
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        sizes="(max-width: 575px) 82vw, (max-width: 900px) 72vw, 38vw"
                      />
                      <span>
                        {String(index + 1).padStart(2, "0")} / {item.tag}
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="portfolio-area-16">
          <div className="container rr-container-1650">
            <div className="portfolio-16-inner">
              <div className="works-16-wrapper-box opplexify-portfolio-wrapper-box">
                <PortfolioGridScroller items={portfolioItems} filters={filters} batchSize={9} />
              </div>
            </div>
          </div>
        </section>

        {videos.length > 0 ? (
          <section className="portfolio-video-area section-spacing-bottom-150">
            <div className="container rr-container-1650">
              <div className="portfolio-video-head">
                <span className="section-subtitle">Motion</span>
                <h2 className="section-title rr_title_anim">Private interface video samples</h2>
                <p>{videos.length} private video samples for websites, SaaS products, dashboards, and app interfaces.</p>
              </div>
              <div className="portfolio-video-grid fade-anim">
                {videos.map((video, index) => (
                  <div className="portfolio-video-item" key={video.src}>
                    <video controls preload="metadata">
                      <source src={video.src} type="video/mp4" />
                    </video>
                    <div className="portfolio-video-caption">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{video.title ?? `Private portfolio video sample ${String(index + 1).padStart(2, "0")}`}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </PublicShell>
  );
}
