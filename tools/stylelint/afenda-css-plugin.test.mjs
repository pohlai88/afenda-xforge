import test from "node:test";
import {
  expectRuleClean,
  expectRuleViolation,
  globalsPath,
  previewPath,
} from "./test-helpers.mjs";

test("afenda/no-root-in-layer-base rejects nested :root", async () => {
  await expectRuleViolation(
    "afenda/no-root-in-layer-base",
    "@layer base { :root { --background: oklch(0.5 0 0); } }"
  );
});

test("afenda/no-root-in-layer-base allows top-level :root", async () => {
  await expectRuleClean(
    "afenda/no-root-in-layer-base",
    ":root { --background: oklch(0.5 0 0); }",
    globalsPath
  );
});

test("afenda/no-dark-nested-theme rejects nested @theme in .dark", async () => {
  await expectRuleViolation(
    "afenda/no-dark-nested-theme",
    ".dark { @theme { --color-primary: oklch(0.5 0 0); } }"
  );
});

test("afenda/no-hsl-var-wrap rejects hsl(var()) double-wrap", async () => {
  await expectRuleViolation(
    "afenda/no-hsl-var-wrap",
    "body { color: hsl(var(--foreground)); }"
  );
});

test("afenda/theme-inline-uses-var rejects raw color in @theme inline", async () => {
  await expectRuleViolation(
    "afenda/theme-inline-uses-var",
    "@theme inline { --color-primary: oklch(0.5 0 0); }",
    globalsPath
  );
});

test("afenda/token-sources-use-oklch-or-var rejects hex in :root", async () => {
  await expectRuleViolation(
    "afenda/token-sources-use-oklch-or-var",
    ":root { --background: #ffffff; }",
    globalsPath
  );
});

test("afenda/preview-css-pipeline rejects duplicate tailwind import", async () => {
  await expectRuleViolation(
    "afenda/preview-css-pipeline",
    '@import "tailwindcss";',
    previewPath
  );
});

test("afenda/preview-css-pipeline requires globals import", async () => {
  await expectRuleViolation(
    "afenda/preview-css-pipeline",
    "@utility sb-intro-grid-bg { background-size: 72px 72px; }",
    previewPath
  );
});

test("afenda/utility-uses-declarations rejects empty @utility", async () => {
  await expectRuleViolation(
    "afenda/utility-uses-declarations",
    "@utility empty;"
  );
});

test("afenda/require-custom-variant-dark requires dark custom variant", async () => {
  await expectRuleViolation(
    "afenda/require-custom-variant-dark",
    ":root { --background: oklch(0.5 0 0); }",
    globalsPath
  );
});

test("afenda/require-top-level-root-dark requires top-level selectors", async () => {
  await expectRuleViolation(
    "afenda/require-top-level-root-dark",
    "@layer base { body { color: oklch(0.5 0 0); } }",
    globalsPath
  );
});

test("afenda/require-theme-inline requires @theme inline", async () => {
  await expectRuleViolation(
    "afenda/require-theme-inline",
    ":root { --background: oklch(0.5 0 0); } .dark { --background: oklch(0.2 0 0); }",
    globalsPath
  );
});

test("afenda/require-theme-inline-mappings requires semantic mappings", async () => {
  await expectRuleViolation(
    "afenda/require-theme-inline-mappings",
    "@theme inline { --color-background: var(--background); }",
    globalsPath
  );
});

test("afenda/tailwind-import-only-in-globals rejects tailwind import in preview.css", async () => {
  await expectRuleViolation(
    "afenda/tailwind-import-only-in-globals",
    '@import "tailwindcss";',
    previewPath
  );
});

test("afenda/tailwind-import-only-in-globals allows tailwind import in globals.css", async () => {
  await expectRuleClean(
    "afenda/tailwind-import-only-in-globals",
    '@import "tailwindcss"; :root { --background: oklch(0.5 0 0); } .dark { --background: oklch(0.2 0 0); }',
    globalsPath
  );
});

test("afenda/prefer-neutral-ring rejects brand-primary focus ring", async () => {
  await expectRuleViolation(
    "afenda/prefer-neutral-ring",
    ":root { --ring: var(--brand-primary); }",
    globalsPath
  );
});

test("afenda/prefer-neutral-ring allows neutral oklch focus ring", async () => {
  await expectRuleClean(
    "afenda/prefer-neutral-ring",
    ":root { --ring: oklch(0.55 0.02 264); --ring-brand: var(--brand-primary); }",
    globalsPath
  );
});
