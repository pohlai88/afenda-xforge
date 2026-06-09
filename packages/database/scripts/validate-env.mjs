#!/usr/bin/env node

import path from "node:path";
import postgres from "postgres";
import { loadRootEnv } from "../../../scripts/lib/root-env.mjs";

const packageDirectory = path.resolve(import.meta.dirname, "..");
const rootDirectory = path.resolve(packageDirectory, "..", "..");

const parseDatabaseUrl = (connectionString) => new URL(connectionString);

const classifyDatabaseConnection = (databaseUrl) => {
  const hostname = databaseUrl.hostname;
  const port = databaseUrl.port || "5432";
  const isNeon = hostname.endsWith(".neon.tech");
  const usesPooler = hostname.includes("-pooler") || port === "6543";

  return {
    hostname,
    isNeon,
    port,
    usesPooler,
  };
};

const main = async () => {
  const { env, envFile } = loadRootEnv(rootDirectory);

  if (!env.DATABASE_URL) {
    throw new Error(`DATABASE_URL is missing from ${envFile}`);
  }

  const databaseUrl = parseDatabaseUrl(env.DATABASE_URL);
  const classification = classifyDatabaseConnection(databaseUrl);
  const sql = postgres(env.DATABASE_URL, {
    prepare: false,
  });

  try {
    const [row] = await sql`
      select
        current_database() as database_name,
        current_schema() as schema_name,
        version() as server_version
    `;

    console.log(
      JSON.stringify(
        {
          database: row?.database_name ?? null,
          envFile,
          hostname: classification.hostname,
          isNeon: classification.isNeon,
          port: classification.port,
          schema: row?.schema_name ?? null,
          serverVersion: row?.server_version ?? null,
          usesPooler: classification.usesPooler,
        },
        null,
        2
      )
    );
  } finally {
    await sql.end();
  }
};

await main();
