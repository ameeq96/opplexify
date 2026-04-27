const { spawnSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

function unquote(value) {
  const trimmed = value.trim();
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];

  if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = unquote(line.slice(separatorIndex + 1));

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function hasSplitDatabaseEnv() {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_DATABASE &&
      process.env.DB_USERNAME &&
      process.env.DB_PASSWORD !== undefined
  );
}

function applyDatabaseUrl() {
  if (!hasSplitDatabaseEnv()) {
    return;
  }

  const host = process.env.DB_HOST.trim();
  const port = (process.env.DB_PORT || "3306").trim();
  const database = encodeURIComponent(process.env.DB_DATABASE.trim());
  const username = encodeURIComponent(process.env.DB_USERNAME.trim());
  const password = encodeURIComponent(process.env.DB_PASSWORD || "");

  process.env.DATABASE_URL = `mysql://${username}:${password}@${host}:${port}/${database}`;
}

loadEnvFile(path.resolve(process.cwd(), ".env"));
loadEnvFile(path.resolve(process.cwd(), "apps/api/.env"));
loadEnvFile(path.resolve(__dirname, "../.env"));
applyDatabaseUrl();

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Missing command. Example: node scripts/with-database-url.cjs prisma db push");
  process.exit(1);
}

const result = spawnSync(command, args, {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

process.exit(result.status ?? 1);
