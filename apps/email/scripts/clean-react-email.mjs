import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const previewAppDir = resolve(scriptDir, "..", ".react-email");

rmSync(previewAppDir, {
  force: true,
  recursive: true,
});
