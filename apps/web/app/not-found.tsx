import Link from "next/link";
import type { Metadata } from "next";
import { PublicShell } from "../components/site/PublicShell";
import { seoMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...seoMetadata({
    title: "Page Not Found",
    description: "The requested Opplexify page could not be found.",
    path: "/404",
    noIndex: true
  })
};

export default function NotFound() {
  return (
    <PublicShell>
      <section className="page-hero">
        <div className="container rr-container-1650">
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p>The requested page is not published in the CMS.</p>
          <Link className="btn accent" href="/">
            Back home
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
