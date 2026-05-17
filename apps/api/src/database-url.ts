import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

const DEFAULT_DATABASE_URL = "mysql://adon:adon@localhost:3306/adon";

process.env.DOTENV_CONFIG_QUIET = "true";
loadEnvFiles();

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL?.trim()) || databasePartsConfigured();
}

export function missingDatabaseConfigMessage() {
  return "DATABASE_URL or DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD";
}

export function databaseUrl(fallback = DEFAULT_DATABASE_URL) {
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) return normalizeMysqlUrl(explicit);

  const connection = (process.env.DB_CONNECTION || "mysql").trim().toLowerCase();
  if (connection === "sqlite") {
    const database = process.env.DB_DATABASE?.trim() || "./dev.db";
    return database.startsWith("file:") ? database : `file:${database}`;
  }

  if (connection !== "mysql" && connection !== "mariadb") {
    return fallback;
  }

  if (!databasePartsConfigured()) return fallback;

  const hostValue = process.env.DB_HOST?.trim() || "localhost";
  const [hostFromValue, portFromHost] = splitHostPort(hostValue);
  const host = hostFromValue || "localhost";
  const port = process.env.DB_PORT?.trim() || portFromHost || "3306";
  const database = process.env.DB_DATABASE?.trim() || "";
  const username = process.env.DB_USERNAME?.trim() || "";
  const password = process.env.DB_PASSWORD ?? "";

  const auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}`;
  return normalizeMysqlUrl(`mysql://${auth}@${host}:${port}/${encodeURIComponent(database)}`);
}

export function databasePoolConfig(fallback = DEFAULT_DATABASE_URL) {
  const connectionString = databaseUrl(fallback);

  try {
    const url = new URL(connectionString);
    if (!url.protocol.startsWith("mysql") && !url.protocol.startsWith("mariadb")) return connectionString;

    const config: Record<string, unknown> = {
      host: url.hostname || "localhost",
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
      allowPublicKeyRetrieval: url.searchParams.get("allowPublicKeyRetrieval") !== "false",
      prepareCacheLength: 0
    };

    url.searchParams.forEach((value, key) => {
      if (key in config) return;
      config[key] = parseConnectionOption(value);
    });

    return config;
  } catch {
    return connectionString;
  }
}

function databasePartsConfigured() {
  return ["DB_HOST", "DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"].every((name) => Boolean(process.env[name]?.trim()));
}

function splitHostPort(value: string) {
  if (value.startsWith("[") || !value.includes(":")) return [value, undefined] as const;
  const lastColon = value.lastIndexOf(":");
  const host = value.slice(0, lastColon);
  const port = value.slice(lastColon + 1);
  return /^\d+$/.test(port) ? ([host, port] as const) : ([value, undefined] as const);
}

function normalizeMysqlUrl(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const allowPublicKeyRetrieval = process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL ?? "true";

    if (url.protocol.startsWith("mysql") && !url.searchParams.has("allowPublicKeyRetrieval") && allowPublicKeyRetrieval !== "false") {
      url.searchParams.set("allowPublicKeyRetrieval", allowPublicKeyRetrieval);
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

function parseConnectionOption(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
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
