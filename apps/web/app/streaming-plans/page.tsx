import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";
import { StreamingPlans } from "./StreamingPlans";

export const metadata: Metadata = seoMetadata({
  title: "Secure Digital TV Checkout | Opplexify",
  description:
    "Review your selected digital TV streaming package, confirm your device and continue to secure SafePay checkout.",
  path: "/streaming-plans"
});

type StreamingPlansPageProps = {
  searchParams: Promise<{
    selection?: string;
    signature?: string;
    status?: string;
  }>;
};

export default async function StreamingPlansPage({ searchParams }: StreamingPlansPageProps) {
  const { selection, signature, status } = await searchParams;

  return (
    <PublicShell smooth={false} showLoader={false}>
      <main className="digital-agency-template dark body-wrapper body-digital-agency">
        <StreamingPlans
          selection={selection}
          signature={signature}
          initialStatus={status}
        />
      </main>
    </PublicShell>
  );
}
