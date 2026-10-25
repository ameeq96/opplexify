import type { Metadata } from "next";
import { PublicShell } from "../../components/site/PublicShell";
import { SAFEPAY_MERCHANT_NAME, seoMetadata } from "../../lib/seo";
import { AiCheckout } from "./AiCheckout";

export const metadata: Metadata = seoMetadata({
  title: "GetAI Tools Checkout | Opplexify",
  description: "Review your selected GetAI Tools plan and USD total before continuing to SafePay.",
  path: "/ai-checkout",
  noIndex: true
});

type AiCheckoutPageProps = {
  searchParams: Promise<{ selection?: string; signature?: string; order?: string }>;
};

export default async function AiCheckoutPage({ searchParams }: AiCheckoutPageProps) {
  const { selection, signature, order } = await searchParams;

  return (
    <PublicShell smooth={false} showLoader={false}>
      <main className="digital-agency-template dark body-wrapper body-digital-agency">
        <AiCheckout selection={selection} signature={signature} order={order} merchantName={SAFEPAY_MERCHANT_NAME} />
      </main>
    </PublicShell>
  );
}
