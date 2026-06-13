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
export function TemplateAssetLinks() {
  return (
    <>
      {templateCssFiles.map((file) => (
        <link key={file} rel="stylesheet" href={withAssetVersion(`${A}/css/${file}`)} />
      ))}
      {templateScriptFiles.map((file) => (
        <link key={`preload-${file}`} rel="preload" as="script" href={withAssetVersion(`${A}/js/${file}`)} />
      ))}
    </>
  );
}
