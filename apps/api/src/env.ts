import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { hasDatabaseConfig, missingDatabaseConfigMessage } from "./database-url";

process.env.DOTENV_CONFIG_QUIET = "true";

loadEnvFiles();

const REQUIRED_PRODUCTION_ENV = ["JWT_SECRET"] as const;

export const isProduction = process.env.NODE_ENV === "production";
export const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").replace(/\/+$/, "");
export const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "8h";
export const jwtIssuer = "opplexify";
export const jwtAudience = "opplexify-admin";
export const adminSessionCookie = "opplexify_admin_session";
export const adminSessionMaxAgeMs = 8 * 60 * 60 * 1000;
export const trustProxyHops = trustedProxyHops();

export function assertProductionEnv() {
  if (!isProduction) return;

  const missing: string[] = REQUIRED_PRODUCTION_ENV.filter((name) => !process.env[name]?.trim());
  if (jwtSecret.length < 32) missing.push("JWT_SECRET (at least 32 characters)");
  try {
    const origin = new URL(webOrigin);
    if (origin.protocol !== "https:" || origin.origin !== webOrigin.replace(/\/+$/, "")) {
      missing.push("WEB_ORIGIN (an exact HTTPS origin)");
    }
  } catch {
    missing.push("WEB_ORIGIN (an exact HTTPS origin)");
  }
  const safepayEnvironment = process.env.SAFEPAY_ENVIRONMENT?.trim().toLowerCase();
  const paymentEnv = ["SAFEPAY_ENVIRONMENT", "OPPLEX_CATALOG_URL", "OPPLEX_HANDOFF_SECRET"];
  if (safepayEnvironment === "production") {
    paymentEnv.push("SAFEPAY_PUBLIC_KEY", "SAFEPAY_SECRET_KEY", "SAFEPAY_WEBHOOK_SECRET");
  } else if (safepayEnvironment !== "sandbox") {
    missing.push("SAFEPAY_ENVIRONMENT (sandbox or production)");
  }
  for (const name of paymentEnv) {
    if (!process.env[name]?.trim()) missing.push(name);
  }
  if (!hasDatabaseConfig()) {
    missing.unshift(missingDatabaseConfigMessage());
  }

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variable(s): ${missing.join(", ")}`);
  }
}

function trustedProxyHops() {
  const value = Number(process.env.TRUST_PROXY_HOPS ?? (isProduction ? 1 : 0));
  return Number.isSafeInteger(value) && value >= 0 && value <= 5 ? value : (isProduction ? 1 : 0);
}

export function productionSeedValue(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD", fallback: string) {
  const value = process.env[name]?.trim();
  if (value) return value;

  if (isProduction) {
    throw new Error(`Missing required production seed environment variable: ${name}`);
  }

  return fallback;
}

function loadEnvFiles() {
  const candidates = [
    resolve(process.cwd(), "apps/api/.env"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env"),
    resolve(process.cwd(), "../../.env")
  ];

  for (const path of Array.from(new Set(candidates))) {
    if (existsSync(path)) loadEnv({ path, quiet: true });
  }
}
