export const TEMPLATE_ASSET_BASE = "/template-assets/dark/assets";

// Cache-busting version stamped at build time (git short SHA, injected via next.config `env`).
// Lets us serve the template assets with `immutable` long-cache headers while still
// forcing a fresh fetch on every deploy. Falls back to "dev" outside a build.
export const ASSET_VERSION = process.env.NEXT_PUBLIC_ASSET_VERSION || "dev";

export function withAssetVersion(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;
}

export const templateCssFiles = [
  "bootstrap.min.css",
  "fontawesome-pro.css",
  "swiper-bundle.min.css",
  "progressbar.css",
  "meanmenu.min.css",
  "magnific-popup.css",
  "animate.min.css",
  "odometer-theme-default.css",
  "style.css"
] as const;

export const templateScriptFiles = [
  "jquery-3.6.0.min.js",
  "bootstrap.bundle.min.js",
  "jquery.magnific-popup.min.js",
  "swiper-bundle.min.js",
  "odometer.min.js",
  "waypoints.min.js",
  "progressbar.js",
  "gsap.min.js",
  "ScrollSmoother.min.js",
  "ScrollTrigger.min.js",
  "SplitText.min.js",
  "TextPlugin.js",
  "customEase.js",
  "jquery.meanmenu.min.js",
  "backToTop.js",
  "magiccursor.js",
  "main.js"
] as const;

