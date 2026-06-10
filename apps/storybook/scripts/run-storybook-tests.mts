import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const port = Number(process.env.STORYBOOK_TEST_PORT ?? "6010");
const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const indexUrl = `http://localhost:${port}/iframe.html`;

async function waitForServer(url: string): Promise<void> {
  const startedAt = Date.now();
  const timeoutMs = 120_000;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok) {
        return;
      }
    } catch {
      // Poll until Storybook responds.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for Storybook at ${url}`);
}

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const server = spawn(
  command,
  [
    "exec",
    "storybook",
    "dev",
    "--ci",
    "--host",
    "localhost",
    "-p",
    String(port),
  ],
  {
    cwd: storybookRoot,
    env: {
      ...process.env,
      BROWSER: "none",
      CI: "1",
    },
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  }
);

let serverOutput = "";

server.stdout.on("data", (chunk: Buffer | string): void => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk: Buffer | string): void => {
  serverOutput += chunk.toString();
});

async function stopServer(): Promise<void> {
  if (server.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    await once(killer, "exit");
    return;
  }

  server.kill("SIGTERM");
  await Promise.race([
    once(server, "exit"),
    delay(5000).then(() => {
      if (server.exitCode === null) {
        server.kill("SIGKILL");
      }
    }),
  ]);
}

try {
  await waitForServer(indexUrl);
  await delay(5000);

  const testRunner = spawn(
    command,
    [
      "exec",
      "test-storybook",
      "--ci",
      "--config-dir",
      ".storybook",
      "--maxWorkers",
      "2",
      "--url",
      `http://localhost:${port}`,
    ],
    {
      cwd: storybookRoot,
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit",
    }
  );

  const exitCode = await new Promise<number>((resolve, reject) => {
    testRunner.on("error", reject);
    testRunner.on("exit", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) {
    throw new Error(`test-storybook exited with code ${exitCode}`);
  }
} catch (error) {
  throw new Error(
    `${error instanceof Error ? error.message : String(error)}\n\nStorybook output:\n${serverOutput}`
  );
} finally {
  await stopServer();
}

console.log("storybook test-runner checks passed");
