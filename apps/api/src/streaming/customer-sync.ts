import { createHash, createHmac, randomUUID } from "node:crypto";
import type { Prisma } from "../generated/prisma/client";

export const customerEventTypes = [
  "checkout.started", "checkout.tracker_attached", "checkout.failed", "payment.verified",
  "payment.bridge_completed", "payment.bridge_failed", "share.created", "share.opened",
  "invoice.pending", "invoice.sending", "invoice.sent", "invoice.failed", "invoice.unknown", "contact.submitted"
] as const;
type EventType = typeof customerEventTypes[number];
type EntityType = "streaming_order" | "shared_checkout" | "contact_message";
export type CustomerEventData = {
  reference?: string; checkout_key?: string; tracker?: string; amount_minor?: number; currency?: string;
  status?: string; customer?: { name?: string; email?: string; phone?: string };
  message?: string; subject?: string; invoice_status?: string; recipient?: string; error_code?: string;
  actor_hash?: string; package_id?: number;
};
export type CustomerEventInput = {
  eventType: EventType; entityType: EntityType; entityId: string; dedupeKey: string;
  occurredAt?: Date; data: CustomerEventData;
};
type SyncClient = Pick<Prisma.TransactionClient, "customerSyncOutbox">;
type SyncRow = Prisma.CustomerSyncOutboxGetPayload<Record<string, never>>;
type Environment = Record<string, string | undefined>;
const endpointPath = "/integrations/opplexify/customer-events";
const maximumAttempts = 12;
const leaseMs = 60_000;

export function customerSyncEnabled(env: Environment = process.env) {
  return env.CUSTOMER_SYNC_ENABLED === "true";
}

function text(value: unknown, maximum: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

export function validCustomerEventData(data: CustomerEventData, eventType?: string): boolean {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const keys = new Set(["reference", "checkout_key", "tracker", "amount_minor", "currency", "status", "customer",
    "message", "subject", "invoice_status", "recipient", "error_code", "actor_hash", "package_id"]);
  if (Object.keys(data).some((key) => !keys.has(key))) return false;
  if (data.reference !== undefined && !/^(?:sp2_[a-f0-9]{32}|c[a-z0-9]{24,31})$/.test(data.reference)) return false;
  if (data.checkout_key !== undefined && (!text(data.checkout_key, 191) || !/^[A-Za-z0-9_-]+$/.test(data.checkout_key))) return false;
  if (data.tracker !== undefined && (!text(data.tracker, 191) || !/^track_[A-Za-z0-9_-]+$/.test(data.tracker))) return false;
  if (data.currency !== undefined && !/^[A-Z]{3}$/.test(data.currency)) return false;
  for (const amount of [data.amount_minor, data.package_id]) {
    if (amount !== undefined && (!Number.isSafeInteger(amount) || amount <= 0)) return false;
  }
  if (data.status !== undefined && !["PENDING", "CHECKOUT_STARTED", "PAID", "FAILED", "CANCELLED"].includes(data.status)) return false;
  if (data.invoice_status !== undefined && !["PENDING", "SENDING", "SENT", "FAILED", "UNKNOWN", "RETRY"].includes(data.invoice_status)) return false;
  if (data.recipient !== undefined && (!text(data.recipient, 191) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipient))) return false;
  if (data.error_code !== undefined && !/^[A-Z0-9_]{1,64}$/.test(data.error_code)) return false;
  if (data.actor_hash !== undefined && !/^[a-f0-9]{64}$/.test(data.actor_hash)) return false;
  if (data.message !== undefined && !text(data.message, 10_000)) return false;
  if (data.subject !== undefined && !text(data.subject, 191)) return false;
  if (data.customer !== undefined) {
    const customer = data.customer;
    if (!customer || typeof customer !== "object" || Array.isArray(customer) ||
        Object.keys(customer).some((key) => !["name", "email", "phone"].includes(key))) return false;
    if (customer.name !== undefined && !text(customer.name, 191)) return false;
    if (customer.email !== undefined && (!text(customer.email, eventType === "contact.submitted" ? 254 : 191) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))) return false;
    if (customer.phone !== undefined && !text(customer.phone, 50)) return false;
  }
  return true;
}

export async function enqueueCustomerEvent(db: SyncClient, input: CustomerEventInput, env: Environment = process.env) {
  if (!customerSyncEnabled(env)) return null;
  if (!customerEventTypes.includes(input.eventType) || !["streaming_order", "shared_checkout", "contact_message"].includes(input.entityType) ||
      !text(input.entityId, 191) || !text(input.dedupeKey, 500) || !validCustomerEventData(input.data, input.eventType)) {
    throw new Error("CUSTOMER_EVENT_INVALID");
  }
  const occurredAt = input.occurredAt ?? new Date();
  if (!Number.isFinite(occurredAt.getTime())) throw new Error("CUSTOMER_EVENT_INVALID_TIME");
  const eventId = createHash("sha256").update(JSON.stringify([input.entityType, input.entityId, input.eventType, input.dedupeKey])).digest("hex");
  return db.customerSyncOutbox.upsert({
    where: { eventId }, update: {},
    create: { eventId, eventType: input.eventType, entityType: input.entityType, entityId: input.entityId,
      occurredAt, data: input.data as Prisma.InputJsonValue }
  });
}

export function customerEventBody(row: SyncRow) {
  const sequence = Number(row.sequence);
  if (!Number.isSafeInteger(sequence) || sequence <= 0 || !validCustomerEventData(row.data as CustomerEventData, row.eventType)) {
    throw new Error("CUSTOMER_EVENT_INVALID");
  }
  return JSON.stringify({ event_id: row.eventId, event_type: row.eventType, entity_type: row.entityType,
    entity_id: row.entityId, sequence, occurred_at: row.occurredAt.toISOString(), data: row.data });
}

export function customerSyncDestination(env: Environment = process.env) {
  if (!customerSyncEnabled(env) || !env.OPPLEX_CATALOG_URL || !env.OPPLEX_HANDOFF_SECRET?.trim()) return null;
  try {
    const base = new URL(env.OPPLEX_CATALOG_URL);
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname);
    if (base.username || base.password || !["http:", "https:"].includes(base.protocol) ||
        (env.NODE_ENV !== "production" && !loopback) || (!loopback && base.protocol !== "https:")) return null;
    return new URL(endpointPath, base).toString();
  } catch { return null; }
}

export function customerSyncHeaders(body: string, secret: string, timestamp: string) {
  const digest = createHash("sha256").update(body).digest("hex");
  const signature = createHmac("sha256", secret).update(`POST\n${endpointPath}\n${timestamp}\n${digest}`).digest("hex");
  return { Accept: "application/json", "Content-Type": "application/json", "X-Opplexify-Timestamp": timestamp, "X-Opplexify-Signature": signature };
}

export async function processCustomerSync(db: SyncClient, options: { env?: Environment; fetcher?: typeof fetch; now?: () => Date } = {}) {
  const env = options.env ?? process.env;
  const destination = customerSyncDestination(env);
  if (!destination) return;
  const now = options.now ?? (() => new Date());
  const fetcher = options.fetcher ?? fetch;
  const current = now();
  await db.customerSyncOutbox.updateMany({
    where: { status: "SENDING", leaseExpiresAt: { lte: current } },
    data: { status: "RETRY", claimToken: null, leaseExpiresAt: null, lastErrorCode: "LEASE_EXPIRED", nextAttemptAt: current }
  });
  await db.customerSyncOutbox.updateMany({
    where: { status: { in: ["PENDING", "RETRY"] }, attempts: { gte: maximumAttempts } },
    data: { status: "FAILED", lastErrorCode: "ATTEMPTS_EXHAUSTED" }
  });
  const candidates = await db.customerSyncOutbox.findMany({
    where: { status: { in: ["PENDING", "RETRY"] }, attempts: { lt: maximumAttempts }, nextAttemptAt: { lte: current } },
    orderBy: { sequence: "asc" }, take: 10
  });
  for (const candidate of candidates) {
    const claimToken = randomUUID();
    const claimedAt = now();
    const claimed = await db.customerSyncOutbox.updateMany({
      where: { sequence: candidate.sequence, status: { in: ["PENDING", "RETRY"] }, attempts: { lt: maximumAttempts }, nextAttemptAt: { lte: claimedAt } },
      data: { status: "SENDING", attempts: { increment: 1 }, claimToken, leaseExpiresAt: new Date(claimedAt.getTime() + leaseMs) }
    });
    if (claimed.count !== 1) continue;
    let errorCode = "DELIVERY_FAILED";
    let delivered = false;
    let permanent = false;
    try {
      const body = customerEventBody(candidate);
      const timestamp = Math.floor(now().getTime() / 1000).toString();
      const response = await fetcher(destination, {
        method: "POST", body, headers: customerSyncHeaders(body, env.OPPLEX_HANDOFF_SECRET!.trim(), timestamp),
        redirect: "error", signal: AbortSignal.timeout(10_000)
      });
      if (response.ok) {
        const result = await response.json() as { received?: unknown; event_id?: unknown };
        delivered = result.received === true && result.event_id === candidate.eventId;
        if (!delivered) errorCode = "ACKNOWLEDGEMENT_INVALID";
      } else {
        errorCode = `HTTP_${response.status}`;
        permanent = [400, 403, 409, 413, 415, 422].includes(response.status);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "CUSTOMER_EVENT_INVALID") {
        errorCode = "CUSTOMER_EVENT_INVALID";
        permanent = true;
      }
    }
    const finishedAt = now();
    const attempts = candidate.attempts + 1;
    await db.customerSyncOutbox.updateMany({
      where: { sequence: candidate.sequence, status: "SENDING", claimToken },
      data: { status: delivered ? "DELIVERED" : permanent || attempts >= maximumAttempts ? "FAILED" : "RETRY",
        claimToken: null, leaseExpiresAt: null, deliveredAt: delivered ? finishedAt : null,
        lastErrorCode: delivered ? null : errorCode,
        nextAttemptAt: new Date(finishedAt.getTime() + Math.min(3_600_000, 30_000 * 2 ** Math.min(attempts - 1, 7))) }
    });
  }
}

export function startCustomerSyncWorker(db: SyncClient) {
  if (!customerSyncDestination()) return () => {};
  let processing = false;
  const run = async () => {
    if (processing) return;
    processing = true;
    try { await processCustomerSync(db); }
    catch { console.error("Customer sync worker: DELIVERY_WORKER_ERROR"); }
    finally { processing = false; }
  };
  void run();
  const timer = setInterval(() => { void run(); }, 30_000);
  timer.unref();
  return () => clearInterval(timer);
}
