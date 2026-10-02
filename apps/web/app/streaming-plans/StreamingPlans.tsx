"use client";

import { useEffect, useState } from "react";
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

type CatalogResponse = {
  plans: StreamingPlan[];
  devices: StreamingDevice[];
  selectedPackageId: number | null;
};

type StreamingPlansProps = {
  selection?: string;
  signature?: string;
  initialStatus?: string;
};

const statusMessages: Record<string, string> = {
  cancelled: "SafePay checkout was cancelled. No payment was taken.",
  unavailable: "Secure checkout is temporarily unavailable. Please try again shortly."
};

const checkoutStorageKey = "opplexify.streaming.checkout-key";
const sourcePackagesUrl = "https://opplexiptv.com/packages";

function digitalTvText(value: string) {
  return value.replace(/\bIPTV\b/gi, "Digital TV");
}

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
  const [devices, setDevices] = useState<StreamingDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [checkoutKey, setCheckoutKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!selection || !signature) {
      setPlan(null);
      setError("This checkout link is invalid or has expired. Please choose your package again.");
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
          setError("This checkout link is invalid or has expired. Please choose your package again.");
          return;
        }

        setPlan(selectedPlan);
        setDevices(catalog.devices);
        setSelectedDeviceId("");

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
  const needsDevice = plan?.type === "plan";
  const displayPackageName = plan
    ? `${plan.type === "reseller" && plan.credits ? `${plan.credits} Credits` : plan.durationLabel} Package`
    : "";
  const canCheckout = Boolean(plan && checkoutKey && (!needsDevice || selectedDeviceId));
  const estimatedDeductions = plan?.currency.toUpperCase() === "USD"
    ? estimateSafepayDeductions(plan.price)
    : null;
  const totalMinor = plan ? Math.round(plan.price * 100) + (estimatedDeductions?.totalMinor ?? 0) : 0;

  return (
    <section className={styles.page} aria-labelledby="streaming-checkout-title">
      <div className={`container rr-container-1650 ${styles.container}`}>
        <header className={styles.header}>
          <span className="section-subtitle">Secure one-time checkout</span>
          <h1 id="streaming-checkout-title">Complete your order</h1>
          <p>
            Your selected package is ready. Confirm the details below and continue to SafePay.
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
            <a href={sourcePackagesUrl}>Choose a package</a>
          </div>
        ) : (
          <div className={styles.checkoutLayout}>
            <div className={styles.checkoutSteps}>
              <section className={styles.selectionPanel} aria-labelledby="selected-package-title">
                <div className={styles.stepHeading}>
                  <span>1</span>
                  <div>
                    <p>Selected package</p>
                    <h2 id="selected-package-title">Review your selection</h2>
                  </div>
                </div>

                <div className={styles.selectedPackage}>
                  <div>
                    <span>Service</span>
                    <strong>Digital Subscription</strong>
                  </div>
                  <div>
                    <span>Package</span>
                    <strong>{displayPackageName}</strong>
                  </div>
                  <div>
                    <span>{plan.type === "reseller" ? "Credits" : "Subscription"}</span>
                    <strong>
                      {plan.type === "reseller" && plan.credits
                        ? `${plan.credits} Credits`
                        : digitalTvText(plan.durationLabel)}
                    </strong>
                  </div>
                </div>
              </section>

              {needsDevice ? (
                <section className={styles.selectionPanel} aria-labelledby="device-title">
                  <div className={styles.stepHeading}>
                    <span>2</span>
                    <div>
                      <p>Compatibility</p>
                      <h2 id="device-title">Choose your device</h2>
                    </div>
                  </div>

                  <div className={styles.deviceGrid}>
                    {devices.map((device) => {
                      const value = String(device.id);
                      const selected = selectedDeviceId === value;
                      return (
                        <label className={selected ? styles.selectedDevice : undefined} key={device.id}>
                          <input
                            type="radio"
                            name="checkout_device"
                            value={value}
                            checked={selected}
                            onChange={(event) => setSelectedDeviceId(event.target.value)}
                          />
                          <span className={styles.deviceMark} aria-hidden="true">
                            {selected ? "✓" : ""}
                          </span>
                          <strong>{device.name}</strong>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className={styles.orderSummary} aria-labelledby="order-summary-title">
              <span className={styles.summaryEyebrow}>Order summary</span>
              <h2 id="order-summary-title">{displayPackageName}</h2>

              <dl className={styles.summaryDetails}>
                <div>
                  <dt>Package price</dt>
                  <dd>{formatPrice(plan.price, plan.currency)}</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>Digital Subscription</dd>
                </div>
                <div>
                  <dt>{plan.type === "reseller" ? "Package" : "Duration"}</dt>
                  <dd>
                    {plan.type === "reseller" && plan.credits
                      ? `${plan.credits} Credits`
                      : digitalTvText(plan.durationLabel)}
                  </dd>
                </div>
                {needsDevice ? (
                  <div>
                    <dt>Device</dt>
                    <dd>
                      {devices.find((device) => String(device.id) === selectedDeviceId)?.name ||
                        "Select a device"}
                    </dd>
                  </div>
                ) : null}
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
                    This merchant surcharge is added to your package price to cover estimated processing fees
                    and taxes, based on a previous USD 11.99 sandbox payment. It is not a confirmed SafePay fee
                    or tax assessment; actual deductions may differ. You will pay the total shown below.
                  </p>
                </section>
              ) : null}

              <div className={styles.total}>
                <span>Total to pay</span>
                <strong>{formatPrice(totalMinor / 100, plan.currency)}</strong>
              </div>

              <form action="/public/safepay/checkout" method="post" className={styles.checkoutForm}>
                <input type="hidden" name="package_id" value={plan.id} />
                <input type="hidden" name="selection" value={selection} />
                <input type="hidden" name="signature" value={signature} />
                <input type="hidden" name="checkout_key" value={checkoutKey} />
                <input type="hidden" name="quoted_total_minor" value={totalMinor} />
                {needsDevice ? <input type="hidden" name="device_id" value={selectedDeviceId} /> : null}
                <button type="submit" disabled={!canCheckout}>
                  Continue to SafePay
                </button>
              </form>

              <p className={styles.paymentNote}>
                One-time payment. Your amount is verified securely before SafePay opens.
              </p>
              <a className={styles.changePackage} href={sourcePackagesUrl}>
                Change package
              </a>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
