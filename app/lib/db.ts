import { readFileSync, existsSync } from "node:fs";
import { Pool, type QueryResult, type QueryResultRow } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

function createPool(): Pool {
  const configuredUrl = process.env.DATABASE_URL;
  if (!configuredUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  // pg URL SSL parameters can override the explicit SSL object below.
  // Remove them from this in-memory copy so the RDS CA bundle is used.
  const url = new URL(configuredUrl);
  const sslMode = url.searchParams.get("sslmode");
  const sslRootCert = url.searchParams.get("sslrootcert");
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslrootcert");
  url.searchParams.delete("sslcert");
  url.searchParams.delete("sslkey");

  const caPath =
    process.env.RDS_CA_CERT_PATH ?? "/etc/ssl/certs/rds/global-bundle.pem";

  let ssl: Pool["options"]["ssl"];

  if (sslRootCert) {
    if (!existsSync(sslRootCert)) {
      throw new Error("The configured PostgreSQL SSL root certificate was not found");
    }
    ssl = {
      ca: readFileSync(sslRootCert, "utf8"),
      rejectUnauthorized: true,
    };
  } else if (existsSync(caPath)) {
    ssl = {
      ca: readFileSync(caPath, "utf8"),
      rejectUnauthorized: true,
    };
  } else if (url.hostname.endsWith(".rds.amazonaws.com")) {
    throw new Error(
      `RDS CA bundle not found. Set RDS_CA_CERT_PATH to the AWS RDS CA bundle file (currently expected at ${caPath}).`,
    );
  } else if (sslMode) {
    ssl = { rejectUnauthorized: true };
  }

  return new Pool({
    connectionString: url.toString(),
    ...(ssl ? { ssl } : {}),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

function getPool(): Pool {
  // Defer environment validation and pool creation until an API request
  // actually queries the database. CI can then build without production secrets.
  if (globalForPostgres.postgresPool) return globalForPostgres.postgresPool;

  const pool = createPool();
  globalForPostgres.postgresPool = pool;

  pool.on("error", (error) => {
    // Never log connection strings or other secret configuration.
    console.error("Unexpected PostgreSQL pool error:", error.message);
  });

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, values);
}
