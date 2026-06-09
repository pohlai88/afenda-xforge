import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

type TelemetryManifest = {
  events: Array<{
    allowsDiagnostics: boolean;
    allowsGovernanceDecision: boolean;
    attributes?: readonly string[];
    level: "debug" | "error" | "info" | "warning";
    name: string;
    requiredContext: readonly (
      | "correlationId"
      | "featureId"
      | "moduleId"
      | "routeId"
      | "surfaceId"
    )[];
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

function getEventCallSlice(eventIndex: number): string {
  const nextEventIndex = sourceText.indexOf(
    "emitMetadataTelemetry(",
    eventIndex + 1
  );

  return sourceText.slice(
    eventIndex,
    nextEventIndex === -1 ? eventIndex + 4000 : nextEventIndex
  );
}

for (const event of manifest.events) {
  const eventLiteral = `"${event.name}"`;
  const eventIndex = sourceText.indexOf(eventLiteral);

  if (eventIndex === -1) {
    violations.push(`Missing telemetry event usage: ${event.name}`);
    continue;
  }

  const nextSlice = getEventCallSlice(eventIndex);

  if (!nextSlice.includes(`level: "${event.level}"`)) {
    violations.push(
      `Telemetry event '${event.name}' is missing expected level '${event.level}'.`
    );
  }

  const hasDiagnostics = /\bdiagnostics\b\s*(?::|,|\n|\r)/m.test(nextSlice);
  const hasGovernanceDecision =
    /\bgovernanceDecision\b\s*(?::|,|\n|\r)/m.test(nextSlice);

  if (event.allowsDiagnostics !== hasDiagnostics) {
    violations.push(
      `Telemetry event '${event.name}' diagnostics allowance expected '${event.allowsDiagnostics}' but observed '${hasDiagnostics}'.`
    );
  }

  if (event.allowsGovernanceDecision !== hasGovernanceDecision) {
    violations.push(
      `Telemetry event '${event.name}' governance allowance expected '${event.allowsGovernanceDecision}' but observed '${hasGovernanceDecision}'.`
    );
  }

  if (!event.requiredContext.includes("correlationId")) {
    violations.push(
      `Telemetry event '${event.name}' must declare 'correlationId' as required context.`
    );
  }

  for (const attribute of event.attributes ?? []) {
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
