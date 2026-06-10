import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

export function checkConsumerFixtureIntegration(): void {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, "package.json"), "utf8")
  ) as { scripts?: { test?: string } };
  const testScript = packageJson.scripts?.test ?? "";

  if (!testScript.includes("public-api-consumer.render.test.tsx")) {
    throw new Error(
      "MUI-012 consumer fixture integration failed: package.json test script must run tests/public-api-consumer.render.test.tsx"
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkConsumerFixtureIntegration();
  console.log("MUI-012 consumer fixture integration lint passed.");
}
