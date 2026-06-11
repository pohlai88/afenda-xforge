import { chromium } from "playwright";

const logs = [];

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  page.on("console", (message) => {
    logs.push(`console.${message.type()}: ${message.text()}`);
  });

  page.on("pageerror", (error) => {
    logs.push(`pageerror: ${error.message}`);
  });

  await page.goto(
    process.argv[2] ?? "http://localhost:3000/en/theme-studio/workspace-rail",
    {
      timeout: 90_000,
      waitUntil: "networkidle",
    }
  );

  logs.push(`url-after-goto: ${page.url()}`);

  const bells = page.getByRole("button", { name: /Notifications/i });
  const bellCount = await bells.count();
  logs.push(`bell-count: ${bellCount}`);

  if (bellCount === 0) {
    await browser.close();
    console.log(JSON.stringify({ logs }, null, 2));
    return;
  }

  const bell = bells.first();
  const triggerState = await bell.evaluate((node) => ({
    ariaExpanded: node.getAttribute("aria-expanded"),
    ariaHaspopup: node.getAttribute("aria-haspopup"),
    dataSlot: node.getAttribute("data-slot"),
    dataState: node.getAttribute("data-state"),
    tagName: node.tagName,
  }));
  logs.push(`trigger-before-click: ${JSON.stringify(triggerState)}`);

  await bell.click({ timeout: 5000 });
  await page.waitForTimeout(800);

  const afterClick = await page
    .locator('[data-slot="popover-trigger"]')
    .first()
    .evaluate((node) => ({
      ariaExpanded: node.getAttribute("aria-expanded"),
      dataState: node.getAttribute("data-state"),
    }))
    .catch(() => ({ ariaExpanded: null, dataState: "missing" }));
  logs.push(`trigger-after-click: ${JSON.stringify(afterClick)}`);

  const popoverCount = await page
    .locator('[data-slot="popover-content"]')
    .count();
  const sheetCount = await page.locator('[data-slot="sheet-content"]').count();
  logs.push(`popover-count: ${popoverCount}`);
  logs.push(`sheet-count: ${sheetCount}`);

  if (popoverCount > 0) {
    const popoverInfo = await page
      .locator('[data-slot="popover-content"]')
      .first()
      .evaluate((node) => {
        const style = window.getComputedStyle(node);
        return {
          clientHeight: node.clientHeight,
          clientWidth: node.clientWidth,
          dataState: node.getAttribute("data-state"),
          display: style.display,
          opacity: style.opacity,
          visibility: style.visibility,
          zIndex: style.zIndex,
        };
      });
    logs.push(`popover-info: ${JSON.stringify(popoverInfo)}`);
  }

  const archiveVisible = await page
    .getByText("Archive all")
    .isVisible()
    .catch(() => false);
  logs.push(`archive-all-visible: ${archiveVisible}`);

  await browser.close();
  console.log(JSON.stringify({ logs }, null, 2));
};

run().catch((error) => {
  console.error(JSON.stringify({ error: error.message, logs }, null, 2));
  process.exit(1);
});
