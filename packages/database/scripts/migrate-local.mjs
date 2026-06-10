#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { loadRootEnv } from "../../../scripts/lib/root-env.mjs";

const packageDirectory = path.resolve(import.meta.dirname, "..");
const rootDirectory = path.resolve(packageDirectory, "..", "..");
const journalFile = path.join(
  packageDirectory,
  "drizzle",
  "meta",
  "_journal.json"
);
const ignorablePostgresErrorCodes = new Set([
  "42P06",
  "42P07",
  "42701",
  "42710",
]);

const info = (message) => console.log(`i ${message}`);
const success = (message) => console.log(`ok ${message}`);

const loadMigrationEntries = () => {
  const journal = JSON.parse(fs.readFileSync(journalFile, "utf8"));

  return journal.entries.map((entry) => ({
    filePath: path.join(packageDirectory, "drizzle", `${entry.tag}.sql`),
    tag: entry.tag,
  }));
};

const splitSqlStatements = (contents) =>
  contents
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

const ensureMigrationState = async (sql) => {
  await sql.unsafe(
    "create schema if not exists xforge; create table if not exists xforge.local_migration_history (tag text primary key, applied_at timestamp with time zone default now() not null);"
  );
};

const hasMigrationRun = async (sql, tag) => {
  const [row] =
    await sql`select tag from xforge.local_migration_history where tag = ${tag} limit 1`;

  return Boolean(row);
};

const applyMigrationFile = async (sql, tag, filePath) => {
  const contents = fs.readFileSync(filePath, "utf8");
  const statements = splitSqlStatements(contents);

  info(`Applying ${tag}`);

  for (const statement of statements) {
    try {
      await sql.unsafe(statement);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        typeof error.code === "string" &&
        ignorablePostgresErrorCodes.has(error.code)
      ) {
        info(`Skipping already-applied statement in ${tag} (${error.code})`);
        continue;
      }

      throw error;
    }
  }

  await sql`insert into xforge.local_migration_history (tag) values (${tag}) on conflict (tag) do nothing`;
  success(`Applied ${tag}`);
};

const resolveDatabaseUrl = (rootDirectory, envFileEnv) => {
  const fromProcess = process.env.DATABASE_URL?.trim();

  if (fromProcess) {
    return {
      databaseUrl: fromProcess,
      envFile: "process.env.DATABASE_URL",
    };
  }

  if (!envFileEnv.DATABASE_URL) {
    throw new Error(`DATABASE_URL is missing from ${envFileEnv.envFile ?? "environment"}`);
  }

  return {
    databaseUrl: envFileEnv.DATABASE_URL,
    envFile: envFileEnv.envFile,
  };
};

const main = async () => {
  let envFile = "process.env.DATABASE_URL";
  let env = process.env;

  try {
    const loaded = loadRootEnv(rootDirectory);
    env = loaded.env;
    envFile = loaded.envFile;
  } catch {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        `Missing root environment file. Expected ${path.join(rootDirectory, ".env.local")} or ${path.join(rootDirectory, ".env")}, or set DATABASE_URL in the environment`
      );
    }
  }

  const { databaseUrl, envFile: resolvedEnvFile } = resolveDatabaseUrl(
    rootDirectory,
    { ...env, envFile }
  );

  info(`Using database URL from ${resolvedEnvFile}`);

  const sql = postgres(databaseUrl, {
    prepare: false,
  });

  try {
    await ensureMigrationState(sql);

    for (const entry of loadMigrationEntries()) {
      if (await hasMigrationRun(sql, entry.tag)) {
        info(`Skipping ${entry.tag}`);
        continue;
      }

      await applyMigrationFile(sql, entry.tag, entry.filePath);
    }
  } finally {
    await sql.end();
  }
};

await main();
