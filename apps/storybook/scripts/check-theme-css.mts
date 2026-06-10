import { readFileSync } from "node:fs";
import { join } from "node:path";

const storybookRoot = join(import.meta.dirname, "..");
const previewCssPath = join(storybookRoot, ".storybook/preview.css");
const previewTsxPath = join(storybookRoot, ".storybook/preview.tsx");
const globalsCssPath = join(
  storybookRoot,
  "../../packages/ui/src/styles/globals.css",
);
const badgePath = join(
  storybookRoot,
  "../../packages/ui/src/components/ui-shadcn/badge.tsx",
);

const previewCss = readFileSync(previewCssPath, "utf8");
const previewTsx = readFileSync(previewTsxPath, "utf8");
const globalsCss = readFileSync(globalsCssPath, "utf8");
const badgeTsx = readFileSync(badgePath, "utf8");

const errors: string[] = [];

if (
  !/@import\s+["']@repo\/ui\/styles\/globals\.css["']/.test(previewCss)
) {
  errors.push(
    "preview.css must @import @repo/ui/styles/globals.css (token source of truth)",
  );
}

if (/@import\s+["']tailwindcss["']/.test(previewCss)) {
  errors.push(
    "preview.css must not @import tailwindcss; inherit the pipeline from globals.css",
  );
}

if (/@repo\/ui\/styles\/globals\.css/.test(previewTsx)) {
  errors.push(
    "preview.tsx must import only ./preview.css, not globals.css directly (avoid duplicate Tailwind pipelines)",
  );
}

if (!/@source\s+["']\.\.\/stories\/\*\*\//.test(previewCss)) {
  errors.push("preview.css must @source ../stories/**/*.{ts,tsx}");
}

if (!globalsCss.includes("@theme inline")) {
  errors.push("globals.css must declare @theme inline for Tailwind v4 utilities");
}

if (!/^:root\s*\{/m.test(globalsCss)) {
  errors.push("globals.css must define :root at top level (not inside @layer base)");
}

if (!/^\.dark\s*\{/m.test(globalsCss)) {
  errors.push("globals.css must define .dark at top level for theme switching");
}

if (/@layer base\s*\{[\s\S]*?:root/.test(globalsCss)) {
  errors.push(
    "globals.css must not nest :root inside @layer base (shadcn Tailwind v4 rule)",
  );
}

const requiredThemeMappings = [
  "--color-background: var(--background)",
  "--color-foreground: var(--foreground)",
  "--color-primary: var(--primary)",
  "--color-card: var(--card)",
  "--color-border: var(--border)",
  "--shadow-sm: var(--elevation-sm)",
  "--radius-panel: var(--radius-panel)",
];

for (const mapping of requiredThemeMappings) {
  if (!globalsCss.includes(mapping)) {
    errors.push(`globals.css @theme inline missing required mapping: ${mapping}`);
  }
}

const mutedForegroundMappings = [
  "--color-info-muted-foreground: var(--info-muted-foreground)",
  "--color-success-muted-foreground: var(--success-muted-foreground)",
  "--color-warning-muted-foreground: var(--warning-muted-foreground)",
  "--color-destructive-muted-foreground: var(--destructive-muted-foreground)",
];

for (const mapping of mutedForegroundMappings) {
  if (!globalsCss.includes(mapping)) {
    errors.push(
      `globals.css @theme inline missing surface badge mapping: ${mapping}`,
    );
  }
}

const badSurfaceBadgeForeground =
  /"(?:info|success|warning|destructive)-(?:outline|light)":\s*\n?\s*"[^"]*text-(?:info|success|warning|destructive)-foreground/;

if (badSurfaceBadgeForeground.test(badgeTsx)) {
  errors.push(
    "Badge *-outline/*-light variants must use *-muted-foreground on surfaces, not *-foreground (filled-badge contrast pair)",
  );
}

if (errors.length > 0) {
  console.error("Theme CSS gate failed:\n");
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  process.exit(1);
}

console.log("Theme CSS gate passed.");
