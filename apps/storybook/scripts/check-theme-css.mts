/**
 * Cross-file Storybook theme integration gate.
 * CSS structural invariants live in Stylelint (afenda-css-plugin + lint:stylelint).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const storybookRoot = join(import.meta.dirname, "..");
const previewTsxPath = join(storybookRoot, ".storybook/preview.tsx");
const badgePath = join(
  storybookRoot,
  "../../packages/ui/src/components/ui-shadcn/badge.tsx",
);

const previewTsx = readFileSync(previewTsxPath, "utf8");
const badgeTsx = readFileSync(badgePath, "utf8");

const errors: string[] = [];

if (/@repo\/ui\/styles\/globals\.css/.test(previewTsx)) {
  errors.push(
    "preview.tsx must import only ./preview.css, not globals.css directly (avoid duplicate Tailwind pipelines)",
  );
}

const badSurfaceBadgeForeground =
  /"(?:info|success|warning|destructive)-(?:outline|light)":\s*\n?\s*"[^"]*text-(?:info|success|warning|destructive)-foreground/;

if (badSurfaceBadgeForeground.test(badgeTsx)) {
  errors.push(
    "Badge *-outline/*-light variants must use *-muted-foreground on surfaces, not *-foreground (filled-badge contrast pair)",
  );
}

if (errors.length > 0) {
  console.error("Theme integration gate failed:\n");
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  process.exit(1);
}

console.log("Theme integration gate passed.");
