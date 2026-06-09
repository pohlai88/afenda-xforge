#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import net from "node:net";
import path from "node:path";
import { loadRootEnv } from "./lib/root-env.mjs";

const rootDirectory = path.resolve(import.meta.dirname, "..");
const redisComposeFile = path.join(
  rootDirectory,
  "docker-compose.webhooks.yml"
);
const defaultRedisUrl = "redis://127.0.0.1:6379";
const defaultApiBaseUrl = "http://127.0.0.1:3002";
const defaultProvider = "linear";
const defaultCompanyEndpointId = "e2e-linear-company-create";
const defaultCustomerEndpointId = "e2e-linear-customer-create";
const defaultEndpointSecret = "local-webhook-secret";
const webhookIntegrationOptInKey = "XFORGE_ENABLE_WEBHOOK_INTEGRATION_TESTS";

const info = (message) => console.log(`i ${message}`);
const fail = (message) => {
  console.error(`x ${message}`);
  process.exit(1);
};

const getRootEnv = () => {
  const { env, envFile } = loadRootEnv(rootDirectory);

  return {
    env: {
      ...process.env,
      ...env,
      REDIS_URL: env.REDIS_URL || defaultRedisUrl,
    },
    envFile,
  };
};

const run = (command, args, env) => {
  const result = spawnSync(command, args, {
    cwd: rootDirectory,
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const ensureRequiredKeys = (env, keys) => {
  const missingKeys = keys.filter((key) => !env[key]);

  if (missingKeys.length > 0) {
    fail(`Missing required environment variables: ${missingKeys.join(", ")}`);
  }
};

const withDefaultWebhookSeed = (env) => ({
  ...env,
  XFORGE_WEBHOOK_ENDPOINTS_JSON:
    env.XFORGE_WEBHOOK_ENDPOINTS_JSON ||
    JSON.stringify([
      {
        applicationId: "xforge-local-webhooks",
        applicationName: "Xforge Local Webhooks",
        endpointId: defaultCompanyEndpointId,
        eventOwner: "master-data.companies.create",
        provider: defaultProvider,
        schemaVersion: "v1",
        secret: env.XFORGE_WEBHOOK_TEST_SECRET || defaultEndpointSecret,
        status: "active",
      },
      {
        applicationId: "xforge-local-webhooks",
        applicationName: "Xforge Local Webhooks",
        endpointId: defaultCustomerEndpointId,
        eventOwner: "master-data.customers.create",
        provider: defaultProvider,
        schemaVersion: "v1",
        secret: env.XFORGE_WEBHOOK_TEST_SECRET || defaultEndpointSecret,
        status: "active",
      },
    ]),
});

const isPortOpen = (host, port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({
      host,
      port,
    });

    const finalize = (isOpen) => {
      socket.destroy();
      resolve(isOpen);
    };

    socket.setTimeout(1000);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));
  });

const bootstrap = async () => {
  const { env, envFile } = getRootEnv();

  ensureRequiredKeys(env, ["DATABASE_URL"]);
  info(`Using root env file: ${envFile}`);
  if (await isPortOpen("127.0.0.1", 6379)) {
    info("Redis already available on 127.0.0.1:6379");
  } else {
    info("Starting local Redis with Docker Compose");
    run(
      "docker",
      ["compose", "-f", redisComposeFile, "up", "-d", "redis"],
      env
    );
  }
  info("Applying database migrations through @repo/database");
  run("pnpm", ["--filter", "@repo/database", "db:migrate"], env);
  info("Validating configured database environment");
  run("pnpm", ["--filter", "@repo/database", "db:validate-env"], env);
  info("Seeding foundation rows and default local webhook endpoint");
  run(
    "pnpm",
    ["--filter", "@repo/database", "db:seed"],
    withDefaultWebhookSeed(env)
  );
};

const startApi = () => {
  const { env, envFile } = getRootEnv();

  ensureRequiredKeys(env, ["CRON_SECRET", "DATABASE_URL"]);
  info(`Using root env file: ${envFile}`);
  info(`Using REDIS_URL=${env.REDIS_URL}`);
  run("pnpm", ["--filter", "api", "dev"], env);
};

const doctor = () => {
  const { env, envFile } = getRootEnv();
  const requiredKeys = ["DATABASE_URL", "CRON_SECRET", "REDIS_URL"];
  const missingKeys = requiredKeys.filter((key) => !env[key]);

  console.log(
    JSON.stringify(
      {
        apiBaseUrl: defaultApiBaseUrl,
        envFile,
        missingKeys,
        redisUrl: env.REDIS_URL,
      },
      null,
      2
    )
  );

  if (missingKeys.length > 0) {
    process.exit(1);
  }
};

const integration = async () => {
  const { env } = getRootEnv();

  if (env[webhookIntegrationOptInKey] !== "true") {
    info(
      `Skipping webhook integration checks because ${webhookIntegrationOptInKey}=true is not set`
    );
    return;
  }

  await smoke();
};

const runDatabaseVerification = (env, codeByTable) => {
  const command = "pnpm";
  const args = [
    "--filter",
    "@repo/database",
    "exec",
    "node",
    "--input-type=module",
    "-",
  ];
  const databaseScript = `
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const checks = ${JSON.stringify(codeByTable)};

try {
  const result = {};

  for (const [tableName, code] of Object.entries(checks)) {
    const rows = await sql.unsafe(
      \`select id, code, name, tenant_id from xforge.\${tableName} where code = $1 limit 1\`,
      [code]
    );
    result[tableName] = rows[0] ?? null;
  }

  console.log(JSON.stringify(result));
} finally {
  await sql.end();
}
`;
  const result = spawnSync(command, args, {
    cwd: rootDirectory,
    encoding: "utf8",
    env,
    input: databaseScript,
    shell: process.platform === "win32",
  });

  if (result.error) {
    fail(`Database verification failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    fail("Database verification failed");
  }

  return JSON.parse((result.stdout || "").trim());
};

const smoke = async () => {
  const { env } = getRootEnv();

  ensureRequiredKeys(env, ["CRON_SECRET"]);

  const now = Date.now();
  const companyCode = `E2EC${now}`;
  const companyName = `E2E Company ${now}`;
  const companyEventId = `evt-e2e-company-${now}`;
  const customerCode = `E2EU${now}`;
  const customerName = `E2E Customer ${now}`;
  const customerEventId = `evt-e2e-customer-${now}`;

  const apiBaseUrl = env.XFORGE_WEBHOOK_API_URL || defaultApiBaseUrl;
  const provider = env.XFORGE_WEBHOOK_PROVIDER || defaultProvider;

  const sendInbound = async ({ endpointId, payload }) => {
    const rawBody = JSON.stringify(payload);
    const signedPayload = crypto
      .createHmac(
        "sha256",
        env.XFORGE_WEBHOOK_TEST_SECRET || defaultEndpointSecret
      )
      .update(rawBody)
      .digest("hex");

    const response = await fetch(`${apiBaseUrl}/webhooks/inbound/${provider}`, {
      body: rawBody,
      headers: {
        "content-type": "application/json",
        "x-webhook-endpoint-id": endpointId,
        "x-webhook-signature": signedPayload,
        "x-webhook-timestamp": String(now),
      },
      method: "POST",
    });

    return {
      body: await response.text(),
      status: response.status,
    };
  };

  const healthResponse = await fetch(
    `${apiBaseUrl}/api/internal/webhooks/dispatch/health`,
    {
      headers: {
        authorization: `Bearer ${env.CRON_SECRET}`,
      },
    }
  );
  const healthBody = await healthResponse.text();

  const companyInbound = await sendInbound({
    endpointId:
      env.XFORGE_WEBHOOK_TEST_COMPANY_ENDPOINT_ID || defaultCompanyEndpointId,
    payload: {
      action: "create",
      code: companyCode,
      eventId: companyEventId,
      name: companyName,
      type: "company",
    },
  });

  const customerInbound = await sendInbound({
    endpointId:
      env.XFORGE_WEBHOOK_TEST_CUSTOMER_ENDPOINT_ID || defaultCustomerEndpointId,
    payload: {
      action: "create",
      code: customerCode,
      eventId: customerEventId,
      name: customerName,
      type: "customer",
    },
  });

  const dispatchResponse = await fetch(
    `${apiBaseUrl}/api/internal/webhooks/dispatch`,
    {
      headers: {
        authorization: `Bearer ${env.CRON_SECRET}`,
      },
    }
  );
  const dispatchBody = await dispatchResponse.text();
  const databaseVerification = runDatabaseVerification(env, {
    companies: companyCode,
    customers: customerCode,
  });

  console.log(
    JSON.stringify(
      {
        company: {
          code: companyCode,
          eventId: companyEventId,
          inboundBody: companyInbound.body,
          inboundStatus: companyInbound.status,
          name: companyName,
        },
        customer: {
          code: customerCode,
          eventId: customerEventId,
          inboundBody: customerInbound.body,
          inboundStatus: customerInbound.status,
          name: customerName,
        },
        databaseVerification,
        dispatchBody,
        dispatchStatus: dispatchResponse.status,
        healthBody,
        healthStatus: healthResponse.status,
      },
      null,
      2
    )
  );

  if (
    !(
      healthResponse.ok &&
      companyInbound.status === 202 &&
      customerInbound.status === 202 &&
      dispatchResponse.ok &&
      databaseVerification.companies &&
      databaseVerification.customers
    )
  ) {
    process.exit(1);
  }
};

const command = process.argv[2];

switch (command) {
  case "api":
    startApi();
    break;
  case "bootstrap":
    bootstrap();
    break;
  case "doctor":
    doctor();
    break;
  case "smoke":
    await smoke();
    break;
  case "integration":
    await integration();
    break;
  default:
    fail(
      "Usage: node scripts/webhooks-local.mjs <bootstrap|api|doctor|smoke|integration>"
    );
}
