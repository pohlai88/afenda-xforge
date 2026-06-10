/**
 * One-off audit: run axe on Storybook iframe URLs and print violations per story.
 * Usage: start `pnpm exec storybook dev --ci -p 6010` then `tsx scripts/audit-story-a11y.mts`
 */
import { chromium } from "playwright";
import { injectAxe, checkA11y, getViolations } from "axe-playwright";

const port = Number(process.env.STORYBOOK_TEST_PORT ?? "6010");
const baseUrl = `http://localhost:${port}`;

const index = await fetch(`${baseUrl}/index.json`).then((r) => r.json()) as {
  entries: Record<string, { title: string; name: string; type: string; importPath: string }>;
};

const filterPrefix = process.env.A11Y_AUDIT_PREFIX;
const stories = Object.values(index.entries).filter(
  (e) =>
    e.type === "story" &&
    (!filterPrefix || e.title.startsWith(filterPrefix))
);

const browser = await chromium.launch();
const page = await browser.newPage();
await injectAxe(page);

const failures: Array<{ id: string; violations: number; rules: string[] }> = [];

for (const story of stories) {
  const storyId = Object.keys(index.entries).find(
    (k) => index.entries[k] === story
  );
  if (!storyId) continue;

  const url = `${baseUrl}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForSelector("#storybook-root", { timeout: 30_000 });
  await injectAxe(page);

  try {
    await checkA11y(page, "#storybook-root", {
      axeOptions: { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } },
    });
    console.log(`PASS ${story.title} / ${story.name}`);
  } catch {
    const violations = await getViolations(page, "#storybook-root");
    const rules = violations.map((v) => v.id);
    failures.push({
      id: `${story.title} / ${story.name}`,
      violations: violations.length,
      rules,
    });
    console.log(`FAIL ${story.title} / ${story.name}: ${rules.join(", ")}`);
  }
}

await browser.close();

console.log("\n--- Summary ---");
console.log(`Pass: ${stories.length - failures.length}, Fail: ${failures.length}`);
for (const f of failures) {
  console.log(`  ${f.id}: ${f.violations} (${f.rules.join(", ")})`);
}
