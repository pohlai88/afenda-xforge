import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": appRoot,
      "src/lib/utils": path.resolve(
        appRoot,
        "../../packages/ui/src/lib/utils.ts"
      ),
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
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
