import { TEMPLATE_ASSET_BASE as A, templateCssFiles, templateScriptFiles, withAssetVersion } from "./templateAssets";

/**
 * Server-rendered <head> hints for the template runtime.
 *
 * - Stylesheets are emitted with a `?v=` version stamp so they can be cached
 *   `immutable` yet still bust on deploy.
 * - The animation scripts (~648KB: jQuery, GSAP, ScrollSmoother, Swiper, …) are
 *   declared as `rel="preload"` here so the browser starts downloading them while
 *   the HTML is still parsing — instead of after React hydration, which is where
 *   the old client-side injector ran. Execution order is still controlled by the
 *   serial loader in DigitalAgencyRuntime; this only changes fetch timing.
 */
// Stylesheets with no role in the first paint (lightbox, number counters, scroll
// progress bar). Shipped with media="print" so they don't block rendering, then
// swapped to media="all" by DigitalAgencyRuntime once the page is interactive.
const DEFERRED_CSS = new Set<string>(["magnific-popup.css", "odometer-theme-default.css", "progressbar.css"]);

export function TemplateAssetLinks() {
  const deferredCss = templateCssFiles.filter((file) => DEFERRED_CSS.has(file));

  return (
    <>
      {templateCssFiles.map((file) =>
        DEFERRED_CSS.has(file) ? (
          <link key={file} rel="stylesheet" href={withAssetVersion(`${A}/css/${file}`)} media="print" data-defer="" />
        ) : (
          <link key={file} rel="stylesheet" href={withAssetVersion(`${A}/css/${file}`)} />
        )
      )}
      {deferredCss.length ? (
        <noscript>
          {deferredCss.map((file) => (
            <link key={`ns-${file}`} rel="stylesheet" href={withAssetVersion(`${A}/css/${file}`)} />
          ))}
        </noscript>
      ) : null}
      {templateScriptFiles.map((file) => (
        <link key={`preload-${file}`} rel="preload" as="script" href={withAssetVersion(`${A}/js/${file}`)} />
      ))}
    </>
  );
}
