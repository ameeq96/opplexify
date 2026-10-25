import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { seoMetadata } from "../../lib/seo";

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

  if (typeof order === "string" && /^gai_[a-f0-9]{32}$/.test(order)) {
    redirect(`/streaming-plans/order/${order}`);
  }
  const query = new URLSearchParams({ source: "getaitools" });
  if (typeof selection === "string" && typeof signature === "string") {
    query.set("selection", selection);
    query.set("signature", signature);
  }
  redirect(`/checkout?${query.toString()}`);
}
