import path from "node:path";
import { fileURLToPath } from "node:url";

import { AFENDA_GLOBALS_CSS_OUTPUT } from "../../contracts/afenda/globals-css.contract";

/** Tailwind v4 scan globs relative to `packages/ui/src/styles/globals.css`. */
export const GLOBALS_CSS_UI_SOURCE_GLOBS = [
  "../components/**/*.{ts,tsx}",
  "../lib/**/*.{ts,tsx}",
  "../index.ts",
] as const;

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const designSystemRoot = path.resolve(moduleDir, "../../..");

export function resolveGlobalsCssOutputPath(
  monorepoRoot = path.resolve(designSystemRoot, "../..")
): string {
  return path.resolve(
    monorepoRoot,
    "packages",
    "ui",
    AFENDA_GLOBALS_CSS_OUTPUT.relativePath
  );
}

