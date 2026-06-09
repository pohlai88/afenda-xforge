import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

type TelemetryManifest = {
  events: Array<{
    attributes?: readonly string[];
    name: string;
  }>;
};

const packageRoot = resolve(import.meta.dirname, "..");
const manifestPath = join(packageRoot, "snapshots", "telemetry-events.json");
const sourceFiles = [
  "src/adapters/ui-action-adapter.tsx",
  "src/adapters/ui-field-adapter.tsx",
  "src/adapters/ui-section-adapter.tsx",
  "src/adapters/ui-state-adapter.tsx",
].map((path) => join(packageRoot, path));

if (!existsSync(manifestPath)) {
  console.error(
    "metadata-ui telemetry manifest is missing. Create snapshots/telemetry-events.json first."
  );
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(manifestPath, "utf8")
) as TelemetryManifest;
const sourceText = sourceFiles
  .map((filePath) => readFileSync(filePath, "utf8"))
  .join("\n");

const violations: string[] = [];

for (const event of manifest.events) {
  if (!sourceText.includes(`"${event.name}"`)) {
    violations.push(`Missing telemetry event usage: ${event.name}`);
    continue;
  }

  for (const attribute of event.attributes ?? []) {
    const eventIndex = sourceText.indexOf(`"${event.name}"`);
    const nextSlice = sourceText.slice(eventIndex, eventIndex + 1200);
    const attributePattern = new RegExp(
      `\\b${attribute}\\b\\s*(?::|,|\\n|\\r)`,
      "m"
    );

    if (!attributePattern.test(nextSlice)) {
      violations.push(
        `Telemetry event '${event.name}' is missing required attribute '${attribute}'.`
      );
    }
  }
}

const discoveredEvents = Array.from(
  sourceText.matchAll(
    /"metadata\.[a-z]+(?:\.[a-z]+)+"|"metadata\.[a-z]+\.[a-z.]+"/g
  )
).map((match) => match[0].slice(1, -1));

for (const eventName of new Set(discoveredEvents)) {
  if (!manifest.events.some((event) => event.name === eventName)) {
    violations.push(
      `Telemetry manifest does not declare event '${eventName}'.`
    );
  }
}

if (violations.length > 0) {
  console.error("metadata-ui telemetry schema validation failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("metadata-ui telemetry schema checks passed");
