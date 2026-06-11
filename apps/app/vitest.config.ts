import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": appRoot,
      "@repo/errors": path.resolve(appRoot, "../../packages/errors/index.ts"),
      "@repo/permissions": path.resolve(
        appRoot,
        "../../packages/permissions/index.ts"
      ),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
