import { z } from "zod";

import { defineGovernanceReferences, governanceReferencesSchema } from "../../registry.schema";
import {
  AFENDA_GOV_AGENT_GOVERNANCE,
  AFENDA_GOV_ANTI_PATTERN,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_ADAPTER,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_MIGRATION_BOUNDARY,
  AFENDA_GOV_RUNTIME_REFERENCE,
} from "../catalogs/governance-reference.catalog";
import {
  AFENDA_CONTRACT_EXPORT_SUBPATH,
  afendaDesignSystemManifest,
} from "../design-system.manifest";

export const AFENDA_LEGACY_DEPRECATION_ID =
  "afenda.legacy-deprecation" as const;
export const AFENDA_LEGACY_DEPRECATION_VERSION = "0.1.0" as const;

export const AFENDA_LEGACY_DEPRECATED_EXPORTS = [
  "@repo/design-system/contracts/afenda/master",
] as const;

export const AFENDA_LEGACY_MIGRATION_TARGETS = [
  AFENDA_CONTRACT_EXPORT_SUBPATH,
] as const;

export const AFENDA_LEGACY_DEPRECATION_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_DESIGN_SYSTEM,
    AFENDA_GOV_ADAPTER,
    AFENDA_GOV_RUNTIME_REFERENCE,
    AFENDA_GOV_AGENT_GOVERNANCE,
    AFENDA_GOV_AUDIT,
    AFENDA_GOV_MIGRATION_BOUNDARY,
    AFENDA_GOV_ANTI_PATTERN,
  ]);

export const AFENDA_LEGACY_DEPRECATION_POLICIES = [
  "legacy-afenda-master-is-not-authority",
  "legacy-contracts-are-migration-inputs-only",
  "canonical-afenda-contract-is-runtime-authority",
  "legacy-fields-must-pass-through-adapters",
  "legacy-permission-tenant-audit-execution-fields-must-not-map-to-presentation",
  "deprecated-exports-must-not-be-imported",
  "deprecated-master-imports-fail-static-check",
  "migration-must-preserve-canonical-authority",
] as const;

export type AfendaLegacyDeprecationPolicy =
  (typeof AFENDA_LEGACY_DEPRECATION_POLICIES)[number];

export type AfendaLegacyDeprecationManifest = {
  canonicalExportSubpath: typeof AFENDA_CONTRACT_EXPORT_SUBPATH;
  deprecatedAt: string;
  deprecatedExports: readonly string[];
  forbiddenImports: readonly string[];
  governanceReferences: readonly string[];
  id: typeof AFENDA_LEGACY_DEPRECATION_ID;
  migrationTargets: readonly string[];
  migrationOwner?: string;
  owner: "design-system";
  policies: readonly AfendaLegacyDeprecationPolicy[];
  removalAfter?: string;
  replaces: readonly string[];
  severity: "warning" | "error";
  status: "deprecated";
  version: typeof AFENDA_LEGACY_DEPRECATION_VERSION;
};

export const afendaLegacyDeprecationManifestSchema = z
  .object({
    canonicalExportSubpath: z.literal(AFENDA_CONTRACT_EXPORT_SUBPATH),
    deprecatedAt: z.string().datetime({ offset: true }),
    deprecatedExports: z.array(z.string().trim().min(1)).min(1).readonly(),
    forbiddenImports: z.array(z.string().trim().min(1)).min(1).readonly(),
    governanceReferences: governanceReferencesSchema,
    id: z.literal(AFENDA_LEGACY_DEPRECATION_ID),
    migrationTargets: z.array(z.string().trim().min(1)).min(1).readonly(),
    migrationOwner: z.string().trim().min(1).optional(),
    owner: z.literal("design-system"),
    policies: z
      .array(z.enum(AFENDA_LEGACY_DEPRECATION_POLICIES))
      .min(1)
      .readonly(),
    removalAfter: z.string().datetime({ offset: true }).optional(),
    replaces: z.array(z.string().trim().min(1)).min(1).readonly(),
    severity: z.enum(["warning", "error"]),
    status: z.literal("deprecated"),
    version: z.literal(AFENDA_LEGACY_DEPRECATION_VERSION),
  })
  .strict();

export const afendaLegacyDeprecationManifest = {
  id: AFENDA_LEGACY_DEPRECATION_ID,
  version: AFENDA_LEGACY_DEPRECATION_VERSION,
  status: "deprecated",
  severity: "error",
  deprecatedAt: "2026-06-13T00:00:00.000Z",
  removalAfter: "2026-12-31T00:00:00.000Z",
  owner: "design-system",
  migrationOwner: "afenda-design-system",
  canonicalExportSubpath: AFENDA_CONTRACT_EXPORT_SUBPATH,
  deprecatedExports: AFENDA_LEGACY_DEPRECATED_EXPORTS,
  forbiddenImports: AFENDA_LEGACY_DEPRECATED_EXPORTS,
  migrationTargets: AFENDA_LEGACY_MIGRATION_TARGETS,
  policies: AFENDA_LEGACY_DEPRECATION_POLICIES,
  replaces: afendaDesignSystemManifest.replaces,
  governanceReferences: AFENDA_LEGACY_DEPRECATION_GOVERNANCE_REFERENCES,
} as const satisfies AfendaLegacyDeprecationManifest;

export function validateAfendaLegacyDeprecationManifest(): void {
  afendaLegacyDeprecationManifestSchema.parse(afendaLegacyDeprecationManifest);
}
