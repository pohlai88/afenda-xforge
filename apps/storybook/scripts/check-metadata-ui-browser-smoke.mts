import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const port = Number(process.env.METADATA_UI_STORYBOOK_PORT ?? "6106");
const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const storyUrl = `http://localhost:${port}/iframe.html?id=metadata-ui-smoke--overview&viewMode=story`;

async function waitForServer(url: string): Promise<void> {
  const startedAt = Date.now();
  const timeoutMs = 60_000;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
      });

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
  await waitForServer(storyUrl);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(storyUrl, {
    waitUntil: "networkidle",
  });

  const heading = page.getByRole("heading", { name: "Metadata UI Smoke" });
  const invoiceSort = page.getByRole("button", { name: "Invoice" });
  const search = page.getByRole("textbox", { name: /search invoices/i });
  const customerSort = page.getByRole("button", { name: "Customer" });
  const nextButton = page.getByRole("button", { name: "Next" });
  const previousButton = page.getByRole("button", { name: "Previous" });
  const customerHeader = page
    .locator("thead th", { hasText: "Customer" })
    .first();

  assert.equal(await heading.isVisible(), true, "story heading should render");
  assert.equal(
    await search.isVisible(),
    true,
    "search input should be visible"
  );
  assert.equal(
    await page.getByRole("heading", { name: "Profile" }).isVisible(),
    true,
    "metadata form should render"
  );
  assert.equal(
    await page.getByText("Ready content").isVisible(),
    true,
    "state boundary ready content should render"
  );

  assert.equal(
    await customerHeader.getAttribute("aria-sort"),
    "ascending",
    "default metadata sort should be exposed through aria-sort"
  );

  assert.equal(
    await nextButton.isEnabled(),
    true,
    "next page control should be enabled"
  );
  await nextButton.click();
  assert.equal(
    await page.getByText("Soylent").isVisible(),
    true,
    "pagination should reveal the third row"
  );
  await previousButton.click();
  assert.equal(
    await page.getByText("Acme").isVisible(),
    true,
    "previous page should return to the first page"
  );

  await search.fill("Globex");
  assert.equal(
    await page.getByText("Globex").isVisible(),
    true,
    "search should keep the matching row"
  );
  assert.equal(
    await page.getByText("Acme").count(),
    0,
    "search should filter non-matching rows"
  );

  await search.fill("");
  await customerSort.click();
  assert.equal(
    await customerHeader.getAttribute("aria-sort"),
    "descending",
    "sortable columns should expose descending aria-sort after a sort toggle"
  );
  await customerSort.click();
  assert.equal(
    await customerHeader.getAttribute("aria-sort"),
    "none",
    "sortable columns should expose an unsorted state after cycling the toggle"
  );

  await invoiceSort.focus();
  assert.equal(
    await invoiceSort.evaluate((node) => node === document.activeElement),
    true,
    "sortable header controls should remain keyboard focusable"
  );

  assert.deepEqual(
    consoleErrors,
    [],
    "storybook smoke should not emit console errors"
  );

  await browser.close();
} catch (error) {
  throw new Error(
    `${error instanceof Error ? error.message : String(error)}\n\nStorybook output:\n${serverOutput}`
  );
} finally {
  await stopServer();
}

console.log("metadata-ui browser smoke checks passed");
