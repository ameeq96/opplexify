import { randomUUID } from "node:crypto";
import nodemailer, { Transporter } from "nodemailer";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma/prisma.service";
import { createPaymentInvoice } from "./payment-invoice";

const pollIntervalMs = 30_000;
const leaseDurationMs = 5 * 60_000;
const maximumAttempts = 5;
const batchSize = 5;
let workerStarted = false;
let processing = false;
let configurationWarningShown = false;

type Delivery = Prisma.InvoiceEmailDeliveryGetPayload<{ include: { order: true } }>;
type Invoice = Parameters<typeof createPaymentInvoice>[0];
type SmtpConfiguration = {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export function invoiceEmailRecipient(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 191 || /[^\x21-\x7e]/.test(input)) return null;
  const parts = input.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..") ||
      !/^[A-Za-z0-9!#$%&'*+/=?^_\x60{|}~.-]+$/.test(local)) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) =>
    !/^[A-Za-z0-9-]{1,63}$/.test(label) || label.startsWith("-") || label.endsWith("-"))) return null;
  return local + "@" + domain.toLowerCase();
}

function workerEnabled() {
  return process.env.INVOICE_EMAIL_ENABLED === "true" &&
    process.env.NODE_ENV === "production" &&
    process.env.SAFEPAY_ENVIRONMENT?.trim().toLowerCase() === "production";
}

function smtpConfiguration(): SmtpConfiguration | null {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const portText = process.env.SMTP_PORT?.trim() ?? "";
  const port = Number(portText);
  const user = process.env.SMTP_USER?.trim() ?? "";
  const password = process.env.SMTP_PASS ?? "";
  const fromEmail = invoiceEmailRecipient(process.env.SMTP_FROM_EMAIL?.trim());
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "Opplexify";
  if (!host || host.length > 253 || !/^[A-Za-z0-9.-]+$/.test(host) ||
      !/^\d{1,5}$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535 ||
      !user || !password || !fromEmail || fromName.length > 100 || /[\x00-\x1f\x7f]/.test(fromName)) {
    return null;
  }
  return { host, port, user, password, fromEmail, fromName };
}

function validText(value: unknown, allowEmpty = false): value is string {
  return typeof value === "string" && value.length <= 500 &&
    (allowEmpty || value.trim().length > 0) && !/[\x00-\x1f\x7f]/.test(value);
}

function invoiceSnapshot(delivery: Delivery): Invoice | null {
  const snapshot = delivery.invoiceData;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return null;
  if (typeof snapshot.id !== "string" || !/^[A-Za-z0-9_-]{1,191}$/.test(snapshot.id) ||
      snapshot.id !== delivery.orderId || snapshot.id !== delivery.order.id ||
      !validText(snapshot.packageType) || !validText(snapshot.packageName) || !validText(snapshot.providerName) ||
      !(snapshot.durationLabel === null || validText(snapshot.durationLabel, true)) ||
      typeof snapshot.amountMinor !== "number" || !Number.isSafeInteger(snapshot.amountMinor) || snapshot.amountMinor <= 0 ||
      snapshot.amountMinor !== delivery.order.amountMinor ||
      typeof snapshot.currency !== "string" || !/^[A-Z]{3}$/.test(snapshot.currency) ||
      snapshot.currency !== delivery.order.currency || typeof snapshot.paidAt !== "string") return null;
  const paidAt = new Date(snapshot.paidAt);
  if (!Number.isFinite(paidAt.getTime()) || paidAt.toISOString() !== snapshot.paidAt ||
      !delivery.order.paidAt || paidAt.getTime() !== delivery.order.paidAt.getTime()) return null;
  return {
    id: snapshot.id,
    packageType: snapshot.packageType,
    packageName: snapshot.packageName,
    providerName: snapshot.providerName,
    durationLabel: snapshot.durationLabel,
    amountMinor: snapshot.amountMinor,
    currency: snapshot.currency,
    paidAt
  };
}

async function finishDelivery(
  delivery: Delivery,
  status: "SENT" | "FAILED" | "UNKNOWN" | "RETRY",
  lastErrorCode: string | null,
  nextAttemptAt?: Date
) {
  return prisma.invoiceEmailDelivery.updateMany({
    where: { id: delivery.id, status: "SENDING", claimToken: delivery.claimToken },
    data: {
      status,
      lastErrorCode,
      claimToken: null,
      leaseExpiresAt: null,
      ...(status === "SENT" ? { sentAt: new Date() } : {}),
      ...(nextAttemptAt ? { nextAttemptAt } : {})
    }
  });
}

async function retryDelivery(delivery: Delivery, errorCode: string) {
  if (delivery.attempts >= maximumAttempts) {
    await finishDelivery(delivery, "FAILED", errorCode);
    return;
  }
  const delay = Math.min(30 * 60_000, 60_000 * 2 ** Math.max(0, delivery.attempts - 1));
  await finishDelivery(delivery, "RETRY", errorCode, new Date(Date.now() + delay));
}

function failedBeforeMessage(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const details = error as { code?: unknown; command?: unknown; syscall?: unknown; message?: unknown };
  const command = typeof details.command === "string" ? details.command : "";
  if (details.code === "EDNS" ||
      ["EHLO", "HELO", "STARTTLS", "MAIL FROM", "RCPT TO"].includes(command) ||
      /^AUTH(?: [A-Z0-9_-]+)?$/.test(command)) return true;
  // Nodemailer also tags post-DATA socket errors/timeouts as CONN. Only these
  // positively identified DNS/connect/TLS/greeting failures precede transmission.
  return command === "CONN" && (
    details.code === "ETLS" || details.syscall === "connect" ||
    (details.code === "ETIMEDOUT" &&
      (details.message === "Connection timeout" || details.message === "Greeting never received"))
  );
}

async function deliverInvoice(delivery: Delivery, transporter: Transporter, config: SmtpConfiguration) {
  if (!delivery.claimToken || delivery.status !== "SENDING") return;
  if (delivery.order.status !== "PAID") {
    await finishDelivery(delivery, "FAILED", "ORDER_NOT_PAID");
    return;
  }
  const recipient = invoiceEmailRecipient(delivery.recipient);
  if (!recipient) {
    await finishDelivery(delivery, "FAILED", "RECIPIENT_INVALID");
    return;
  }
  const invoice = invoiceSnapshot(delivery);
  if (!invoice || delivery.messageId.length > 191 ||
      delivery.messageId !== "<opplexify-invoice-" + invoice.id + "@opplexify.com>") {
    await finishDelivery(delivery, "FAILED", "INVOICE_SNAPSHOT_INVALID");
    return;
  }

  let pdf: Buffer;
  try {
    pdf = await createPaymentInvoice(invoice);
  } catch {
    await retryDelivery(delivery, "INVOICE_RENDER_FAILED");
    return;
  }

  // Renew and fence immediately before SMTP; a lost or expired claim must never send.
  const now = new Date();
  const owned = await prisma.invoiceEmailDelivery.updateMany({
    where: {
      id: delivery.id,
      status: "SENDING",
      claimToken: delivery.claimToken,
      leaseExpiresAt: { gt: now }
    },
    data: { leaseExpiresAt: new Date(now.getTime() + leaseDurationMs) }
  });
  if (owned.count !== 1) return;

  const test = invoice.packageType === "test_payment";
  let accepted = false;
  try {
    const result = await transporter.sendMail({
      from: { name: config.fromName, address: config.fromEmail },
      to: { address: recipient, name: "" },
      messageId: delivery.messageId,
      subject: "Payment confirmed - invoice OPX-" + invoice.id,
      text: [
        "Your payment has been confirmed.",
        "Invoice: OPX-" + invoice.id,
        "Amount paid: " + invoice.currency + " " + (invoice.amountMinor / 100).toFixed(2),
        "Your paid invoice is attached as a PDF.",
        test
          ? "This was a live test payment. No subscription or service has been activated."
          : "Payment confirmation does not by itself confirm service activation."
      ].join("\n\n"),
      attachments: [{
        filename: "Opplexify-invoice-" + invoice.id + ".pdf",
        content: pdf,
        contentType: "application/pdf"
      }],
      disableFileAccess: true,
      disableUrlAccess: true
    });
    accepted = Array.isArray(result.accepted) && result.accepted.length === 1 &&
      result.accepted.some((value: unknown) => {
        const address = typeof value === "string" ? value :
          value && typeof value === "object" && "address" in value ? value.address : null;
        return invoiceEmailRecipient(address)?.toLowerCase() === recipient.toLowerCase();
      }) && (!Array.isArray(result.rejected) || result.rejected.length === 0);
  } catch (error) {
    const responseCode = error && typeof error === "object" && "responseCode" in error ? error.responseCode : null;
    if (typeof responseCode === "number" && responseCode >= 400 && responseCode <= 499) {
      await retryDelivery(delivery, "SMTP_TEMPORARY_REJECTION");
    } else if (typeof responseCode === "number" && responseCode >= 500 && responseCode <= 599) {
      await finishDelivery(delivery, "FAILED", "SMTP_PERMANENT_REJECTION");
    } else if (failedBeforeMessage(error)) {
      await retryDelivery(delivery, "SMTP_PRE_SEND_FAILURE");
    } else {
      // SMTP may have accepted DATA before a timeout or disconnect. Never resend blindly.
      await finishDelivery(delivery, "UNKNOWN", "SMTP_OUTCOME_UNKNOWN");
    }
    return;
  }

  // If saving SENT fails, the claim remains SENDING and expiry moves it to UNKNOWN.
  // A stable Message-ID is useful for investigation, but is not an SMTP deduplication guarantee.
  await finishDelivery(delivery, accepted ? "SENT" : "UNKNOWN", accepted ? null : "SMTP_ACCEPTANCE_UNCONFIRMED");
}

export async function processInvoiceEmails(): Promise<void> {
  if (processing || !workerEnabled()) return;
  processing = true;
  let transporter: Transporter | null = null;
  try {
    const config = smtpConfiguration();
    if (!config) {
      if (!configurationWarningShown) console.error("Invoice email worker: SMTP_CONFIGURATION_INVALID");
      configurationWarningShown = true;
      return;
    }
    configurationWarningShown = false;
    const now = new Date();
    await prisma.invoiceEmailDelivery.updateMany({
      where: { status: "SENDING", leaseExpiresAt: { lte: now } },
      data: { status: "UNKNOWN", claimToken: null, leaseExpiresAt: null, lastErrorCode: "SMTP_LEASE_EXPIRED" }
    });
    await prisma.invoiceEmailDelivery.updateMany({
      where: { status: { in: ["PENDING", "RETRY"] }, attempts: { gte: maximumAttempts } },
      data: { status: "FAILED", lastErrorCode: "ATTEMPTS_EXHAUSTED", claimToken: null, leaseExpiresAt: null }
    });
    const candidates = await prisma.invoiceEmailDelivery.findMany({
      where: { status: { in: ["PENDING", "RETRY"] }, nextAttemptAt: { lte: now }, attempts: { lt: maximumAttempts } },
      orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
      take: batchSize,
      select: { id: true }
    });
    if (!candidates.length) return;
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port !== 465,
      auth: { user: config.user, pass: config.password },
      tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
      dnsTimeout: 10_000,
      logger: false,
      debug: false,
      disableFileAccess: true,
      disableUrlAccess: true
    });

    for (const candidate of candidates) {
      const claimedAt = new Date();
      const claimToken = randomUUID();
      const claimed = await prisma.invoiceEmailDelivery.updateMany({
        where: {
          id: candidate.id,
          status: { in: ["PENDING", "RETRY"] },
          nextAttemptAt: { lte: claimedAt },
          attempts: { lt: maximumAttempts }
        },
        data: {
          status: "SENDING",
          attempts: { increment: 1 },
          claimToken,
          leaseExpiresAt: new Date(claimedAt.getTime() + leaseDurationMs),
          lastErrorCode: null
        }
      });
      if (claimed.count !== 1) continue;
      const delivery = await prisma.invoiceEmailDelivery.findUnique({ where: { id: candidate.id }, include: { order: true } });
      if (!delivery || delivery.claimToken !== claimToken || delivery.status !== "SENDING") continue;
      await deliverInvoice(delivery, transporter, config);
    }
  } catch {
    // Keep database, recipient and SMTP details out of logs; payment processing is independent.
    console.error("Invoice email worker: DELIVERY_WORKER_ERROR");
  } finally {
    try { transporter?.close(); } catch { /* No payment or retry state depends on closing the transport. */ }
    processing = false;
  }
}

export function startInvoiceEmailWorker(): () => void {
  if (workerStarted || !workerEnabled()) return () => {};
  workerStarted = true;
  void processInvoiceEmails();
  const timer = setInterval(() => { void processInvoiceEmails(); }, pollIntervalMs);
  timer.unref();
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    workerStarted = false;
  };
}
