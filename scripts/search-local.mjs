#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";

const rootDirectory = path.resolve(import.meta.dirname, "..");
const composeFile = path.join(rootDirectory, "docker-compose.search.yml");
const composeProjectName = "xforge-search-itest";
const meilisearchUrl = "http://127.0.0.1:7700";
const meilisearchApiKey = "xforge-search-test-key";
const serviceName = "meilisearch";
const meilisearchHost = "127.0.0.1";
const meilisearchPort = 7700;
const integrationEnv = {
  ...process.env,
  MEILISEARCH_API_KEY: meilisearchApiKey,
  MEILISEARCH_INTEGRATION: "true",
  MEILISEARCH_URL: meilisearchUrl,
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

const probe = (command, args) => {
  const result = execute(command, args);

  return {
    ok: !result.error && result.status === 0,
    result,
  };
};

const checkDockerPrerequisites = () => {
  const docker = probe("docker", ["--version"]);
  if (!docker.ok) {
    throw new Error(
      [
        "Docker CLI is required for local Meilisearch commands.",
        `Install Docker Desktop and make sure \`docker\` is on PATH, then rerun \`${renderCommand("pnpm", ["run", "search:local:doctor"])}\`.`,
        buildCommandError("docker", ["--version"], docker.result),
      ].join("\n")
    );
  }

  const compose = probe("docker", ["compose", "version"]);
  if (!compose.ok) {
    throw new Error(
      [
        "Docker Compose v2 is required for local Meilisearch commands.",
        "Update Docker Desktop or install a Docker distribution that provides `docker compose`.",
        buildCommandError("docker", ["compose", "version"], compose.result),
      ].join("\n")
    );
  }

  return {
    composeVersion: compose.result.stdout,
    dockerVersion: docker.result.stdout,
  };
};

const inspectDockerEngine = () => {
  const result = execute("docker", ["info", "--format", "{{.ServerVersion}}"]);

  if (!result.error && result.status === 0) {
    return {
      message: `Docker Engine reachable (server ${result.stdout})`,
      ok: true,
    };
  }

  return {
    message:
      "Docker Engine is not reachable right now. Start Docker Desktop before using `search:local:start` or `search:integration`.",
    ok: false,
  };
};

const printHelp = () => {
  console.log(
    [
      "Search package local workflow",
      "",
      "Commands:",
      "  pnpm run search:local           Show this help",
      "  pnpm run search:local:doctor    Check Docker/Compose and local Meilisearch readiness",
      "  pnpm run search:local:start     Start the local Meilisearch container",
      "  pnpm run search:local:stop      Stop the local Meilisearch container",
      "  pnpm run search:integration     Start Meilisearch if needed and run @repo/search integration tests",
      "",
      "Integration env injected by the helper:",
      `  MEILISEARCH_URL=${meilisearchUrl}`,
      `  MEILISEARCH_API_KEY=${meilisearchApiKey}`,
      "  MEILISEARCH_INTEGRATION=true",
      "",
      "Direct package-level test command:",
      "  pnpm --filter @repo/search test:integration",
    ].join("\n")
  );
};

const runCompose = (composeArgs) => {
  run(
    "docker",
    ["compose", "-p", composeProjectName, "-f", composeFile, ...composeArgs],
    integrationEnv
  );
};

const stopLocalMeilisearch = ({ warnOnly } = { warnOnly: false }) => {
  info("Stopping Meilisearch test container");

  try {
    runCompose(["down", "-v", "--remove-orphans"]);
  } catch (error) {
    if (warnOnly) {
      warn(error instanceof Error ? error.message : String(error));
      return;
    }

    throw error;
  }
};

const isPortOpen = (host, port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const finalize = (isOpen) => {
      socket.destroy();
      resolve(isOpen);
    };

    socket.setTimeout(1000);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));
  });

const waitForHealth = async (baseUrl, { timeoutMessage } = {}) => {
  const timeoutMs = 60_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        const body = await response.json();
        if (body?.status === "available") {
          return;
        }
      }
    } catch {
      // Keep retrying until the container is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    timeoutMessage ??
      "Timed out waiting for Meilisearch to become available on 127.0.0.1:7700"
  );
};

const ensureHealthyLocalMeilisearch = async ({ startedWithDocker }) => {
  const timeoutMessage = startedWithDocker
    ? [
        "Timed out waiting for Meilisearch to become available after starting Docker Compose.",
        `Inspect container logs with \`${renderCommand("docker", [
          "compose",
          "-p",
          composeProjectName,
          "-f",
          composeFile,
          "logs",
          serviceName,
        ])}\`.`,
      ].join("\n")
    : [
        "127.0.0.1:7700 is already in use, but it did not report a healthy Meilisearch instance.",
        "Stop the conflicting service or start Meilisearch on that port before rerunning the integration helper.",
      ].join("\n");

  await waitForHealth(meilisearchUrl, { timeoutMessage });
};

const ensureLocalMeilisearch = async () => {
  if (await isPortOpen(meilisearchHost, meilisearchPort)) {
    info("Meilisearch already reachable on 127.0.0.1:7700");
    await ensureHealthyLocalMeilisearch({ startedWithDocker: false });

    return { startedContainer: false };
  }

  checkDockerPrerequisites();
  info("Starting Meilisearch with Docker Compose");
  runCompose(["up", "-d", serviceName]);
  await ensureHealthyLocalMeilisearch({ startedWithDocker: true });

  return { startedContainer: true };
};

const doctor = async () => {
  printHelp();
  console.log("");
  info(`Compose file: ${composeFile}`);
  info(`Compose project: ${composeProjectName}`);

  const versions = checkDockerPrerequisites();
  info(versions.dockerVersion);
  info(versions.composeVersion);

  const dockerEngine = inspectDockerEngine();
  if (dockerEngine.ok) {
    info(dockerEngine.message);
  } else {
    warn(dockerEngine.message);
  }

  if (await isPortOpen(meilisearchHost, meilisearchPort)) {
    info("127.0.0.1:7700 is reachable; checking Meilisearch health");
    await ensureHealthyLocalMeilisearch({ startedWithDocker: false });
    info("Local Meilisearch is healthy");
    return;
  }

  warn("127.0.0.1:7700 is not serving Meilisearch right now");
  info("Run `pnpm run search:local:start` to boot the local container");
};

const up = async () => {
  checkDockerPrerequisites();
  const dockerEngine = inspectDockerEngine();
  if (!dockerEngine.ok) {
    throw new Error(dockerEngine.message);
  }

  const { startedContainer } = await ensureLocalMeilisearch();
  if (startedContainer) {
    info("Local Meilisearch is ready");
  }
};

const down = () => {
  checkDockerPrerequisites();
  stopLocalMeilisearch();
};

const integration = async () => {
  const dockerEngine = inspectDockerEngine();
  let startedContainer = false;
  let integrationError;

  try {
    if (!(await isPortOpen(meilisearchHost, meilisearchPort))) {
      checkDockerPrerequisites();
      if (!dockerEngine.ok) {
        throw new Error(dockerEngine.message);
      }
    }

    ({ startedContainer } = await ensureLocalMeilisearch());

    info("Injected integration env:");
    info(`MEILISEARCH_URL=${meilisearchUrl}`);
    info(`MEILISEARCH_API_KEY=${meilisearchApiKey}`);
    info("MEILISEARCH_INTEGRATION=true");
    info("Running @repo/search integration test");
    run(
      "pnpm",
      ["--filter", "@repo/search", "test:integration"],
      integrationEnv
    );
  } catch (error) {
    integrationError = error;
    throw error;
  } finally {
    if (startedContainer) {
      stopLocalMeilisearch({ warnOnly: Boolean(integrationError) });
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
      await down();
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
