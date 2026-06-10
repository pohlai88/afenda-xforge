/**
 * Visual regression baselines for high-value Storybook stories.
 * Run: pnpm --filter storybook test:visual
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import path from "node:path";

const port = Number(process.env.STORYBOOK_TEST_PORT ?? "6010");
const storybookRoot = fileURLToPath(new URL("../../", import.meta.url));
const snapshotDir = path.join(storybookRoot, "tests/visual/__screenshots__");
const baseUrl = `http://localhost:${port}`;

const updateSnapshots = process.argv.includes("--update");

const goldenStories = [
  { id: "introduction-overview--overview", name: "introduction-overview" },
  { id: "metadata-ui-smoke--overview", name: "metadata-ui-smoke-overview" },
  { id: "metadata-ui-actions--button-action", name: "metadata-ui-actions-button" },
  { id: "ui-compose-form--button", name: "ui-compose-form-button" },
  { id: "ui-compose-data--data-grid", name: "ui-compose-data-grid" },
  {
    id: "ui-compose-navigation--breadcrumb",
    name: "ui-compose-navigation-breadcrumb",
  },
  { id: "ui-compose-feedback--alert", name: "ui-compose-feedback-alert" },
  {
    id: "ui-primitives-actions--button-default",
    name: "ui-primitives-button-default",
  },
  {
    id: "metadata-ui-field-visual-states--field-error",
    name: "field-visual-error",
  },
] as const;

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

async function captureStory(page: Page, storyId: string, snapshotName: string) {
  const url = `${baseUrl}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForSelector("#storybook-root", { timeout: 30_000 });
  await page.addStyleTag({
    content:
      "*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }",
  });

  await delay(2000);

  const fs = await import("node:fs");
  await fs.promises.mkdir(snapshotDir, { recursive: true });

  const snapshotPath = path.join(snapshotDir, `${snapshotName}.png`);
  const screenshot = await page.screenshot({ fullPage: true });

  if (updateSnapshots) {
    await fs.promises.writeFile(snapshotPath, screenshot);
    console.log(`updated ${snapshotName}`);
    return;
  }

  if (!fs.existsSync(snapshotPath)) {
    throw new Error(
      `Missing baseline ${snapshotPath}. Run with UPDATE_SNAPSHOTS=1 to create it.`
    );
  }

  const baseline = await fs.promises.readFile(snapshotPath);
  assert.equal(
    screenshot.equals(baseline),
    true,
    `Screenshot mismatch for ${snapshotName}`
  );
  console.log(`matched ${snapshotName}`);
}

try {
  await waitForServer(`${baseUrl}/iframe.html`);
  await delay(3000);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });

  for (const story of goldenStories) {
    await captureStory(page, story.id, story.name);
  }

  await browser.close();
} catch (error) {
  throw new Error(
    `${error instanceof Error ? error.message : String(error)}\n\nStorybook output:\n${serverOutput}`
  );
} finally {
  await stopServer();
}

console.log("visual regression checks passed");
