import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const TESTS_ROOT = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TESTS_ROOT, "..");
const REPO_ROOT = resolve(APP_ROOT, "..", "..");

const COMPATIBILITY_ALIAS_PATTERN =
  /\bafendaDesignTokenExport\b|\bafendaTokenUiDisplayTokens\b|\bafendaTokenizedTokens\b|\bvalidateAfendaTokenizedTokens\b/;
const LEGACY_TOKEN_GROUP_AGGREGATE_PATTERN = /\bdesignSystemTokenGroups\b/;
const LEGACY_TOKENIZED_GROUP_PATTERN = /\bdesignSystemTokenGroups\.tokenized\b/;
const LEGACY_VARIANT_GROUP_AGGREGATE_PATTERN =
  /\bdesignSystemVariants\b|\bdesignSystemVariantGroups\b/;
const SOURCE_FILE_EXTENSIONS = new Set([".ts", ".tsx", ".mdx"]);
const IGNORED_SOURCE_DIRECTORIES = new Set([
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
]);

function readSource(absolutePath: string): string {
  return readFileSync(absolutePath, "utf8");
}

function isNonTestSourceFile(absolutePath: string): boolean {
  return (
    SOURCE_FILE_EXTENSIONS.has(extname(absolutePath)) &&
    !absolutePath.includes("\\tests\\") &&
    !absolutePath.includes("\\__tests__\\") &&
    !absolutePath.endsWith(".test.ts") &&
    !absolutePath.endsWith(".test.tsx")
  );
}

function collectSourceFiles(root: string): string[] {
  const entries = readdirSync(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = resolve(root, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_SOURCE_DIRECTORIES.has(entry.name)) {
        continue;
      }
      files.push(...collectSourceFiles(absolutePath));
      continue;
    }

    if (SOURCE_FILE_EXTENSIONS.has(extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function collectNonTestSourceFiles(root: string): string[] {
  return collectSourceFiles(root).filter(isNonTestSourceFile);
}

describe("token consumer migration", () => {
  it("keeps preview surfaces on runtime token snapshot shapes", () => {
    const tokenizePreviewSource = readSource(
      resolve(
        APP_ROOT,
        "app",
        "[locale]",
        "theme-studio",
        "_components",
        "tokenize-preview.tsx"
      )
    );
    const colorPanelSource = readSource(
      resolve(
        APP_ROOT,
        "app",
        "[locale]",
        "theme-studio",
        "_components",
        "afenda-color-tokens-panel.tsx"
      )
    );

    expect(tokenizePreviewSource).toMatch(/resolveAfendaRuntimeTokenSnapshot/);
    expect(tokenizePreviewSource).toMatch(/AfendaRuntimeTokenSnapshot/);
    expect(tokenizePreviewSource).toMatch(/AfendaRuntimeToken/);
    expect(tokenizePreviewSource).not.toMatch(COMPATIBILITY_ALIAS_PATTERN);
    expect(tokenizePreviewSource).not.toMatch(LEGACY_TOKEN_GROUP_AGGREGATE_PATTERN);
    expect(tokenizePreviewSource).not.toMatch(LEGACY_TOKENIZED_GROUP_PATTERN);
    expect(tokenizePreviewSource).not.toMatch(LEGACY_VARIANT_GROUP_AGGREGATE_PATTERN);

    expect(colorPanelSource).toMatch(/AfendaRuntimeTokenSnapshot/);
    expect(colorPanelSource).toMatch(/AfendaRuntimeToken/);
    expect(colorPanelSource).not.toMatch(COMPATIBILITY_ALIAS_PATTERN);
    expect(colorPanelSource).not.toMatch(LEGACY_TOKEN_GROUP_AGGREGATE_PATTERN);
    expect(colorPanelSource).not.toMatch(LEGACY_TOKENIZED_GROUP_PATTERN);
    expect(colorPanelSource).not.toMatch(LEGACY_VARIANT_GROUP_AGGREGATE_PATTERN);
  });

  it("keeps the shared ui token renderer on canonical token shapes", () => {
    const uiRendererSource = readSource(
      resolve(
        REPO_ROOT,
        "packages",
        "ui",
        "src",
        "components",
        "token-ui",
        "afenda-token-display.tsx"
      )
    );

    expect(uiRendererSource).toMatch(/AfendaTokenUiDisplayToken/);
    expect(uiRendererSource).toMatch(/AfendaRuntimeToken/);
    expect(uiRendererSource).not.toMatch(COMPATIBILITY_ALIAS_PATTERN);
    expect(uiRendererSource).not.toMatch(LEGACY_TOKEN_GROUP_AGGREGATE_PATTERN);
    expect(uiRendererSource).not.toMatch(LEGACY_VARIANT_GROUP_AGGREGATE_PATTERN);
  });

  it("keeps branding, settings, shared surfaces, storybook, and docs free of compatibility aliases", () => {
    const migrationSurfaceRoots = [
      resolve(
        APP_ROOT,
        "app",
        "[locale]",
        "(authenticated)",
        "admin",
        "branding"
      ),
      resolve(
        APP_ROOT,
        "app",
        "[locale]",
        "(authenticated)",
        "settings",
        "appearance"
      ),
      resolve(APP_ROOT, "app", "_components"),
      resolve(REPO_ROOT, "apps", "storybook", "stories"),
      resolve(REPO_ROOT, "apps", "docs"),
    ];

    for (const root of migrationSurfaceRoots) {
      for (const filePath of collectSourceFiles(root)) {
        const source = readSource(filePath);
        expect(source, filePath).not.toMatch(COMPATIBILITY_ALIAS_PATTERN);
        expect(source, filePath).not.toMatch(LEGACY_TOKEN_GROUP_AGGREGATE_PATTERN);
        expect(source, filePath).not.toMatch(LEGACY_TOKENIZED_GROUP_PATTERN);
        expect(source, filePath).not.toMatch(LEGACY_VARIANT_GROUP_AGGREGATE_PATTERN);
      }
    }
  });

  it("keeps repo source files free of removed legacy import names", () => {
    const migrationSourceRoots = [
      resolve(REPO_ROOT, "apps"),
      resolve(REPO_ROOT, "packages"),
    ];

    for (const root of migrationSourceRoots) {
      for (const filePath of collectNonTestSourceFiles(root)) {
        const source = readSource(filePath);
        expect(source, filePath).not.toMatch(COMPATIBILITY_ALIAS_PATTERN);
      }
    }
  }, 20_000);
});
