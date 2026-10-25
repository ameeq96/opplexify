import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { seoMetadata } from "../../lib/seo";
import { StreamingPlans } from "../streaming-plans/StreamingPlans";

export const metadata: Metadata = seoMetadata({
  title: "Secure Digital Services Checkout | Opplexify",
  description:
    "Review your selected digital services and continue to secure SafePay checkout.",
  path: "/checkout"
});

type CheckoutPageProps = {
  searchParams: Promise<{
    selection?: string;
    signature?: string;
    status?: string;
    source?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { selection, signature, status, source } = await searchParams;

  return (
    <PublicShell smooth={false} showLoader={false}>
      <main className="digital-agency-template dark body-wrapper body-digital-agency">
        <StreamingPlans
          selection={selection}
          signature={signature}
          initialStatus={status}
          getai={source === "getaitools"}
        />
      </main>
    </PublicShell>
  );
}
