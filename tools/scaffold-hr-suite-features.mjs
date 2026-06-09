import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const domainInventory = {
  "employee-management": [
    "compliance-regulatory-tracking",
    "documents-management",
    "employee-lifecycle-management",
    "employee-records-management",
    "employee-selfservice-portal",
    "offboarding-exit-management",
    "organizational-chart-hierarchy",
  ],
  "industry-specific": [
    "field-worker-remote-workforce-management",
    "food-handler-certification-health-compliance",
    "government-classification-pay-grades",
    "manufacturing-safety-training-osha-compliance",
    "retail-seasonal-hourly-workforce-scheduling",
    "union-management",
  ],
  "payroll-compensation": [
    "benefits-administration",
    "bonus-incentive-management",
    "compensation-planning-modeling",
    "expenses-reimbursement",
    "multi-country-payroll",
    "payroll-processing",
    "salary-benchmarking-survey",
  ],
  "talent-management": [
    "candidate-selfservice-portal",
    "career-pathing-development-plans",
    "competency-skills-framework",
    "employee-engagement-surveys",
    "learning-management-system-lms",
    "performance-appraisals",
    "recruitment-onboarding",
    "succession-planning",
    "training-development",
  ],
  "time-attendance": [
    "absence-analytics-trends",
    "flexible-work-arrangement-tracking",
    "geolocation-remote-checkin",
    "leave-attendance-management",
    "overtime-management",
    "shift-scheduling",
    "time-clock-integration",
  ],
};

const legacyRoot = "afenda-erp/packages/features/hr-suite/src";

const toPascalCase = (value) =>
  value
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");

const toCamelCase = (value) => {
  const pascal = toPascalCase(value);
  return `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`;
};

const toTitleCase = (value) =>
  value
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

const ensureDirectory = async (directoryPath) => {
  await mkdir(directoryPath, { recursive: true });
};

const writeTextFile = async (filePath, contents) => {
  await ensureDirectory(path.dirname(filePath));
  await writeFile(filePath, contents, "utf8");
};

const buildPackageJson = ({ packageName }) => `{
  "name": "${packageName}",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./contract": "./src/contract.ts",
    "./manifest": "./src/manifest.ts",
    "./metadata": "./src/metadata.ts",
    "./schema": "./src/schema.ts",
    "./search": "./src/search.ts",
    "./server": "./src/server.ts",
    "./package.json": "./package.json"
  },
  "files": [
    "src",
    "package.json"
  ],
  "scripts": {
    "lint": "biome check .",
    "format": "biome format --write .",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "@repo/search": "workspace:*",
    "server-only": "catalog:"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/node": "catalog:",
    "typescript": "catalog:"
  }
}
`;

const tsconfigContents = `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/node-library.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
`;

const buildIndex = ({ featureCamel, featurePascal }) => `/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  Create${featurePascal}Input,
  ${featurePascal}Record,
  ${featurePascal}SearchDocument,
  ${featurePascal}SearchSourceRecord,
  List${featurePascal}Query,
  Search${featurePascal}RecordsInput,
  Update${featurePascal}Input,
} from "./contract.ts";
export type { HrSuiteFeatureContext } from "./feature-scope.ts";
export { ${featureCamel}FeatureScope } from "./feature-scope.ts";
export { ${featureCamel}Manifest } from "./manifest.ts";
export { ${featureCamel}Metadata } from "./metadata.ts";
export {
  ${featureCamel}SearchIndexDefinition,
  ${featureCamel}SearchIndexKey,
  ensure${featurePascal}SearchIndexRegistered,
  remove${featurePascal}SearchRecord,
  search${featurePascal}Records,
  sync${featurePascal}SearchRecord,
  to${featurePascal}SearchDocument,
} from "./search.ts";
export {
  create${featurePascal},
  get${featurePascal},
  list${featurePascal},
  ${featureCamel}RouteContracts,
  update${featurePascal},
} from "./server.ts";
`;

const buildContract = ({
  domain,
  feature,
  featureCamel,
  featurePascal,
}) => `export type ${featurePascal}Status = "draft" | "active" | "archived";

export type ${featurePascal}Record = {
  id: string;
  name: string;
  status: ${featurePascal}Status;
};

export type ${featurePascal}SearchSourceRecord = ${featurePascal}Record & {
  companyId?: string | null;
  tenantId?: string;
};

export type List${featurePascal}Query = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type Search${featurePascal}RecordsInput = {
  companyId?: string;
  filter?: string | string[];
  limit?: number;
  offset?: number;
  query: string;
  status?: ${featurePascal}Status;
  tenantId?: string;
};

export type ${featurePascal}SearchDocument = {
  companyId?: string | null;
  description: string;
  id: string;
  metadata: {
    companyId?: string | null;
    featureId: string;
    status: ${featurePascal}Status;
  };
  name: string;
  status: ${featurePascal}Status;
  tenantId: string;
  title: string;
};

export type Create${featurePascal}Input = {
  name: string;
};

export type Update${featurePascal}Input = {
  id: string;
  name?: string;
  status?: ${featurePascal}Status;
};

export const ${featureCamel}RouteContracts = [] as const;

export const ${featureCamel}FeatureId = "hr-suite.${domain}.${feature}" as const;
`;

const buildSchema = ({
  featurePascal,
}) => `export const ${toCamelCase(featurePascal)}Statuses = [
  "draft",
  "active",
  "archived",
] as const;
`;

const buildManifest = ({
  domain,
  feature,
  featureCamel,
  packageName,
  title,
}) => `import { ${featureCamel}RouteContracts } from "./contract.ts";

export type ${toPascalCase(feature)}Manifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof ${featureCamel}RouteContracts;
  suite: "hr-suite";
  title: string;
};

export const ${featureCamel}Manifest: ${toPascalCase(feature)}Manifest = {
  id: "hr-suite.${domain}.${feature}",
  title: "${title}",
  description:
    "Adoption scaffold for the legacy HR Suite slice at ${legacyRoot}/${domain}/${feature}.",
  domain: "${domain}",
  packageName: "${packageName}",
  routeContracts: ${featureCamel}RouteContracts,
  suite: "hr-suite",
};
`;

const buildMetadata = ({
  domain,
  feature,
  featureCamel,
  featurePascal,
  title,
}) => `export type ${featurePascal}Metadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const ${featureCamel}Metadata: ${featurePascal}Metadata = {
  id: "hr-suite.${domain}.${feature}",
  title: "${title}",
  description:
    "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
  domain: "${domain}",
  labels: {
    singular: "${title} record",
    plural: "${title} records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
`;

const buildQueries = ({ featurePascal }) => `import "server-only";

import type {
  ${featurePascal}Record,
  List${featurePascal}Query,
} from "./contract.ts";
import type { HrSuiteFeatureContext } from "./feature-scope.ts";
import {
  get${featurePascal}RepositoryRecord,
  list${featurePascal}RepositoryRecords,
} from "./repository.ts";

export async function list${featurePascal}Records(
  _query: List${featurePascal}Query = {},
  _context?: HrSuiteFeatureContext
): Promise<readonly ${featurePascal}Record[]> {
  return list${featurePascal}RepositoryRecords();
}

export async function get${featurePascal}Record(
  id: string,
  _context?: HrSuiteFeatureContext
): Promise<${featurePascal}Record | null> {
  return get${featurePascal}RepositoryRecord(id);
}
`;

const buildActions = ({ featurePascal }) => `import "server-only";

import { randomUUID } from "node:crypto";
import type {
  Create${featurePascal}Input,
  ${featurePascal}Record,
  Update${featurePascal}Input,
} from "./contract.ts";
import { run${featurePascal}Mutation } from "./execution.ts";
import type { HrSuiteFeatureContext } from "./feature-scope.ts";
import { upsert${featurePascal}RepositoryRecord } from "./repository.ts";
import { sync${featurePascal}SearchRecord } from "./search.ts";

export async function create${featurePascal}Record(
  input: Create${featurePascal}Input,
  _context?: HrSuiteFeatureContext
): Promise<${featurePascal}Record> {
  const record = await run${featurePascal}Mutation(
    async () =>
      upsert${featurePascal}RepositoryRecord({
        id: randomUUID(),
        name: input.name.trim(),
        status: "draft",
      }),
    _context
  );

  await sync${featurePascal}SearchRecord(record, _context);
  return record;
}

export async function update${featurePascal}Record(
  input: Update${featurePascal}Input,
  _context?: HrSuiteFeatureContext
): Promise<${featurePascal}Record> {
  const record = await run${featurePascal}Mutation(
    async () =>
      upsert${featurePascal}RepositoryRecord({
        id: input.id,
        name: input.name?.trim() || "Unnamed",
        status: input.status ?? "draft",
      }),
    _context
  );

  await sync${featurePascal}SearchRecord(record, _context);
  return record;
}
`;

const buildServer = ({ featureCamel, featurePascal }) => `import "server-only";

export {
  create${featurePascal}Record as create${featurePascal},
  update${featurePascal}Record as update${featurePascal},
} from "./actions.ts";
export { ${featureCamel}RouteContracts } from "./contract.ts";
export {
  get${featurePascal}Record as get${featurePascal},
  list${featurePascal}Records as list${featurePascal},
} from "./queries.ts";
export {
  ${featureCamel}SearchIndexDefinition,
  ${featureCamel}SearchIndexKey,
  ensure${featurePascal}SearchIndexRegistered,
  remove${featurePascal}SearchRecord,
  search${featurePascal}Records,
  sync${featurePascal}SearchRecord,
  to${featurePascal}SearchDocument,
} from "./search.ts";
`;

const buildFeatureScope = ({
  domain,
  feature,
  packageName,
}) => `export type HrSuiteFeatureContext = {
  actorId?: string;
  companyId?: string;
  requestId?: string;
  tenantId?: string;
};

export const hrSuiteFeatureScope = {
  source: "legacy-hr-suite",
  suite: "hr-suite",
} as const;

export const ${toCamelCase(feature)}FeatureScope = {
  ...hrSuiteFeatureScope,
  domain: "${domain}",
  feature: "${feature}",
  packageName: "${packageName}",
} as const;
`;

const buildExecution = ({ featurePascal }) => `import "server-only";

import type { HrSuiteFeatureContext } from "./feature-scope.ts";

export async function run${featurePascal}Mutation<TResult>(
  operation: () => Promise<TResult>,
  _context?: HrSuiteFeatureContext
): Promise<TResult> {
  // Scaffold placeholder. Production features must delegate to @repo/execution.
  return operation();
}
`;

const buildRepository = ({
  featurePascal,
}) => `import type { ${featurePascal}Record } from "./contract.ts";

const records = new Map<string, ${featurePascal}Record>();

export function list${featurePascal}RepositoryRecords(): readonly ${featurePascal}Record[] {
  return [...records.values()];
}

export function get${featurePascal}RepositoryRecord(
  id: string
): ${featurePascal}Record | null {
  return records.get(id) ?? null;
}

export function upsert${featurePascal}RepositoryRecord(
  record: ${featurePascal}Record
): ${featurePascal}Record {
  records.set(record.id, record);
  return record;
}
`;

const buildSearch = ({
  domain,
  featureCamel,
  feature,
  featurePascal,
}) => `import "server-only";

import {
  getSearchIndexDefinition,
  registerSearchIndex,
  type SearchIndexDefinition,
  type SearchResult,
} from "@repo/search";
import {
  createMeilisearchIndexer,
  createMeilisearchSearchClient,
} from "@repo/search/meilisearch";
import type {
  ${featurePascal}SearchDocument,
  ${featurePascal}SearchSourceRecord,
  Search${featurePascal}RecordsInput,
} from "./contract.ts";
import { ${featureCamel}FeatureId } from "./contract.ts";
import type { HrSuiteFeatureContext } from "./feature-scope.ts";

export const ${featureCamel}SearchIndexKey =
  "hr_suite_${domain}_${feature}" as const;

const build${featurePascal}SearchIndexDefinition = (): SearchIndexDefinition => ({
  key: ${featureCamel}SearchIndexKey,
  primaryKey: "id",
  filterableAttributes: ["tenantId", "companyId", "status"],
  searchableAttributes: ["name", "title", "description", "status"],
  sortableAttributes: ["name", "status"],
});

export const ${featureCamel}SearchIndexDefinition =
  getSearchIndexDefinition(${featureCamel}SearchIndexKey) ??
  registerSearchIndex(build${featurePascal}SearchIndexDefinition());

export function ensure${featurePascal}SearchIndexRegistered(): SearchIndexDefinition {
  return ${featureCamel}SearchIndexDefinition;
}

const resolveTenantId = (
  record: ${featurePascal}SearchSourceRecord,
  context?: HrSuiteFeatureContext
): string | null => {
  const tenantId = record.tenantId?.trim() || context?.tenantId?.trim();
  return tenantId && tenantId.length > 0 ? tenantId : null;
};

const resolveCompanyId = (
  record: ${featurePascal}SearchSourceRecord,
  context?: HrSuiteFeatureContext
): string | null | undefined => {
  const companyId = record.companyId ?? context?.companyId;

  if (typeof companyId !== "string") {
    return companyId ?? undefined;
  }

  const normalizedCompanyId = companyId.trim();
  return normalizedCompanyId.length > 0 ? normalizedCompanyId : undefined;
};

const escapeFilterValue = (value: string): string =>
  value.replaceAll("\\\\", "\\\\\\\\").replaceAll('"', '\\\\\\"');

const logSearchSyncFailure = (action: string, error: unknown): void => {
  console.warn(
    \`[\${${featureCamel}FeatureId}] Search sync skipped while trying to \${action}.\`,
    error
  );
};

const buildSearchFilters = (
  input: Search${featurePascal}RecordsInput,
  context?: HrSuiteFeatureContext
): string[] | undefined => {
  const filters: string[] = [];
  const tenantId = input.tenantId?.trim() || context?.tenantId?.trim();
  const companyId = input.companyId?.trim() || context?.companyId?.trim();

  if (tenantId) {
    filters.push(\`tenantId = "\${escapeFilterValue(tenantId)}"\`);
  }

  if (companyId) {
    filters.push(\`companyId = "\${escapeFilterValue(companyId)}"\`);
  }

  if (input.status) {
    filters.push(\`status = "\${escapeFilterValue(input.status)}"\`);
  }

  if (input.filter) {
    if (Array.isArray(input.filter)) {
      filters.push(...input.filter);
    } else {
      filters.push(input.filter);
    }
  }

  return filters.length > 0 ? filters : undefined;
};

export function to${featurePascal}SearchDocument(
  record: ${featurePascal}SearchSourceRecord,
  context?: HrSuiteFeatureContext
): ${featurePascal}SearchDocument {
  const tenantId = resolveTenantId(record, context);

  if (!tenantId) {
    throw new Error(
      \`[\${${featureCamel}FeatureId}] Search documents require a tenantId.\`
    );
  }

  const companyId = resolveCompanyId(record, context);

  return {
    companyId,
    description: \`\${record.name} (\${record.status})\`,
    id: record.id,
    metadata: {
      companyId,
      featureId: ${featureCamel}FeatureId,
      status: record.status,
    },
    name: record.name,
    status: record.status,
    tenantId,
    title: record.name,
  };
}

export async function sync${featurePascal}SearchRecord(
  record: ${featurePascal}SearchSourceRecord,
  context?: HrSuiteFeatureContext
): Promise<void> {
  if (!resolveTenantId(record, context)) {
    return;
  }

  ensure${featurePascal}SearchIndexRegistered();

  try {
    await createMeilisearchIndexer().indexDocument(
      ${featureCamel}SearchIndexKey,
      to${featurePascal}SearchDocument(record, context)
    );
  } catch (error) {
    logSearchSyncFailure(\`index record "\${record.id}"\`, error);
  }
}

export async function remove${featurePascal}SearchRecord(
  recordId: string
): Promise<void> {
  ensure${featurePascal}SearchIndexRegistered();

  try {
    await createMeilisearchIndexer().removeDocument(
      ${featureCamel}SearchIndexKey,
      recordId
    );
  } catch (error) {
    logSearchSyncFailure(\`remove record "\${recordId}"\`, error);
  }
}

export async function search${featurePascal}Records(
  input: Search${featurePascal}RecordsInput,
  context?: HrSuiteFeatureContext
): Promise<SearchResult<${featurePascal}SearchDocument>[]> {
  ensure${featurePascal}SearchIndexRegistered();

  return createMeilisearchSearchClient().search<${featurePascal}SearchDocument>({
    filter: buildSearchFilters(input, context),
    indices: [${featureCamel}SearchIndexKey],
    limit: input.limit,
    offset: input.offset,
    query: input.query,
  });
}
`;

const buildIntegrationIndex = (entries) => {
  const domains = [...new Set(entries.map((entry) => entry.domain))];
  const domainList = domains.map((domain) => `  "${domain}",`).join("\n");
  const entryList = entries
    .map(
      (entry) => `  {
    domain: "${entry.domain}",
    feature: "${entry.feature}",
    legacySourcePath: "${entry.legacySourcePath}",
    packageName: "${entry.packageName}",
    packagePath: "${entry.packagePath}",
    title: "${entry.title}",
  },`
    )
    .join("\n");

  return `export type HrSuiteFeaturePackage = {
  domain: string;
  feature: string;
  legacySourcePath: string;
  packageName: string;
  packagePath: string;
  title: string;
};

export const hrSuiteFeatureDomains = [
${domainList}
] as const;

export const hrSuiteFeaturePackages = [
${entryList}
] as const satisfies readonly HrSuiteFeaturePackage[];

export function listHrSuiteFeaturePackagesByDomain(
  domain: string
): readonly HrSuiteFeaturePackage[] {
  return hrSuiteFeaturePackages.filter((entry) => entry.domain === domain);
}
`;
};

const entries = [];

for (const [domain, features] of Object.entries(domainInventory)) {
  for (const feature of features) {
    const featurePascal = toPascalCase(feature);
    const featureCamel = toCamelCase(feature);
    const title = toTitleCase(feature);
    const packageName = `@repo/features-${domain}-${feature}`;
    const packagePath = `packages/features/hr-suite/${domain}/${feature}`;
    const absolutePackagePath = path.join(repoRoot, packagePath);

    entries.push({
      domain,
      feature,
      legacySourcePath: `${legacyRoot}/${domain}/${feature}`,
      packageName,
      packagePath,
      title,
    });

    await writeTextFile(
      path.join(absolutePackagePath, "package.json"),
      buildPackageJson({ packageName })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "tsconfig.json"),
      tsconfigContents
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/index.ts"),
      buildIndex({ featureCamel, featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/contract.ts"),
      buildContract({
        domain,
        feature,
        featureCamel,
        featurePascal,
      })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/schema.ts"),
      buildSchema({ featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/manifest.ts"),
      buildManifest({
        domain,
        feature,
        featureCamel,
        packageName,
        title,
      })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/metadata.ts"),
      buildMetadata({
        domain,
        feature,
        featureCamel,
        featurePascal,
        title,
      })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/queries.ts"),
      buildQueries({ featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/actions.ts"),
      buildActions({ featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/server.ts"),
      buildServer({ featureCamel, featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/search.ts"),
      buildSearch({ domain, feature, featureCamel, featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/feature-scope.ts"),
      buildFeatureScope({ domain, feature, packageName })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/execution.ts"),
      buildExecution({ featurePascal })
    );
    await writeTextFile(
      path.join(absolutePackagePath, "src/repository.ts"),
      buildRepository({ featurePascal })
    );
  }
}

await writeTextFile(
  path.join(repoRoot, "packages/features/_integration/src/hr-suite/index.ts"),
  buildIntegrationIndex(entries)
);

console.log(
  `Scaffolded ${entries.length} HR Suite feature packages across ${Object.keys(domainInventory).length} domains.`
);
