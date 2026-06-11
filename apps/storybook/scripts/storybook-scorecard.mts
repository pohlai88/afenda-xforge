/**
 * Informational Storybook scorecard for CI logs.
 * Usage: tsx scripts/storybook-scorecard.mts (after check:build)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const storiesDir = path.join(storybookRoot, "stories");
const staticDir = path.join(storybookRoot, "storybook-static");

const PLAY_TARGET = 6;
const CHUNK_WARN_KB = 500;

const gateChecks = [
  { label: "theme-css", command: ["pnpm", "run", "check:theme-css"] },
  { label: "stylelint", command: ["pnpm", "run", "check:stylelint"] },
  { label: "intro-layout", command: ["pnpm", "run", "check:intro-layout"] },
  {
    label: "storybook-visual-tokens",
    command: ["pnpm", "run", "check:storybook-visual-tokens"],
  },
] as const;

function runGateCheck(label: string, command: readonly string[]): boolean {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: storybookRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  const passed = result.status === 0;
  console.log(`  gate ${label}: ${passed ? "pass" : "fail"}`);

  if (!passed && result.stderr) {
    console.log(result.stderr.trim());
  }

  return passed;
}

function countFiles(dir: string, pattern: RegExp): number {
  let count = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath, pattern);
    } else if (pattern.test(entry.name)) {
      count += 1;
    }
  }

  return count;
}

function countPlayFunctions(): number {
  let count = 0;
  const storyFiles = fs
    .readdirSync(storiesDir)
    .filter((name) => name.endsWith(".stories.tsx"));

  for (const file of storyFiles) {
    const content = fs.readFileSync(path.join(storiesDir, file), "utf8");
    const matches = content.match(/\bplay:\s*async/g);
    count += matches?.length ?? 0;
  }

  return count;
}

function countA11yTiers(): { error: number; todo: number } {
  let error = 0;
  let todo = 0;

  for (const file of fs.readdirSync(storiesDir)) {
    if (!file.endsWith(".stories.tsx")) {
      continue;
    }

    const content = fs.readFileSync(path.join(storiesDir, file), "utf8");
    error += (content.match(/a11y:\s*\{\s*test:\s*["']error["']/g) ?? [])
      .length;
    todo += (content.match(/galleryStory\([^,]+,\s*["']todo["']\)/g) ?? [])
      .length;
    todo += (content.match(/a11y:\s*\{\s*test:\s*["']todo["']/g) ?? []).length;
  }

  return { error, todo };
}

function largestJsChunks(): {
  overall: { name: string; bytes: number } | null;
  composeCategory: { name: string; bytes: number } | null;
} {
  const assetsDir = path.join(staticDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    return { overall: null, composeCategory: null };
  }

  let overall: { name: string; bytes: number } | null = null;
  let composeCategory: { name: string; bytes: number } | null = null;

  for (const name of fs.readdirSync(assetsDir)) {
    if (!name.endsWith(".js")) {
      continue;
    }

    const bytes = fs.statSync(path.join(assetsDir, name)).size;
    if (!overall || bytes > overall.bytes) {
      overall = { name, bytes };
    }

    if (
      name.startsWith("ui-compose-") &&
      (!composeCategory || bytes > composeCategory.bytes)
    ) {
      composeCategory = { name, bytes };
    }
  }

  return { overall, composeCategory };
}

const storyFileCount = countFiles(storiesDir, /\.stories\.tsx$/);
const mdxCount = countFiles(storiesDir, /\.mdx$/);
const playCount = countPlayFunctions();
const a11yTiers = countA11yTiers();
const { overall: largest, composeCategory } = largestJsChunks();

console.log("Storybook scorecard");
console.log("  guard gates:");
for (const gate of gateChecks) {
  runGateCheck(gate.label, gate.command);
}
console.log(`  story files: ${storyFileCount}`);
console.log(`  mdx docs: ${mdxCount}`);
console.log(`  play functions: ${playCount} (target: ${PLAY_TARGET}+)`);
console.log(
  `  a11y tiers: error=${a11yTiers.error} todo=${a11yTiers.todo} (story-level markers)`
);

if (largest) {
  const kb = largest.bytes / 1024;
  console.log(`  largest JS chunk: ${largest.name} (${kb.toFixed(1)} KB)`);
  if (!largest.name.startsWith("iframe-") && kb > CHUNK_WARN_KB) {
    console.warn(
      `  warning: largest chunk exceeds ${CHUNK_WARN_KB} KB plan target`
    );
  }
} else {
  console.log("  largest JS chunk: (run check:build first)");
}

if (composeCategory) {
  const kb = composeCategory.bytes / 1024;
  console.log(
    `  largest compose category chunk: ${composeCategory.name} (${kb.toFixed(1)} KB)`
  );
  if (kb > CHUNK_WARN_KB) {
    console.warn(
      `  warning: compose category chunk exceeds ${CHUNK_WARN_KB} KB plan target`
    );
  }
}

if (playCount < PLAY_TARGET) {
  console.warn(
    `  warning: play functions below target (${playCount}/${PLAY_TARGET})`
  );
}
