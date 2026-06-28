# Opplexify — SEO / GEO / AEO Audit

**Property:** `opplexify.com` (Next.js App Router, `apps/web`)
**Audit type:** Full source-code audit + live production cross-check
**Date:** 2026-06-28
**Scope reviewed:** 25 routes + shared rendering layer (`layout.tsx`, `robots.ts`, `sitemap.ts`, `manifest.ts`, `lib/seo.ts`, `lib/api.ts`, all `page.tsx`, `PublicShell`, `Blocks`, template renderers) and the live homepage HTML.

| Dimension | Score | Status |
|---|---|---|
| SEO | 7/10 | On Track |
| GEO (AI search) | 6/10 | On Track |
| AEO (answer engines) | 6/10 | On Track |
| **Combined** | **19/30** | |

> **GEO** = Generative Engine Optimization (Perplexity, ChatGPT Search, Google AI Overviews, Gemini).
> **AEO** = Answer Engine Optimization (featured snippets, People-Also-Ask, voice).

---

## Live production cross-check (opplexify.com)

Fetched the live homepage to validate the source findings against what actually ships:

| Signal | Result | Reading |
|---|---|---|
| HTTP status / HTML size | 200 / 113 KB | Healthy |
| `<link rel="stylesheet">` | **10** | Render-blocking CSS bottleneck confirmed |
| `<script>` tags / preloaded scripts | **31 / 18** | Heavy JS payload confirmed |
| Loader overlay (`loader-wrap`) | **Present** | LCP delay confirmed |
| `<title>` / canonical / meta description / OpenGraph | All present | Strong on-page foundation |
| JSON-LD blocks | **6** | Rich structured data confirmed in production |
| `<h1>` count | **1** | Correct heading structure |

> Google PageSpeed Insights could not be run from the audit environment (the unauthenticated API rate-limited the shared egress IP). **Run it manually:** <https://pagespeed.web.dev/?url=https://opplexify.com> — mobile strategy — to capture numeric LCP/CLS/INP.

---

## Biggest strength

Genuinely excellent, correct **structured-data coverage** layered on a clean, centralized metadata system:

- Schema types in use: `Organization`, `WebSite`, `WebPage`, `Blog`, `BlogPosting`, `Service`, `ItemList`, `Person`, `CreativeWork`, `ContactPage`, `AboutPage`, `FAQPage`.
- Centralized metadata in `apps/web/lib/seo.ts` (`seoMetadata`) and `apps/web/lib/api.ts` (`pageMetadata`) gives every route a title, description, self-referencing canonical, OpenGraph + Twitter cards, and a `%s | Opplexify` title template.
- All pages are **server-rendered** — content text (including the `dangerouslySetInnerHTML` templates) is in the initial HTML, so crawlability of content is fine.

This is better than most production sites.

---

## Bottlenecks

### SEO — 7/10

| Signal | Finding | Evidence | Severity |
|---|---|---|---|
| Render-blocking CSS | 10 stylesheets (~1.4 MB) load before paint | `components/site/TemplateAssetLinks.tsx`, `templateAssets.ts` | 🔴 Critical |
| JS weight | ~25 scripts incl. jQuery + full GSAP suite (~648 KB), loaded serially | `components/site/DigitalAgencyRuntime.tsx`, `templateAssets.ts` | 🔴 Critical |
| LCP blocked by loader | Full-screen loader overlay dismissed after ~550 ms or full script chain; LCP `<h1>` carries `rr_title_anim` (GSAP SplitText) so it can't paint until JS runs | `DigitalAgencyRuntime.tsx:205`, `app/page.tsx:161` | 🔴 Critical |
| Broken `font-display` | `@import` URL contained `&amp;display=swap` (HTML-escaped `&`), so the param became `amp;display` and `swap` never applied → FOIT | `public/template-assets/dark/assets/css/style.css:55` | 🟠 High → **FIXED** |
| No `next/image` | 0 usages; raw `<img>` everywhere, no intrinsic `width`/`height` → CLS risk, no AVIF/srcset | sitewide | 🟠 High |
| Sitemap `lastModified` | Every entry stamped `new Date()` per 5-min revalidate → signal ignored by crawlers | `app/sitemap.ts` | 🟡 Medium → **FIXED** |
| Generic alt text | `alt="image"` / `alt="cursor"` on decorative images | `app/page.tsx`, `homeRenderer.ts` | 🟢 Quick win → **FIXED** |
| `keywords` meta | Set sitewide; ignored by Google — harmless noise | `lib/seo.ts:25` | 🟢 Quick win |

### GEO (AI search) — 6/10

- **Strong:** Organization schema with `legalName`, NAP, `knowsAbout`, `makesOffer`, `contactPoint`, `foundingDate`; consistent name/address/phone across footer, contact, and schema; clear value proposition.
- **Weak entity graph:** only one `sameAs` (LinkedIn) in `lib/seo.ts:14`. Add GitHub, Crunchbase, Clutch, X, etc. *(deferred — needs real profile URLs, not fabricated ones).*
- **Low citable depth:** detail bodies are short single paragraphs (see AEO), so little for an AI engine to extract and cite. No original data/stats.
- **Thin social proof:** a `Testimonial` model exists but no `Review`/`AggregateRating` schema is emitted; portfolio is "available upon request."

### AEO (answer engines) — 6/10

- **Strong:** `FAQPage` schema with 9 conversational Q&As, each rendered as a question `<h3>` + answer `<p>` (`app/faq/page.tsx`, `Blocks.tsx` `FaqList`). Snippet- and voice-ready.
- **FAQ is the only answer-optimized surface:** service/blog pages have no question-phrased headings or 40–60-word direct-answer blocks.
- **No `BreadcrumbList`** despite multi-level URLs. 🟡 → **FIXED** (added across all 4 detail routes *and* the main list/static pages — services, blog, work, team, pricing, about, contact, faq, portfolio).
- **No `HowTo` / `Speakable`** markup; "How does a project start?" content is a natural HowTo candidate.
- **Detail content not extractable:** single-paragraph bodies, no lists/tables for list/table snippets.

---

## Fixes applied in this audit

All changes typecheck clean (`tsc --noEmit` on `apps/web`).

| # | Fix | Files |
|---|---|---|
| 1 | **Restored `font-display: swap`** — removed the HTML-escaped `&amp;` in the Google Fonts `@import` URL (was silently causing FOIT) | `public/template-assets/dark/assets/css/style.css` |
| 2 | **Accurate sitemap `lastModified`** — uses real `updatedAt` / `publishedAt` / `date`; static routes use a stable boot-time stamp instead of per-request `new Date()` | `app/sitemap.ts` |
| 3 | **Exposed `updatedAt`** on the public content types (the API already returns it) | `lib/api.ts` |
| 4 | **Added `breadcrumbList()` helper** + emitted `BreadcrumbList` JSON-LD on the 4 detail routes **and** the 9 main list/static pages (services, blog, work, team, pricing, about, contact, faq, portfolio) | `lib/seo.ts` + 13 routes |
| 5 | **Enriched `BlogPosting`** — `dateModified`, `inLanguage`, `author.url`, `publisher.logo` (ImageObject) | `app/blog/[slug]/page.tsx` |
| 6 | **Paragraph-aware `Prose` component** — detail bodies render discrete `<p>` blocks instead of one giant `<p>`, so richer authored content gains real structure | `components/site/Blocks.tsx` + 4 detail routes |
| 7 | **Descriptive / empty alt text** — decorative shapes & cursor now `alt=""`; "who we are" thumbnail given a real description | `app/page.tsx`, `components/site/homeRenderer.ts` |
| 8 | **`OfferCatalog` with real package pricing** — `/pricing` emits an OfferCatalog of 5 priced `Offer`s (PriceSpecification.minPrice, $150–$2,000) and the same catalog is attached to the `Organization` via `hasOfferCatalog`; packages moved to a shared `lib/pricing.ts` | `lib/pricing.ts`, `app/pricing/page.tsx`, `app/layout.tsx` |

### A note on the screenshot ("sitelinks") request

The sub-page **sitelinks** in a Google result (the linked list of sections under the main hit) are **generated algorithmically** by Google from site structure, internal linking, and click data — **no schema markup can force them.** What the structured data above *does* drive: the **breadcrumb line**, **entity/knowledge understanding** (Organization + OfferCatalog), and **rich-snippet eligibility**. To earn sitelinks: keep a clear, stable primary nav; use descriptive anchor text to your key pages; ensure the homepage ranks #1 for the brand term; and submit `/sitemap.xml` in Search Console. (Note: Google **retired the Sitelinks Searchbox** feature, and **FAQ/HowTo rich results** are now limited to a narrow set of sites — the markup remains useful for AI/answer engines even where Google no longer renders a special result.)

---

## Round 2 fixes (2026-06-29) — performance + schema polish

| # | Fix | Files | Result |
|---|---|---|---|
| 1 | **Hero video no longer eager** — shipped with `preload="none"` + `data-src` (no `autoplay`); the runtime attaches & plays it on idle, with a dark `#050505` background painting instantly | `app/page.tsx`, `components/site/DigitalAgencyRuntime.tsx` | **~2.6 MB off the critical path** |
| 2 | **Non-paint CSS deferred** — `magnific-popup`, `odometer-theme`, `progressbar` ship `media="print"` and swap to `all` after hydration (+ `<noscript>` fallback) | `components/site/TemplateAssetLinks.tsx`, runtime | 3 fewer render-blocking stylesheets |
| 3 | **LCP unblocked** — dropped `rr_title_anim` (GSAP SplitText) from the hero `<h1>` so it paints immediately; loader fallback trimmed 550 ms → 200 ms | `app/page.tsx`, `homeRenderer.ts`, runtime | Hero text paints on first render |
| 6 | **Removed unused vendor JS** — `Three.js`, `rr-devs-webgl.js`, `tween-max.min.js` (confirmed unreferenced) | `public/template-assets/.../js` | **−784 KB** deploy weight |
| 7 | **OG image `type: image/webp`** added to OpenGraph images | `lib/seo.ts`, `app/layout.tsx` | Better/faster social cards |
| 8 | **Unified address schema** — shared `BUSINESS_POSTAL_ADDRESS` (`PostalAddress`) now used by Organization, home `WebPage`, `AboutPage`, `ContactPage` (was a plain string) | `lib/seo.ts` + 3 pages | Consistent entity address |
| 9 | **Removed `keywords` meta noise** + **added in-body internal links** on blog detail (services/pricing/blog/contact) | `lib/seo.ts`, `app/layout.tsx`, `app/blog/[slug]` | Cleaner head + link equity |

**Reframed after deeper review:**
- **#4 (CLS):** Layout shift is **already mitigated** — `globals.css` reserves space with CSS `aspect-ratio` on every image container (`.hero-media`, `.card-media`, `.detail-layout img`, `.team-detail-portrait`, etc.). The residual benefit is image *optimization* (AVIF/srcset via `next/image`), which **cannot apply to the template-injected raw `<img>` strings** — a genuine architectural limit, not a quick fix.
- **#5 (content depth):** Structural support is done (the `Prose` component renders multi-paragraph bodies); the remaining work is **content authoring**, not code — the seed bodies are ~1 short paragraph.

## Still recommended (need data, content, or larger refactor)

1. **Critical-CSS for `style.css`.** The bulk of the 1.36 MB is `style.css`, which must stay render-blocking. Extracting above-the-fold critical CSS (and deferring the rest) is the big remaining CWV lever — needs visual QA.
2. **Self-host fonts.** Replace the Google Fonts `@import` with self-hosted DM Sans + `<link rel="preload">` to kill the chained request (the `&amp;`→`&` fix was the interim win).
3. **Content depth (#5).** Expand detail bodies into multi-section content with question-phrased H2/H3s and lists.
4. **Entity graph.** Add real `sameAs` profile URLs (GitHub, Crunchbase, Clutch, X) — needs the actual profile URLs.
5. **Reviews.** If testimonials are public, emit `Review` / `AggregateRating` (note Google's self-serving-review limits).
6. **`twitter:site` handle** — only if an X/Twitter account exists (not added to avoid a fabricated handle).
7. **Dedicated 1200×630 OG image** — the current OG image is a portfolio thumbnail, not a purpose-built card.

---

## How to re-measure

- **Core Web Vitals:** <https://pagespeed.web.dev/?url=https://opplexify.com> (mobile)
- **Rich results / schema:** <https://search.google.com/test/rich-results?url=https://opplexify.com>
- **Index coverage & sitemap:** Google Search Console → Pages + Sitemaps (`/sitemap.xml`)

*Audit performed via the SEO/GEO/AEO skill, adapted for a local source-code review.*
