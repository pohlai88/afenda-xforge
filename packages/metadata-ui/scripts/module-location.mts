import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const windowsAbsolutePathPattern = /^[A-Za-z]:[\\/]/;

export function resolveModuleFilename(moduleUrl: string): string {
  if (moduleUrl.startsWith("file://")) {
    return fileURLToPath(moduleUrl);
  }

  if (
    windowsAbsolutePathPattern.test(moduleUrl) ||
    moduleUrl.startsWith("/") ||
    moduleUrl.startsWith("\\")
  ) {
    return moduleUrl;
  }

  return fileURLToPath(new URL(moduleUrl));
}

export function resolveFromModule(
  moduleUrl: string,
  ...segments: readonly string[]
): string {
  return resolve(dirname(resolveModuleFilename(moduleUrl)), ...segments);
}
