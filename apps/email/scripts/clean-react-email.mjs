import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const previewAppDir = resolve(scriptDir, "..", ".react-email");

try {
  await rm(previewAppDir, {
    force: true,
    recursive: true,
    maxRetries: 10,
    retryDelay: 200,
  });
} catch (error) {
  if (
    error instanceof Error &&
    "code" in error &&
    (error.code === "EBUSY" || error.code === "EPERM")
  ) {
    console.warn(
      `Skipping .react-email cleanup because the directory is locked: ${previewAppDir}`
    );
  } else {
    throw error;
  }
}
