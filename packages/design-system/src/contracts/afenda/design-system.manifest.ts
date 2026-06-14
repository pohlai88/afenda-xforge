import { z } from "zod";

import {
  defineGovernanceReferences,
  defineUniqueStringList,
  governanceReferencesSchema,
} from "../registry.schema";
import {
  AFENDA_GOV_AGENT_GOVERNANCE,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_GLOBALS_CSS,
  AFENDA_GOV_LEGACY_DEPRECATION_MANIFEST,
  AFENDA_GOV_QUALITY_GATE,
  AFENDA_GOV_RUNTIME_REFERENCE,
  AFENDA_GOV_TOKEN_UI,
} from "./catalogs/governance-reference.catalog";
import {
  AFENDA_DESIGN_SYSTEM_ID,
  AFENDA_DESIGN_SYSTEM_VERSION,
  afendaDesignSystemContract,
} from "./design-system.contract";
import { AFENDA_RULE_REGISTRY } from "./rules";

export const AFENDA_CONTRACT_EXPORT_SUBPATH = "@repo/design-system/contracts/afenda";
export const AFENDA_DESIGN_SYSTEM_MANIFEST_ID =
  "afenda.design-system.manifest" as const;
export const AFENDA_DESIGN_SYSTEM_PACKAGE_NAME = "@repo/design-system" as const;
export const AFENDA_DESIGN_SYSTEM_CONTRACT_PATH =
  "src/contracts/afenda" as const;

export const AFENDA_DESIGN_SYSTEM_PUBLIC_EXPORTS = defineUniqueStringList(
  [
    "@repo/design-system/contracts",
    AFENDA_CONTRACT_EXPORT_SUBPATH,
    "@repo/design-system/contracts/afenda/catalogs",
    "@repo/design-system/contracts/afenda/customization",
    "@repo/design-system/contracts/afenda/forms",
    "@repo/design-system/contracts/afenda/gates",
    "@repo/design-system/contracts/afenda/registries",
    "@repo/design-system/contracts/afenda/references",
    "@repo/design-system/contracts/afenda/rules",
    "@repo/design-system/contracts/afenda/runtime",
    "@repo/design-system/presentation",
  ],
  "public export"
);

export const AFENDA_DESIGN_SYSTEM_GOVERNANCE_REFERENCES = defineGovernanceReferences([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_RUNTIME_REFERENCE,
  AFENDA_GOV_TOKEN_UI,
  AFENDA_GOV_GLOBALS_CSS,
  AFENDA_GOV_QUALITY_GATE,
  AFENDA_GOV_LEGACY_DEPRECATION_MANIFEST,
  AFENDA_GOV_AGENT_GOVERNANCE,
  AFENDA_GOV_AUDIT,
]);

function uniqueStringArraySchema(message: string) {
  return z
    .array(z.string().trim().min(1))
    .min(1)
    .readonly()
    .superRefine((items, ctx) => {
      const seen = new Set<string>();

      for (const [index, item] of items.entries()) {
        if (seen.has(item)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message,
            path: [index],
          });
          continue;
        }

        seen.add(item);
      }
    });
}

export type AfendaDesignSystemManifest = {
  contractId: typeof AFENDA_DESIGN_SYSTEM_ID;
  contractPath: typeof AFENDA_DESIGN_SYSTEM_CONTRACT_PATH;
  exportSubpath: typeof AFENDA_CONTRACT_EXPORT_SUBPATH;
  governanceReferences: readonly string[];
  manifestId: typeof AFENDA_DESIGN_SYSTEM_MANIFEST_ID;
  owner: "design-system";
  packageName: typeof AFENDA_DESIGN_SYSTEM_PACKAGE_NAME;
  publicExports: readonly string[];
  replaces: readonly string[];
  runtimeGovernance: {
    referenceContract: "web-design-guidelines";
    ruleCountMinimum: number;
  };
  status: "canonical";
  version: typeof AFENDA_DESIGN_SYSTEM_VERSION;
};

export const afendaDesignSystemManifestSchema = z
  .object({
    contractId: z.literal(AFENDA_DESIGN_SYSTEM_ID),
    contractPath: z.literal(AFENDA_DESIGN_SYSTEM_CONTRACT_PATH),
    exportSubpath: z.literal(AFENDA_CONTRACT_EXPORT_SUBPATH),
    governanceReferences: governanceReferencesSchema,
    manifestId: z.literal(AFENDA_DESIGN_SYSTEM_MANIFEST_ID),
    owner: z.literal("design-system"),
    packageName: z.literal(AFENDA_DESIGN_SYSTEM_PACKAGE_NAME),
    publicExports: uniqueStringArraySchema("Duplicate public export"),
    replaces: uniqueStringArraySchema("Duplicate replacement target"),
    runtimeGovernance: z
      .object({
        referenceContract: z.literal("web-design-guidelines"),
        ruleCountMinimum: z.number().int().positive(),
      })
      .strict(),
    status: z.literal("canonical"),
    version: z.literal(AFENDA_DESIGN_SYSTEM_VERSION),
  })
  .strict();

export const afendaDesignSystemManifest = {
  manifestId: AFENDA_DESIGN_SYSTEM_MANIFEST_ID,
  contractId: AFENDA_DESIGN_SYSTEM_ID,
  version: AFENDA_DESIGN_SYSTEM_VERSION,
  status: "canonical",
  owner: "design-system",
  packageName: AFENDA_DESIGN_SYSTEM_PACKAGE_NAME,
  contractPath: AFENDA_DESIGN_SYSTEM_CONTRACT_PATH,
  exportSubpath: AFENDA_CONTRACT_EXPORT_SUBPATH,
  publicExports: AFENDA_DESIGN_SYSTEM_PUBLIC_EXPORTS,
  replaces: defineUniqueStringList(
    [
      "@repo/design-system/contracts/afenda/master",
      "ad-hoc UI review prompts",
      "manual IDE agent design checks",
    ],
    "replacement target"
  ),
  governanceReferences: AFENDA_DESIGN_SYSTEM_GOVERNANCE_REFERENCES,
  runtimeGovernance: {
    referenceContract: "web-design-guidelines",
    ruleCountMinimum: 20,
  },
} as const satisfies AfendaDesignSystemManifest;

export function validateAfendaDesignSystemManifest(): void {
  const manifest = afendaDesignSystemManifestSchema.parse(
    afendaDesignSystemManifest
  );

  if (!manifest.publicExports.includes(manifest.exportSubpath)) {
    throw new Error("Afenda manifest publicExports must include exportSubpath");
  }

  if (
    !manifest.governanceReferences.includes(AFENDA_GOV_RUNTIME_REFERENCE)
  ) {
    throw new Error(
      "Afenda manifest must reference the runtime reference contract"
    );
  }

  if (
    !manifest.governanceReferences.includes(AFENDA_GOV_TOKEN_UI)
  ) {
    throw new Error("Afenda manifest must reference the token UI contract");
  }

  if (
    !manifest.governanceReferences.includes(AFENDA_GOV_GLOBALS_CSS)
  ) {
    throw new Error("Afenda manifest must reference the globals CSS contract");
  }

  if (AFENDA_RULE_REGISTRY.length < manifest.runtimeGovernance.ruleCountMinimum) {
    throw new Error(
      `Afenda manifest requires at least ${manifest.runtimeGovernance.ruleCountMinimum} runtime rules`
    );
  }

  if (manifest.contractId !== afendaDesignSystemContract.id) {
    throw new Error("Manifest contractId must match afendaDesignSystemContract.id");
  }

  if (manifest.version !== afendaDesignSystemContract.version) {
    throw new Error("Manifest version must match afendaDesignSystemContract.version");
  }
}
