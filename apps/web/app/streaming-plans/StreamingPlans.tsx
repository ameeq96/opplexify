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
  resumeCheckout?: {
    expiresAt: string;
    deviceId: number | null;
    totalMinor: number;
    status: "available" | "paid" | "processing" | "cancelled" | "failed" | "unavailable";
  };
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
  const [resumeToken, setResumeToken] = useState("");
  const [locationReady, setLocationReady] = useState(false);
  const [resumedCheckout, setResumedCheckout] = useState<CatalogResponse["resumeCheckout"] | null>(null);
  const [resumeLink, setResumeLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [savingResume, setSavingResume] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState("");
  const [shareLink, setShareLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const checkoutSubmitting = useRef(false);
  const checkoutError = useRef<HTMLDivElement | null>(null);
  const shareRequest = useRef<AbortController | null>(null);
  const shareInput = useRef<HTMLInputElement | null>(null);
  const resumeInput = useRef<HTMLInputElement | null>(null);
  const resumeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const readResume = () => {
      const values = new URLSearchParams(window.location.hash.slice(1));
      setResumeToken(values.get("resume") || "");
      setLocationReady(true);
    };
    readResume();
    window.addEventListener("hashchange", readResume);
    return () => window.removeEventListener("hashchange", readResume);
  }, []);

  useEffect(() => {
    setNativeShareAvailable(typeof navigator.share === "function");
    const restoreCheckout = () => {
      checkoutSubmitting.current = false;
      setSubmitting(false);
    };
    window.addEventListener("pageshow", restoreCheckout);
    return () => window.removeEventListener("pageshow", restoreCheckout);
  }, []);

  useEffect(() => {
    if (!loading && error) checkoutError.current?.focus();
  }, [error, loading]);

  useEffect(() => {
    checkoutSubmitting.current = false;
    setSubmitting(false);
    shareRequest.current?.abort();
    shareRequest.current = null;
    setShareLink(null);
    setSharePanelOpen(false);
    setShareError("");
    setShareFeedback("");
    setSharing(false);
    setResumeLink(null);
    setResumeFeedback("");
    resumeRequest.current?.abort();
    resumeRequest.current = null;
    setSavingResume(false);
    return () => { shareRequest.current?.abort(); resumeRequest.current?.abort(); };
  }, [selection, signature, resumeToken]);

  useEffect(() => {
    setSharedCheckout(null);
    setResumedCheckout(null);
    if (!locationReady) return;
    if (!resumeToken && (!selection || !signature)) {
      setPlan(null);
      setError("This checkout link is invalid or has expired. Please choose your service again.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const query = new URLSearchParams({ selection: selection || "", signature: signature || "" });

    const loadCheckout = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(resumeToken ? "/public/streaming/checkout-resume" : `/public/streaming/catalog?${query.toString()}`, {
          ...(resumeToken ? { method: "POST", body: JSON.stringify({ resume_token: resumeToken }) } : {}),
          cache: "no-store",
          headers: { Accept: "application/json", ...(resumeToken ? { "Content-Type": "application/json" } : {}) },
          signal: controller.signal
        });

        if (!response.ok) throw new Error(resumeToken ? "Resume request failed" : "Checkout request failed");

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
        if (resumeToken) {
          if (!catalog.resumeCheckout || !["available", "paid", "processing", "cancelled", "failed", "unavailable"].includes(catalog.resumeCheckout.status)) {
            throw new Error("Invalid resume response");
          }
          setResumedCheckout(catalog.resumeCheckout);
          setCheckoutKey("");
          return;
        }

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
          setError(resumeToken
            ? "This saved payment link is invalid, expired, unavailable or belongs to another browser. Use the original browser, or contact support before paying again."
            : "We could not load your checkout. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadCheckout();
    return () => controller.abort();
  }, [requestVersion, selection, signature, resumeToken, locationReady]);

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
  const resumeNotice = resumedCheckout?.status === "paid"
    ? "This payment has already been paid. Do not pay again."
    : resumedCheckout?.status === "processing"
      ? "The original payment is still processing or has no reusable payment session. Refresh its status or contact support; do not start another payment."
      : resumedCheckout && resumedCheckout.status !== "available"
        ? "The original payment is closed, has not been started or is no longer available. Check its status with support before paying again."
        : resumedCheckout && resumedCheckout.totalMinor !== totalMinor
          ? "The price has changed. This saved payment cannot be continued. Check its status with support before paying again."
          : "";
  const canCheckout = Boolean(plan && (resumeToken ? resumedCheckout?.status === "available" && !resumeNotice : checkoutKey && !sharedNotice));

  async function savePaymentResume() {
    if (!plan || !selection || !signature || resumeToken || !canCheckout || savingResume || submitting) return;
    setSavingResume(true);
    setResumeFeedback("");
    const controller = new AbortController();
    resumeRequest.current = controller;
    try {
      const response = await fetch("/public/safepay/resume-checkout", {
        method: "POST", cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ selection, signature, package_id: plan.id, checkout_key: checkoutKey,
          device_id: sharedCheckout?.deviceId ?? null, quoted_total_minor: totalMinor })
      });
      if (!response.ok) throw new Error("This payment cannot be saved here. Reload your checkout or check the original payment with support.");
      const saved = await response.json() as { url?: string; expiresAt?: string };
      const url = new URL(saved.url || "");
      if (url.origin !== window.location.origin || url.pathname !== "/checkout" || url.search ||
          !/^#resume=rc3_[A-Za-z0-9_-]{60,2048}$/.test(url.hash) || !saved.expiresAt ||
          !Number.isFinite(Date.parse(saved.expiresAt))) throw new Error("The saved payment link could not be verified.");
      if (!controller.signal.aborted) {
        setResumeLink({ url: url.toString(), expiresAt: saved.expiresAt });
        setResumeFeedback("Saved payment link ready. Copy it and keep it private; it only works in this browser.");
      }
    } catch (failure) {
      if (!controller.signal.aborted) setResumeFeedback((failure as Error).message || "The payment link could not be saved.");
    } finally {
      if (resumeRequest.current === controller) setSavingResume(false);
    }
  }

  async function copyPaymentResume() {
    if (!resumeLink) return;
    try {
      await navigator.clipboard.writeText(resumeLink.url);
      setResumeFeedback("Private payment-resume link copied. Use it in this original browser only.");
    } catch {
      resumeInput.current?.focus();
      resumeInput.current?.select();
      setResumeFeedback("Select and copy the private link above.");
    }
  }

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
          <div ref={checkoutError} className={styles.error} role="alert" tabIndex={-1}>
            <p>{error || "This checkout link is unavailable."}</p>
            {(selection && signature) || resumeToken ? (
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
              {resumeNotice ? <p className={styles.notice} role="status">{resumeNotice}</p> : null}
              {resumedCheckout ? <section className={styles.resumeNotice} aria-label="Saved payment status">
                <p>This private link reopens only the original payment in this browser. It never creates a replacement order or payment session.</p>
                <button type="button" onClick={() => setRequestVersion((version) => version + 1)}>Refresh saved payment status</button>
                <a href="https://opplexiptv.com/contact">Contact support before paying again</a>
              </section> : null}
              {sharedCheckout && !sharedNotice ? (
                <p className={styles.paymentNote}>
                  Shared checkout: use your own details in SafePay. The order, service and invoice will belong to the payer.
                </p>
              ) : null}

              <form action="/public/safepay/checkout" method="post" className={styles.checkoutForm}
                aria-busy={submitting} aria-describedby="checkout-progress"
                onSubmit={(event) => {
                  if (checkoutSubmitting.current || !canCheckout || sharing || savingResume) {
                    event.preventDefault();
                    return;
                  }
                  checkoutSubmitting.current = true;
                  setSubmitting(true);
                }}>
                {resumeToken ? <input type="hidden" name="resume_token" value={resumeToken} /> : <>
                <input type="hidden" name="package_id" value={plan.id} />
                <input type="hidden" name="selection" value={selection} />
                <input type="hidden" name="signature" value={signature} />
                <input type="hidden" name="checkout_key" value={checkoutKey} />
                <input type="hidden" name="quoted_total_minor" value={totalMinor} />
                {sharedCheckout?.deviceId != null ? <input type="hidden" name="device_id" value={sharedCheckout.deviceId} /> : null}
                </>}
                <button type="submit" disabled={!canCheckout || sharing || savingResume || submitting}>
                  {submitting ? "Opening SafePay…" : resumeToken ? "Continue original SafePay payment" : "Continue to SafePay"}
                </button>
              </form>
              <p id="checkout-progress" className={styles.checkoutProgress} role="status" aria-live="polite" aria-atomic="true">
                {submitting ? "Your checkout is being prepared. Please wait and do not pay again. If the page does not continue, check your order or contact support before retrying." : ""}
              </p>
              {!resumeToken ? <section className={styles.resumeNotice} aria-label="Save original payment">
                <button type="button" className={styles.sharePaymentButton} disabled={!canCheckout || sharing || savingResume || submitting}
                  onClick={() => void savePaymentResume()}>{savingResume ? "Saving private link…" : "Save payment for later"}</button>
                <p>Save this before opening SafePay. After payment starts, this link can reopen only that same payment session for 24 hours in this browser. It does not email anyone or save card details. It cannot restore a closed payment or work on another device.</p>
                {resumeLink ? <>
                  <label htmlFor="payment-resume-url">Private same-browser payment link</label>
                  <input ref={resumeInput} id="payment-resume-url" readOnly value={resumeLink.url} onFocus={(event) => event.currentTarget.select()} />
                  <button type="button" onClick={() => void copyPaymentResume()}>Copy private link</button>
                  <p>Expires {new Date(resumeLink.expiresAt).toLocaleString()}. Keep the original browser cookies; do not share this link.</p>
                </> : null}
                <p role="status" aria-live="polite">{resumeFeedback}</p>
              </section> : null}
              {!resumeToken ? <button type="button" className={styles.sharePaymentButton}
                disabled={!canCheckout || sharing || submitting} aria-expanded={sharePanelOpen} aria-controls="share-payment-panel"
                onClick={() => shareLink ? setSharePanelOpen((open) => !open) : void createShareLink()}>
                {sharing ? "Creating secure link…" : "Share payment link"}
              </button> : null}
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
