import type { Metadata } from "next";
import { PublicShell } from "../../../../components/site/PublicShell";
import { fetchApi } from "../../../../lib/api";
import styles from "../../streaming-plans.module.css";

export const metadata: Metadata = {
  title: "Order Status | Opplexify",
  robots: { index: false, follow: false }
};

type OrderStatus = "PENDING" | "CHECKOUT_STARTED" | "PAID" | "FAILED" | "CANCELLED";

type StreamingOrder = {
  token: string;
  status: OrderStatus;
  providerName: string;
  packageName: string;
  durationLabel: string | null;
  amount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
};

type OrderResponse = {
  order: StreamingOrder;
};

type OrderStatusPageProps = {
  params: Promise<{ publicToken: string }>;
};

const statusContent: Record<OrderStatus, { label: string; title: string; message: string }> = {
  PAID: {
    label: "Payment confirmed",
    title: "Your order is confirmed.",
    message: "Safepay has verified your payment. Our team will now process the selected package."
  },
  PENDING: {
    label: "Payment pending",
    title: "We are waiting for payment confirmation.",
    message: "Your order is saved. This page will reflect the confirmed status after Safepay verifies the payment."
  },
  CHECKOUT_STARTED: {
    label: "Verification in progress",
    title: "Your payment is being verified.",
    message: "Safepay checkout has started. Please allow a short time for the final payment confirmation."
  },
  FAILED: {
    label: "Payment not confirmed",
    title: "We could not verify this payment.",
    message: "No confirmed payment is attached to this order. You can choose the package again and retry."
  },
  CANCELLED: {
    label: "Checkout cancelled",
    title: "This checkout was cancelled.",
    message: "No payment was taken. You can choose the package again whenever you are ready."
  }
};

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

export default async function OrderStatusPage({ params }: OrderStatusPageProps) {
  const { publicToken } = await params;
  const payload = await fetchApi<OrderResponse | null>(
    `/public/streaming/orders/${encodeURIComponent(publicToken)}`,
    null,
    { noStore: true }
  );
  const order = payload?.order;
  const content = order ? statusContent[order.status] : null;

  return (
    <PublicShell smooth={false} showLoader={false}>
      <main className="digital-agency-template dark body-wrapper body-digital-agency">
        <section className={styles.page} aria-labelledby="order-status-title">
          <div className={`container ${styles.orderContainer}`}>
            <article className={styles.orderCard}>
              <span className="section-subtitle">{content?.label ?? "Order unavailable"}</span>
              <h1 id="order-status-title">{content?.title ?? "We could not find this order."}</h1>
              <p className={styles.orderMessage}>
                {content?.message ?? "Check the link and try again, or contact support if you need help."}
              </p>

              {order ? (
                <dl className={styles.orderDetails}>
                  <div>
                    <dt>Service</dt>
                    <dd>Digital Subscription</dd>
                  </div>
                  <div>
                    <dt>Package</dt>
                    <dd>{order.durationLabel ? `${order.durationLabel} Package` : "Subscription Package"}</dd>
                  </div>
                  {order.durationLabel ? (
                    <div>
                      <dt>Duration</dt>
                      <dd>{digitalTvText(order.durationLabel)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Amount</dt>
                    <dd>{formatPrice(order.amount, order.currency)}</dd>
                  </div>
                  <div>
                    <dt>Order reference</dt>
                    <dd>{order.token}</dd>
                  </div>
                </dl>
              ) : null}

              <div className={styles.orderActions}>
                <a className={styles.primaryLink} href="https://opplexiptv.com/packages">
                  Choose package
                </a>
                <a className={styles.secondaryLink} href="https://opplexiptv.com/contact">
                  Contact support
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
