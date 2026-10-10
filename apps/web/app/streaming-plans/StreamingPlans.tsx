"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./streaming-plans.module.css";

type StreamingPlan = {
  id: number;
  type: "plan" | "reseller";
  providerName: string;
  name: string;
  durationLabel: string;
  credits: number | null;
  price: number;
  currency: string;
  available: boolean;
};

type StreamingDevice = {
  id: number;
  name: string;
  icon: string;
};

type SharedCheckout = {
  expiresAt: string;
  deviceId: number | null;
  totalMinor: number;
  status: "available" | "paid" | "in_use" | "failed";
};

type CatalogResponse = {
  plans: StreamingPlan[];
  devices: StreamingDevice[];
  selectedPackageId: number | null;
  sharedCheckout?: SharedCheckout;
};

type StreamingPlansProps = {
  selection?: string;
  signature?: string;
  initialStatus?: string;
};

const statusMessages: Record<string, string> = {
  cancelled: "SafePay checkout was cancelled. No payment was taken.",
  share_paid: "This shared payment link has already been paid. No further payment is needed.",
  share_in_use: "Payment has already started in another browser. Continue there; do not pay again.",
  share_failed: "This payment link cannot be used again. If your bank shows a debit, contact support before trying again.",
  share_invalid: "This shared payment link is invalid, expired or no longer matches the selected service.",
  unavailable: "Secure checkout is temporarily unavailable. Please try again shortly."
};

const checkoutStorageKey = "opplexify.streaming.checkout-key";
const sourcePackagesUrl = "https://opplexiptv.com/packages";

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  } catch {
    return `${currency.toUpperCase()} ${price.toFixed(2)}`;
  }
}

function createCheckoutKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function estimateSafepayDeductions(price: number) {
  const amountMinor = Math.round(price * 100);
  // Observed USD 11.99 sandbox payment; illustrative proportions, not a fee schedule.
  // Its USD 0.76 fees already included USD 0.05 tax on processing.
  const items = [
    { label: "Processing fee", sampleMinor: 71 },
    { label: "Tax on processing fee", sampleMinor: 5 },
    { label: "Income tax withholding", sampleMinor: 12 },
    { label: "Sales tax withholding", sampleMinor: 24 }
  ].map(({ label, sampleMinor }) => ({
    label,
    amountMinor: Math.round(amountMinor * sampleMinor / 1199)
  }));

  return { items, totalMinor: items.reduce((total, item) => total + item.amountMinor, 0) };
}

export function StreamingPlans({ selection, signature, initialStatus }: StreamingPlansProps) {
  const [plan, setPlan] = useState<StreamingPlan | null>(null);
  const [checkoutKey, setCheckoutKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [sharedCheckout, setSharedCheckout] = useState<SharedCheckout | null>(null);
  const [shareLink, setShareLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);
  const shareRequest = useRef<AbortController | null>(null);
  const shareInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setNativeShareAvailable(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    shareRequest.current?.abort();
    shareRequest.current = null;
    setShareLink(null);
    setSharePanelOpen(false);
    setShareError("");
    setShareFeedback("");
    setSharing(false);
    return () => shareRequest.current?.abort();
  }, [selection, signature]);

  useEffect(() => {
    setSharedCheckout(null);
    if (!selection || !signature) {
      setPlan(null);
      setError("This checkout link is invalid or has expired. Please choose your service again.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const query = new URLSearchParams({ selection, signature });

    const loadCheckout = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/public/streaming/catalog?${query.toString()}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal
        });

        if (!response.ok) throw new Error("Checkout request failed");

        const catalog = (await response.json()) as CatalogResponse;
        if (!Array.isArray(catalog.plans) || !Array.isArray(catalog.devices)) {
          throw new Error("Invalid checkout response");
        }

        const selectedPlan = catalog.plans.find(
          (entry) => entry.id === catalog.selectedPackageId && entry.available
        );
        if (!selectedPlan) {
          setPlan(null);
          setError("This checkout link is invalid or has expired. Please choose your service again.");
          return;
        }

        setPlan(selectedPlan);
        setSharedCheckout(catalog.sharedCheckout ?? null);

        const storageKey = `${checkoutStorageKey}.estimated-fees-v1.${selectedPlan.id}`;
        let key = createCheckoutKey();
        try {
          key = window.sessionStorage.getItem(storageKey) || key;
          window.sessionStorage.setItem(storageKey, key);
        } catch {
          // Session storage can be unavailable in privacy modes; the generated key remains valid.
        }
        setCheckoutKey(key);
      } catch (checkoutError) {
        if ((checkoutError as Error).name !== "AbortError") {
          setPlan(null);
          setError("We could not load your checkout. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadCheckout();
    return () => controller.abort();
  }, [requestVersion, selection, signature]);

  const statusMessage = initialStatus ? statusMessages[initialStatus] : undefined;
  const displayServiceName = "Digital Services";
  const estimatedDeductions = plan?.currency.toUpperCase() === "USD"
    ? estimateSafepayDeductions(plan.price)
    : null;
  const totalMinor = plan ? Math.round(plan.price * 100) + (estimatedDeductions?.totalMinor ?? 0) : 0;
  const sharedNotice = sharedCheckout?.status === "paid"
    ? statusMessages.share_paid
    : sharedCheckout?.status === "in_use"
      ? statusMessages.share_in_use
      : sharedCheckout?.status === "failed"
        ? "This payment link cannot be used again. If your bank shows a debit, contact support before trying again."
        : sharedCheckout && sharedCheckout.totalMinor !== totalMinor
          ? "The service total has changed. Please request a new payment link."
          : "";
  const canCheckout = Boolean(plan && checkoutKey && !sharedNotice);

  async function createShareLink() {
    if (!plan || !selection || !signature || !canCheckout || sharing) return;
    if (sharedCheckout) {
      const url = new URL("/checkout", window.location.origin);
      url.search = new URLSearchParams({ selection, signature }).toString();
      setShareLink({ url: url.toString(), expiresAt: sharedCheckout.expiresAt });
      setSharePanelOpen(true);
      return;
    }
    const controller = new AbortController();
    shareRequest.current = controller;
    setSharing(true);
    setShareError("");
    setShareFeedback("");
    try {
      const response = await fetch("/public/safepay/share-checkout", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          selection, signature, package_id: plan.id,
          device_id: null,
          quoted_total_minor: totalMinor
        })
      });
      if (!response.ok) throw new Error("Please reload your selected service and try sharing again.");
      const result = await response.json() as { url?: string; expiresAt?: string };
      const url = new URL(result.url ?? "");
      if (url.origin !== window.location.origin || url.pathname !== "/checkout" ||
          !url.searchParams.get("selection") || !url.searchParams.get("signature") ||
          !result.expiresAt || !Number.isFinite(Date.parse(result.expiresAt))) {
        throw new Error("The payment link could not be verified. Please try again.");
      }
      if (!controller.signal.aborted) {
        setShareLink({ url: url.toString(), expiresAt: result.expiresAt });
        setSharePanelOpen(true);
      }
    } catch (shareFailure) {
      if (!controller.signal.aborted) setShareError((shareFailure as Error).message || "Could not create the payment link.");
    } finally {
      if (shareRequest.current === controller) setSharing(false);
    }
  }

  async function copyShareLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink.url);
      setShareFeedback("Payment link copied.");
    } catch {
      shareInput.current?.focus();
      shareInput.current?.select();
      setShareFeedback("Select and copy the link above to share it.");
    }
  }

  async function openShareMenu() {
    if (!shareLink || !plan) return;
    try {
      await navigator.share({ title: "Opplexify payment link", text: `${displayServiceName} — ${formatPrice(totalMinor / 100, plan.currency)}`, url: shareLink.url });
      setShareFeedback("Payment link shared.");
    } catch (shareFailure) {
      if ((shareFailure as Error).name !== "AbortError") setShareFeedback("Please use Copy link or WhatsApp instead.");
    }
  }

  return (
    <section className={styles.page} aria-labelledby="streaming-checkout-title">
      <div className={`container rr-container-1650 ${styles.container}`}>
        <header className={styles.header}>
          <span className="section-subtitle">Secure one-time checkout</span>
          <h1 id="streaming-checkout-title">Complete your order</h1>
          <p>
            Your selected service is ready. Confirm the details below and continue to SafePay.
          </p>
        </header>

        {statusMessage ? (
          <div className={styles.notice} role="status">
            {statusMessage}
          </div>
        ) : null}

        {loading ? (
          <div className={styles.loading} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            Loading your secure checkout…
          </div>
        ) : error || !plan ? (
          <div className={styles.error} role="alert">
            <p>{error || "This checkout link is unavailable."}</p>
            {selection && signature ? (
              <button type="button" onClick={() => setRequestVersion((version) => version + 1)}>
                Try again
              </button>
            ) : null}
            <a href={sourcePackagesUrl}>Choose a service</a>
          </div>
        ) : (
          <div className={styles.checkoutLayout}>
            <div className={styles.checkoutSteps}>
              <section className={styles.selectionPanel} aria-labelledby="selected-package-title">
                <div className={styles.stepHeading}>
                  <span>1</span>
                  <div>
                    <p>Selected service</p>
                    <h2 id="selected-package-title">Review your selection</h2>
                  </div>
                </div>

                <div className={styles.selectedPackage}>
                  <div>
                    <span>Service</span>
                    <strong>{displayServiceName}</strong>
                  </div>
                </div>
              </section>
            </div>

            <aside className={styles.orderSummary} aria-labelledby="order-summary-title">
              <span className={styles.summaryEyebrow}>Order summary</span>
              <h2 id="order-summary-title">{displayServiceName}</h2>

              <dl className={styles.summaryDetails}>
                <div>
                  <dt>Service price</dt>
                  <dd>{formatPrice(plan.price, plan.currency)}</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>{displayServiceName}</dd>
                </div>
              </dl>

              {estimatedDeductions ? (
                <section aria-labelledby="estimated-fees-title">
                  <p id="estimated-fees-title" className={styles.summaryEyebrow}>Estimated fee / tax surcharge</p>
                  <dl className={styles.summaryDetails}>
                    {estimatedDeductions.items.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{formatPrice(item.amountMinor / 100, plan.currency)}</dd>
                      </div>
                    ))}
                    <div>
                      <dt>Added surcharge</dt>
                      <dd>{formatPrice(estimatedDeductions.totalMinor / 100, plan.currency)}</dd>
                    </div>
                  </dl>
                  <p className={styles.paymentNote}>
                    This merchant surcharge is added to your service price to cover estimated processing fees
                    and taxes, based on a previous USD 11.99 sandbox payment. It is not a confirmed SafePay fee
                    or tax assessment; actual deductions may differ. You will pay the total shown below.
                  </p>
                </section>
              ) : null}

              <div className={styles.total}>
                <span>Total to pay</span>
                <strong>{formatPrice(totalMinor / 100, plan.currency)}</strong>
              </div>

              {sharedNotice ? <p className={styles.notice} role="status">{sharedNotice}</p> : null}
              {sharedCheckout && !sharedNotice ? (
                <p className={styles.paymentNote}>
                  Shared checkout: use your own details in SafePay. The order, service and invoice will belong to the payer.
                </p>
              ) : null}

              <form action="/public/safepay/checkout" method="post" className={styles.checkoutForm}>
                <input type="hidden" name="package_id" value={plan.id} />
                <input type="hidden" name="selection" value={selection} />
                <input type="hidden" name="signature" value={signature} />
                <input type="hidden" name="checkout_key" value={checkoutKey} />
                <input type="hidden" name="quoted_total_minor" value={totalMinor} />
                {sharedCheckout?.deviceId != null ? <input type="hidden" name="device_id" value={sharedCheckout.deviceId} /> : null}
                <button type="submit" disabled={!canCheckout || sharing}>
                  Continue to SafePay
                </button>
              </form>
              <button type="button" className={styles.sharePaymentButton}
                disabled={!canCheckout || sharing} aria-expanded={sharePanelOpen} aria-controls="share-payment-panel"
                onClick={() => shareLink ? setSharePanelOpen((open) => !open) : void createShareLink()}>
                {sharing ? "Creating secure link…" : "Share payment link"}
              </button>
              {shareError ? <p className={styles.sharePaymentFeedback} role="alert">{shareError}</p> : null}
              {shareLink && sharePanelOpen ? (
                <section id="share-payment-panel" className={styles.sharePaymentPanel} aria-label="Share payment link">
                  <h3>Let someone pay directly</h3>
                  <p>The recipient sees this service and total, then pays using their own name and email.</p>
                  <label htmlFor="share-payment-url">Secure Opplexify checkout link</label>
                  <input ref={shareInput} id="share-payment-url" type="text" readOnly value={shareLink.url}
                    onFocus={(event) => event.currentTarget.select()} />
                  <div className={styles.sharePaymentActions}>
                    <button type="button" onClick={() => void copyShareLink()}>Copy link</button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Pay securely for ${displayServiceName}: ${shareLink.url}`)}`}
                      target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    {nativeShareAvailable ? <button type="button" onClick={() => void openShareMenu()}>Share…</button> : null}
                  </div>
                  <p>Expires {new Date(shareLink.expiresAt).toLocaleString()}. One payment per link.</p>
                  <p>Once payment starts, continue in that browser. No card details or payment-session secrets are included in this link.</p>
                  <span className={styles.sharePaymentFeedback} role="status" aria-live="polite">{shareFeedback}</span>
                </section>
              ) : null}

              <p className={styles.paymentNote}>
                One-time payment. Your amount is verified securely before SafePay opens.
              </p>
              <a className={styles.changePackage} href={sourcePackagesUrl}>
                Change service
              </a>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
