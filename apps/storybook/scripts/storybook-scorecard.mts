/**
 * Informational Storybook scorecard for CI logs.
 * Usage: tsx scripts/storybook-scorecard.mts (after check:build)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const storiesDir = path.join(storybookRoot, "stories");
const staticDir = path.join(storybookRoot, "storybook-static");

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

function largestJsChunk(): { name: string; bytes: number } | null {
  const assetsDir = path.join(staticDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    return null;
  }

  let largest: { name: string; bytes: number } | null = null;

  for (const name of fs.readdirSync(assetsDir)) {
    if (!name.endsWith(".js")) {
      continue;
    }

    const bytes = fs.statSync(path.join(assetsDir, name)).size;
    if (!largest || bytes > largest.bytes) {
      largest = { name, bytes };
    }
  }

  return largest;
}

const storyFileCount = countFiles(storiesDir, /\.stories\.tsx$/);
const mdxCount = countFiles(storiesDir, /\.mdx$/);
const playCount = countPlayFunctions();
const largest = largestJsChunk();

console.log("Storybook scorecard");
console.log(`  story files: ${storyFileCount}`);
console.log(`  mdx docs: ${mdxCount}`);
console.log(`  play functions: ${playCount}`);
if (largest) {
  const kb = (largest.bytes / 1024).toFixed(1);
  console.log(`  largest JS chunk: ${largest.name} (${kb} KB)`);
} else {
  console.log("  largest JS chunk: (run check:build first)");
}
