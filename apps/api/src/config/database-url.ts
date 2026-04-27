type DatabaseEnv = NodeJS.ProcessEnv;

function hasSplitDatabaseEnv(env: DatabaseEnv) {
  return Boolean(env.DB_HOST && env.DB_DATABASE && env.DB_USERNAME && env.DB_PASSWORD !== undefined);
}

export function buildDatabaseUrl(env: DatabaseEnv = process.env) {
  if (hasSplitDatabaseEnv(env)) {
    const host = env.DB_HOST!.trim();
    const port = (env.DB_PORT || "3306").trim();
    const database = encodeURIComponent(env.DB_DATABASE!.trim());
    const username = encodeURIComponent(env.DB_USERNAME!.trim());
    const password = encodeURIComponent(env.DB_PASSWORD || "");

    return `mysql://${username}:${password}@${host}:${port}/${database}`;
  }

  return env.DATABASE_URL?.trim();
}

export function applyDatabaseUrl(env: DatabaseEnv = process.env) {
  const databaseUrl = buildDatabaseUrl(env);

  if (databaseUrl) {
    env.DATABASE_URL = databaseUrl;
  }

  return databaseUrl;
}
