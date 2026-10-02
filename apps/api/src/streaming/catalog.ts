import { createHmac, timingSafeEqual } from "node:crypto";

export type StreamingPlan = {
  id: number;
  type: "plan" | "reseller";
  providerKey: string;
  providerName: string;
  name: string;
  description: string;
  durationLabel: string;
  durationMonths: number | null;
  credits: number | null;
  price: number;
  currency: string;
  features: string[];
  featured: boolean;
  available: boolean;
};

export type StreamingDevice = {
  id: number;
  name: string;
  icon: string;
};

export type StreamingCatalog = {
  plans: StreamingPlan[];
  devices: StreamingDevice[];
};

type SourceCatalogItem = {
  id?: unknown;
  type?: unknown;
  vendor?: unknown;
  provider_name?: unknown;
  title?: unknown;
  price_amount?: unknown;
  currency?: unknown;
  duration_months?: unknown;
  credits?: unknown;
  features?: unknown;
  is_featured?: unknown;
  is_available?: unknown;
};

type SourceCatalogResponse = {
  data?: unknown;
  devices?: unknown;
};

export async function fetchStreamingCatalog(): Promise<StreamingCatalog> {
  const config = catalogConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signaturePayload = `GET\n/integrations/opplexify/catalog\n${timestamp}`;
  const signature = createHmac("sha256", config.secret).update(signaturePayload).digest("hex");
  const response = await fetch(config.url, {
    headers: {
      Accept: "application/json",
      "X-Opplexify-Timestamp": timestamp,
      "X-Opplexify-Signature": signature
    },
    signal: AbortSignal.timeout(15_000)
  });

  if (!response.ok) throw new Error(`Package catalog request failed with HTTP ${response.status}`);

  const body = (await response.json()) as SourceCatalogResponse;
  if (!Array.isArray(body.data)) throw new Error("Package catalog returned an invalid response");

  return {
    plans: body.data.map(normalizePlan).filter((plan): plan is StreamingPlan => plan !== null),
    devices: Array.isArray(body.devices)
      ? body.devices.map(normalizeDevice).filter((device): device is StreamingDevice => device !== null)
      : []
  };
}

export function selectedPackageId(
  selection: unknown,
  signature: unknown,
  plans: StreamingPlan[]
): number | null {
  if (
    typeof selection !== "string" ||
    selection.length > 512 ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return null;
  }

  const secret = process.env.OPPLEX_HANDOFF_SECRET?.trim();
  if (!secret) return null;

  const expected = createHmac("sha256", secret).update(selection).digest();
  const provided = Buffer.from(signature, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(selection, "base64url").toString("utf8")) as {
      v?: unknown;
      package_id?: unknown;
      exp?: unknown;
    };
    const packageId = Number(payload.package_id);
    const expiresAt = Number(payload.exp);
    const now = Math.floor(Date.now() / 1000);

    if (payload.v !== 1 || !Number.isSafeInteger(packageId) || packageId <= 0 || !Number.isFinite(expiresAt) || expiresAt <= now) {
      return null;
    }

    return plans.some((plan) => plan.id === packageId && plan.available) ? packageId : null;
  } catch {
    return null;
  }
}

function normalizePlan(item: SourceCatalogItem): StreamingPlan | null {
  const id = Number(item.id);
  const sourceType = typeof item.type === "string" ? item.type.toLowerCase() : "";
  const vendor = typeof item.vendor === "string" ? item.vendor.trim() : "";
  const providerSource = typeof item.provider_name === "string" ? item.provider_name.trim() : vendor;
  const titleSource = typeof item.title === "string" ? item.title.trim() : "";
  const price = Number(item.price_amount);
  const currency = typeof item.currency === "string" ? item.currency.trim().toUpperCase() : "";
  const durationMonths = nullablePositiveInteger(item.duration_months);
  const credits = nullablePositiveInteger(item.credits);

  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    !["iptv", "reseller"].includes(sourceType) ||
    !vendor ||
    !providerSource ||
    !titleSource ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !/^[A-Z]{3}$/.test(currency) ||
    item.is_available !== true
  ) {
    return null;
  }

  const providerName = replaceIptvLabel(providerSource);
  const features = Array.isArray(item.features)
    ? item.features.filter((feature): feature is string => typeof feature === "string").map(replaceIptvLabel)
    : [];

  return {
    id,
    type: sourceType === "reseller" ? "reseller" : "plan",
    providerKey: slug(providerName),
    providerName,
    name: replaceIptvLabel(titleSource),
    description: `Digital TV Streaming Package from ${providerName}.`,
    durationLabel: durationLabel(durationMonths, credits),
    durationMonths,
    credits,
    price: Math.round(price * 100) / 100,
    currency,
    features,
    featured: item.is_featured === true,
    available: true
  };
}

function normalizeDevice(item: unknown): StreamingDevice | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const source = item as Record<string, unknown>;
  const id = Number(source.id);
  const name = typeof source.name === "string" ? source.name.trim() : "";
  const icon = typeof source.icon === "string" ? source.icon.trim() : "";

  if (!Number.isSafeInteger(id) || id <= 0 || !name || name.length > 100) return null;
  return { id, name, icon };
}

function catalogConfig() {
  const url = process.env.OPPLEX_CATALOG_URL?.trim();
  const secret = process.env.OPPLEX_HANDOFF_SECRET?.trim();
  if (!url || !secret) throw new Error("Opplex package catalog is not configured");
  return { url, secret };
}

function nullablePositiveInteger(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function durationLabel(months: number | null, credits: number | null) {
  if (credits) return `${credits} Credits`;
  if (months === 1) return "Monthly";
  if (months === 3) return "3 Months";
  if (months === 6) return "Half-Yearly";
  if (months === 12) return "Yearly";
  return months ? `${months} Months` : "Subscription";
}

function replaceIptvLabel(value: string) {
  return value.replace(/\bIPTV\b/gi, "Digital TV").replace(/\s+/g, " ").trim();
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
