import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME, THEME_COLOR } from "../lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Opplexify - Web Development Agency",
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      {
        src: "/template-assets/dark/assets/imgs/logo/favicon.svg",
        sizes: "64x64",
        type: "image/svg+xml"
      },
      {
        src: "/template-assets/dark/assets/imgs/logo/app-icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any"
      },
      {
        src: "/template-assets/dark/assets/imgs/logo/app-icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any"
      }
    ]
  };
}
