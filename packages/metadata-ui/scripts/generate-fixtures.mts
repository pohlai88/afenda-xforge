import type { MetadataUiManifestEntry } from "../metadata-ui.manifest.ts";
import {
  getManifestEntries,
  groupManifestEntries,
  isEntrypoint,
  quote,
  renderGeneratedHeader,
  writeGeneratedOutput,
} from "./generator-lib.mts";
import { validateManifestEntries } from "./validate-manifest.mts";

function toTitleCase(value: string): string {
  return value
    .split(/[-._\s]+/g)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function renderFieldFixture(entry: MetadataUiManifestEntry): string {
  const base = [
    `key: ${quote(entry.registryKey)}`,
    `kind: ${quote(entry.registryKey)}`,
    `label: ${quote(toTitleCase(entry.registryKey))}`,
  ];

  switch (entry.registryKey) {
    case "checkbox":
      return `  {\n    ${base.join(",\n    ")},\n    description: "Enable billing notifications.",\n  },`;
    case "date":
      return `  {\n    ${base.join(",\n    ")},\n    description: "Invoice due date.",\n  },`;
    case "email":
      return `  {\n    ${base.join(",\n    ")},\n    placeholder: "billing@acme.test",\n  },`;
    case "money":
      return `  {\n    ${base.join(",\n    ")},\n    description: "Invoice total.",\n  },`;
    case "number":
      return `  {\n    ${base.join(",\n    ")},\n    description: "Payment term in days.",\n  },`;
    case "select":
      return `  {\n    ${base.join(",\n    ")},\n    options: [\n      { label: "Draft", value: "draft" },\n      { label: "Active", value: "active" },\n      { label: "Archived", value: "archived" },\n    ],\n  },`;
    case "status":
      return `  {\n    ${base.join(",\n    ")},\n    description: "Invoice lifecycle state.",\n  },`;
    case "switch":
      return `  {\n    ${base.join(",\n    ")},\n    description: "Allow autopay.",\n  },`;
    case "textarea":
      return `  {\n    ${base.join(",\n    ")},\n    placeholder: "Internal billing notes",\n  },`;
    default:
      return `  {\n    fallback: "disable",\n    featureFlag: "billing-editor",\n    ${base.join(",\n    ")},\n    placeholder: "Acme Billing",\n  },`;
  }
}

function renderFieldValue(entry: MetadataUiManifestEntry): string {
  switch (entry.registryKey) {
    case "checkbox":
      return `  ${quote(entry.registryKey)}: true,`;
    case "date":
      return `  ${quote(entry.registryKey)}: "2026-06-10",`;
    case "email":
      return `  ${quote(entry.registryKey)}: "billing@acme.test",`;
    case "money":
      return `  ${quote(entry.registryKey)}: 1200.5,`;
    case "number":
      return `  ${quote(entry.registryKey)}: 30,`;
    case "select":
      return `  ${quote(entry.registryKey)}: "active",`;
    case "status":
      return `  ${quote(entry.registryKey)}: "active",`;
    case "switch":
      return `  ${quote(entry.registryKey)}: true,`;
    case "textarea":
      return `  ${quote(entry.registryKey)}: "Net 30 billing notes.",`;
    default:
      return `  ${quote(entry.registryKey)}: "Acme Billing",`;
  }
}

function renderActionFixture(entry: MetadataUiManifestEntry): string {
  switch (entry.registryKey) {
    case "destructive":
      return `  {\n    confirmMessage: "Delete this invoice?",\n    dangerous: true,\n    key: "delete",\n    kind: "delete",\n    label: "Delete",\n    surface: "destructive",\n  },`;
    case "menu":
      return `  {\n    key: "more",\n    kind: "custom",\n    label: "More",\n    placement: "overflow",\n    surface: "menu",\n  },`;
    default:
      return `  {\n    fallback: "disable",\n    featureFlag: "billing-editor",\n    key: "save",\n    kind: "update",\n    label: "Save",\n    surface: "button",\n  },`;
  }
}

function renderSectionFixture(entry: MetadataUiManifestEntry): string {
  let title = toTitleCase(entry.registryKey);

  if (entry.registryKey === "form") {
    title = "Profile";
  } else if (entry.registryKey === "table") {
    title = "Records";
  } else if (entry.registryKey === "list") {
    title = "Queue";
  }
  const base = [
    `key: ${quote(entry.registryKey)}`,
    `kind: ${quote(entry.registryKey)}`,
    `title: ${quote(title)}`,
  ];

  if (entry.registryKey === "form") {
    return `  {\n    actions: metadataUiGeneratedActionFixtures,\n    fields: metadataUiGeneratedFieldFixtures,\n    ${base.join(",\n    ")},\n  },`;
  }

  if (entry.registryKey === "table" || entry.registryKey === "list") {
    return `  {\n    metadata: publicConsumerMetadata,\n    rows: publicConsumerRows,\n    ${base.join(",\n    ")},\n  },`;
  }

  return `  {\n    description: ${quote(`${title} metadata section.`)},\n    ${base.join(",\n    ")},\n  },`;
}

function renderFixtureCoverage(
  entries: readonly MetadataUiManifestEntry[]
): string {
  const grouped = groupManifestEntries(entries);

  return `export const metadataUiFixtureCoverage = {
  action: [${grouped.action
    .filter((entry) => entry.fixture)
    .map((entry) => quote(entry.registryKey))
    .join(", ")}],
  field: [${grouped.field
    .filter((entry) => entry.fixture)
    .map((entry) => quote(entry.registryKey))
    .join(", ")}],
  section: [${grouped.section
    .filter((entry) => entry.fixture)
    .map((entry) => quote(entry.registryKey))
    .join(", ")}],
} as const;

export const metadataUiSmokeCoverage = {
  action: [${grouped.action
    .filter((entry) => entry.smokeTest)
    .map((entry) => quote(entry.registryKey))
    .join(", ")}],
  field: [${grouped.field
    .filter((entry) => entry.smokeTest)
    .map((entry) => quote(entry.registryKey))
    .join(", ")}],
  section: [${grouped.section
    .filter((entry) => entry.smokeTest)
    .map((entry) => quote(entry.registryKey))
    .join(", ")}],
} as const;`;
}

function renderFixtureFile(): string {
  const entries = validateManifestEntries(getManifestEntries());
  const grouped = groupManifestEntries(entries);
  const fixtureFields = grouped.field.filter((entry) => entry.fixture);
  const fixtureActions = grouped.action.filter((entry) => entry.fixture);
  const fixtureSections = grouped.section.filter((entry) => entry.fixture);

  return `${renderGeneratedHeader("scripts/generate-fixtures.mts")}import type { EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow } from "@repo/ui";
import { isValidElement, type ReactNode } from "react";

import { MetadataForm, MetadataSectionStack, MetadataStateBoundary } from "../components";
import {
  createMetadataRenderContext,
  type MetadataActionContract,
  type MetadataConsumerScenarioDefinition,
  type MetadataConsumerScenarioResult,
  type MetadataFieldContract,
  type MetadataSectionContract,
} from "../contracts";
import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "../compatibility";

export type MetadataPublicConsumerSmokeResult = {
  compatibilityOk: boolean;
  containsSearchPlaceholder: boolean;
  qualityGrade: "A" | "B" | "C" | "D";
  scenarios: readonly (MetadataConsumerScenarioResult & {
    containsSearchPlaceholder: boolean;
  })[];
};

export const publicConsumerMetadata: EntityMetadata = {
  entity: "invoice",
  id: "billing.invoices",
  labels: {
    plural: "Invoices",
    singular: "Invoice",
  },
  table: {
    columns: [
      {
        field: "number",
        key: "number",
        label: "Invoice",
      },
      {
        field: "status",
        key: "status",
        kind: "status",
        label: "Status",
      },
    ],
    defaultSort: "number",
  },
  title: "Invoices",
};

export const publicConsumerRows: readonly DashboardTableRow[] = [
  {
    id: "inv-001",
    number: "INV-001",
    status: "active",
  },
];

export const publicConsumerValues = {
${fixtureFields.map((entry) => renderFieldValue(entry)).join("\n")}
} as const;

export const metadataUiGeneratedActionFixtures: readonly MetadataActionContract[] = [
${fixtureActions.map((entry) => renderActionFixture(entry)).join("\n")}
];

export const metadataUiGeneratedFieldFixtures: readonly MetadataFieldContract[] = [
${fixtureFields.map((entry) => renderFieldFixture(entry)).join("\n")}
];

export const metadataUiGeneratedSectionFixtures: readonly MetadataSectionContract<
  EntityMetadata,
  DashboardTableRow
>[] = [
${fixtureSections.map((entry) => renderSectionFixture(entry)).join("\n")}
];

export const publicConsumerActions = metadataUiGeneratedActionFixtures;

export const publicConsumerFields = metadataUiGeneratedFieldFixtures;

export const publicConsumerSections: readonly MetadataSectionContract<
  EntityMetadata,
  DashboardTableRow
>[] = metadataUiGeneratedSectionFixtures.filter(
  (section) => section.key === "form" || section.key === "table"
);

export const metadataConsumerScenarioMatrix: readonly MetadataConsumerScenarioDefinition[] = [
  {
    expectedDisabled: false,
    featureFlags: { "billing-editor": true },
    id: "create-ready",
    mode: "create",
    permissions: { "invoice.update": true },
  },
  {
    expectedDisabled: false,
    featureFlags: { "billing-editor": true },
    id: "read-ready",
    mode: "read",
    permissions: { "invoice.update": true },
  },
  {
    expectedDisabled: false,
    featureFlags: { "billing-editor": true },
    id: "update-ready",
    mode: "update",
    permissions: { "invoice.update": true },
  },
  {
    expectedDisabled: false,
    featureFlags: { "billing-editor": true },
    id: "review-ready",
    mode: "review",
    permissions: { "invoice.update": true },
  },
  {
    expectedDisabled: true,
    featureFlags: { "billing-editor": true },
    id: "readonly-review",
    mode: "review",
    permissions: { "invoice.update": true },
    readonly: true,
  },
  {
    expectedDisabled: true,
    featureFlags: {},
    id: "feature-flag-denied",
    mode: "update",
    permissions: { "invoice.update": true },
  },
];

${renderFixtureCoverage(entries)}

function collectValues(node: ReactNode): string[] {
  if (
    node === null ||
    node === undefined ||
    typeof node === "boolean"
  ) {
    return [];
  }

  if (typeof node === "string" || typeof node === "number") {
    return [String(node)];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => collectValues(child));
  }

  const props = getElementProps(node);

  if (props) {
    const values = collectValues(props.children as ReactNode);

    return values.concat(collectValuesFromRecord(props));
  }

  if (typeof node === "object") {
    return collectValuesFromRecord(node as unknown as Record<string, unknown>);
  }

  return [];
}

function collectValuesFromRecord(record: Record<string, unknown>): string[] {
  return Object.entries(record).flatMap(([key, value]) => {
    if (key === "children") {
      return [];
    }

    return collectValues(value as ReactNode);
  });
}

function containsValue(node: ReactNode, target: string): boolean {
  return collectValues(node).includes(target);
}

function getElementProps(node: ReactNode): Record<string, unknown> | null {
  return isValidElement(node)
    ? (node.props as unknown as Record<string, unknown>)
    : null;
}

function containsDisabledControl(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === "boolean") {
    return false;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsDisabledControl(child));
  }

  const props = getElementProps(node);

  if (!props) {
    return false;
  }

  if (props.disabled === true || props["aria-disabled"] === true) {
    return true;
  }

  return containsDisabledControl(props.children as ReactNode);
}

function containsProp(
  node: ReactNode,
  propName: string,
  expectedValue: unknown
): boolean {
  if (node === null || node === undefined || typeof node === "boolean") {
    return false;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsProp(child, propName, expectedValue));
  }

  const props = getElementProps(node);

  if (!props) {
    return false;
  }

  if (props[propName] === expectedValue) {
    return true;
  }

  return containsProp(props.children as ReactNode, propName, expectedValue);
}

function renderConsumerScenario(
  scenario: MetadataConsumerScenarioDefinition
): MetadataConsumerScenarioResult & { containsSearchPlaceholder: boolean } {
  const context = createMetadataRenderContext(
    {
      featureFlags: scenario.featureFlags,
      permissions: scenario.permissions,
      readonly: scenario.readonly,
      surfaceId: \`public-api-consumer:\${scenario.id}\`,
    },
    {
      mode: scenario.mode,
      routeId: "metadata-ui/public-api-consumer",
      surfaceId: \`public-api-consumer:\${scenario.id}\`,
    }
  );

  const formElement = MetadataForm({
    actions: metadataUiGeneratedActionFixtures,
    context,
    fields: metadataUiGeneratedFieldFixtures,
    title: "Profile",
    values: { ...publicConsumerValues },
  });
  const sectionElement = MetadataSectionStack({
    context,
    sections: metadataUiGeneratedSectionFixtures,
  });
  const stateElement = MetadataStateBoundary({
    children: <div>Ready content</div>,
    context,
    state: "ready",
  });

  return {
    containsActionLabel: containsValue(formElement, "Save"),
    containsDisabledControl: containsDisabledControl(formElement),
    containsSearchPlaceholder:
      containsValue(sectionElement, "Search invoices...") ||
      containsProp(sectionElement, "showSearch", true),
    formText: collectValues(formElement).join(" "),
    id: scenario.id,
    mode: scenario.mode,
    readonly: scenario.readonly ?? false,
    sectionText: collectValues(sectionElement).join(" "),
    stateText: collectValues(stateElement).join(" "),
  };
}

export function runPublicApiConsumerSmoke(): MetadataPublicConsumerSmokeResult {
  const scenarios = metadataConsumerScenarioMatrix.map(renderConsumerScenario);
  const compatibility = createMetadataUiCompatibilityReport();
  const quality = createMetadataUiQualityAssessment({
    compatibility,
    defaultRendererCoverage: true,
    governanceFallbackCoverage: true,
    gracefulUnknownFallbacks: true,
    telemetryCorrelationCoverage: true,
    verification: {
      boundaryLint: true,
      changeNote: true,
      consumerFixture: true,
      declarationSnapshot: true,
      generated: true,
      lint: true,
      publicApi: true,
      telemetrySchema: true,
      test: true,
      typecheck: true,
    },
  });

  return {
    compatibilityOk: compatibility.ok,
    containsSearchPlaceholder: scenarios.some(
      (scenario) => scenario.containsSearchPlaceholder
    ),
    qualityGrade: quality.grade,
    scenarios,
  };
}
`;
}

export function generateFixtures(check = false): boolean {
  return writeGeneratedOutput(
    "src/generated/fixtures.generated.tsx",
    renderFixtureFile(),
    check
  );
}

if (isEntrypoint(import.meta.url)) {
  generateFixtures(process.argv.includes("--check"));
}
