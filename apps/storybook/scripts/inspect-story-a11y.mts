import { getViolations, injectAxe } from "axe-playwright";
import { chromium } from "playwright";

const storyId = process.argv[2] ?? "metadata-ui-actions--button-action";
const port = Number(process.env.STORYBOOK_TEST_PORT ?? "6010");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(
  `http://localhost:${port}/iframe.html?id=${storyId}&viewMode=story`,
  { waitUntil: "networkidle", timeout: 60_000 }
);
await injectAxe(page);
const violations = await getViolations(page, "#storybook-root");
console.log(`violations: ${violations.length}`);

for (const violation of violations) {
  console.log(`\n${violation.id}: ${violation.help}`);
  for (const node of violation.nodes) {
    console.log(`  target: ${JSON.stringify(node.target)}`);
    console.log(`  html: ${node.html.slice(0, 200)}`);
    if (node.failureSummary) {
      console.log(`  summary: ${node.failureSummary}`);
    }
  }
}

await browser.close();
