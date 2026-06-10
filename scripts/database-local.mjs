#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";

const rootDirectory = path.resolve(import.meta.dirname, "..");
const composeFile = path.join(rootDirectory, "docker-compose.database.yml");
const composeProjectName = "xforge-database-itest";
const databaseUrl = "postgres://postgres:postgres@127.0.0.1:5432/postgres";
const serviceName = "postgres";
const postgresHost = "127.0.0.1";
const postgresPort = 5432;
const integrationEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
};
const commands = new Set(["doctor", "down", "help", "integration", "up"]);

const info = (message) => console.log(`i ${message}`);
const warn = (message) => console.warn(`! ${message}`);
const fail = (message) => {
  console.error(`x ${message}`);
  process.exit(1);
};

const renderCommand = (command, args) => [command, ...args].join(" ");

const execute = (command, args, { env = process.env, stdio = "pipe" } = {}) => {
  const result = spawnSync(command, args, {
    cwd: rootDirectory,
    encoding: "utf8",
    env,
    shell: process.platform === "win32",
    stdio,
  });

  return {
    ...result,
    stderr: result.stderr?.trim() ?? "",
    stdout: result.stdout?.trim() ?? "",
  };
};

const buildCommandError = (command, args, result) => {
  const renderedCommand = renderCommand(command, args);

  if (result.error) {
    return `${renderedCommand} failed: ${result.error.message}`;
  }

  if (result.status === 0) {
    return `${renderedCommand} failed`;
  }

  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");

  if (output.length > 0) {
    return `${renderedCommand} exited with status ${result.status}.\n${output}`;
  }

  return `${renderedCommand} exited with status ${result.status}`;
};

const run = (command, args, env) => {
  const result = execute(command, args, { env, stdio: "inherit" });

  if (result.error || result.status !== 0) {
    throw new Error(buildCommandError(command, args, result));
  }
};

const isPortOpen = (host, port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });

const runCompose = (args) => {
  run(
    "docker",
    ["compose", "-f", composeFile, "-p", composeProjectName, ...args],
    process.env
  );
};

const checkDockerPrerequisites = () => {
  const dockerVersion = execute("docker", ["--version"]);
  const composeVersion = execute("docker", ["compose", "version"]);

  if (dockerVersion.error || dockerVersion.status !== 0) {
    throw new Error("Docker is required for local database integration tests");
  }

  if (composeVersion.error || composeVersion.status !== 0) {
    throw new Error("Docker Compose is required for local database integration tests");
  }

  return {
    composeVersion: composeVersion.stdout,
    dockerVersion: dockerVersion.stdout,
  };
};

const waitForPostgres = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await isPortOpen(postgresHost, postgresPort)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Timed out waiting for Postgres to become reachable");
};

const ensureLocalPostgres = async () => {
  if (await isPortOpen(postgresHost, postgresPort)) {
    info("Postgres is already reachable on 127.0.0.1:5432");
    return { startedContainer: false };
  }

  info("Starting local Postgres container");
  runCompose(["up", "-d", serviceName]);
  await waitForPostgres();

  return { startedContainer: true };
};

const stopLocalPostgres = ({ warnOnly = false } = {}) => {
  try {
    runCompose(["down"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to stop Postgres container";

    if (warnOnly) {
      warn(message);
      return;
    }

    throw error;
  }
};

const printHelp = () => {
  console.log(`Usage: node scripts/database-local.mjs <command>

Commands:
  doctor       Inspect local database integration prerequisites
  down         Stop the local Postgres container
  help         Show this help text
  integration  Start Postgres (if needed), migrate schema, run LAM DB tests
  up           Start the local Postgres container
`);
};

const doctor = async () => {
  printHelp();
  console.log("");
  info(`Compose file: ${composeFile}`);
  info(`Compose project: ${composeProjectName}`);

  const versions = checkDockerPrerequisites();
  info(versions.dockerVersion);
  info(versions.composeVersion);

  if (await isPortOpen(postgresHost, postgresPort)) {
    info("127.0.0.1:5432 is reachable");
    return;
  }

  warn("127.0.0.1:5432 is not serving Postgres right now");
  info("Run `pnpm run database:local:start` to boot the local container");
};

const up = async () => {
  checkDockerPrerequisites();
  const { startedContainer } = await ensureLocalPostgres();

  if (startedContainer) {
    info("Local Postgres is ready");
  }
};

const down = () => {
  checkDockerPrerequisites();
  stopLocalPostgres();
};

const integration = async () => {
  let startedContainer = false;
  let integrationError;

  try {
    if (!(await isPortOpen(postgresHost, postgresPort))) {
      checkDockerPrerequisites();
    }

    ({ startedContainer } = await ensureLocalPostgres());

    info(`DATABASE_URL=${databaseUrl}`);
    info("Applying database migrations");
    run(
      "pnpm",
      ["--filter", "@repo/database", "db:migrate"],
      integrationEnv
    );

    info("Running leave-attendance-management database integration tests");
    run(
      "pnpm",
      [
        "--filter",
        "@repo/features-time-attendance-leave-attendance-management",
        "test:integration",
      ],
      integrationEnv
    );
  } catch (error) {
    integrationError = error;
    throw error;
  } finally {
    if (startedContainer) {
      stopLocalPostgres({ warnOnly: Boolean(integrationError) });
    }
  }
};

const command = process.argv[2];

try {
  switch (command) {
    case undefined:
    case "help":
      printHelp();
      break;
    case "doctor":
      await doctor();
      break;
    case "down":
      down();
      break;
    case "integration":
      await integration();
      break;
    case "up":
      await up();
      break;
    default:
      fail(
        `Unknown command: ${command}\n\nSupported commands: ${[...commands]
          .sort()
          .join(", ")}`
      );
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
