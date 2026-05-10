import { config as loadEnv } from "dotenv";

loadEnv({ path: "apps/api/.env" });
loadEnv();

const REQUIRED_PRODUCTION_ENV = ["DATABASE_URL", "JWT_SECRET"] as const;

export const isProduction = process.env.NODE_ENV === "production";
export const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
export const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

export function assertProductionEnv() {
  if (!isProduction) return;

  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variable(s): ${missing.join(", ")}`);
  }
}

export function productionSeedValue(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD", fallback: string) {
  const value = process.env[name]?.trim();
  if (value) return value;

  if (isProduction) {
    throw new Error(`Missing required production seed environment variable: ${name}`);
  }

  return fallback;
}
