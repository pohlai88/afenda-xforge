import { z } from "zod";

export const DESIGN_SYSTEM_REGISTRY_ENTRY_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const designSystemRegistryEntrySchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    DESIGN_SYSTEM_REGISTRY_ENTRY_PATTERN,
    "Registry entries must use lowercase kebab-case"
  );

export type DesignSystemRegistryEntry = z.infer<
  typeof designSystemRegistryEntrySchema
>;

export const designSystemRegistrySchema = z
  .array(designSystemRegistryEntrySchema)
  .min(1)
  .readonly()
  .superRefine((entries: readonly string[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();

    for (const [index, entry] of entries.entries()) {
      if (seen.has(entry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate registry entry "${entry}"`,
          path: [index],
        });
        continue;
      }

      seen.add(entry);
    }
  });

export function defineRegistry<const T extends readonly [string, ...string[]]>(
  entries: T
): T {
  designSystemRegistrySchema.parse(entries);
  return entries;
}

export function validateDesignSystemRegistry(
  entries: readonly string[]
): readonly DesignSystemRegistryEntry[] {
  return designSystemRegistrySchema.parse(entries);
}

export const governanceReferenceSchema = z.string().trim().min(1);

export const governanceReferencesSchema = z
  .array(governanceReferenceSchema)
  .min(1)
  .readonly()
  .superRefine((references: readonly string[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();

    for (const [index, reference] of references.entries()) {
      if (seen.has(reference)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate governance reference "${reference}"`,
          path: [index],
        });
        continue;
      }

      seen.add(reference);
    }
  });

export function defineGovernanceReferences<
  const T extends readonly [string, ...string[]],
>(references: T): T {
  governanceReferencesSchema.parse(references);
  return references;
}

export function defineUniqueStringList<
  const T extends readonly [string, ...string[]],
>(entries: T, duplicateLabel = "entry"): T {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry)) {
      throw new Error(`Duplicate ${duplicateLabel}: ${entry}`);
    }

    seen.add(entry);
  }

  return entries;
}

const GOVERNANCE_REFERENCE_PREFIX_PATTERN = /^(?:AFENDA|XFORGE):/;

export function collectRegisteredGovernanceReferenceIds(
  exports: Record<string, unknown>
): ReadonlySet<string> {
  const ids = new Set<string>();

  for (const value of Object.values(exports)) {
    if (
      typeof value === "string" &&
      GOVERNANCE_REFERENCE_PREFIX_PATTERN.test(value)
    ) {
      ids.add(value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (
          typeof item === "string" &&
          GOVERNANCE_REFERENCE_PREFIX_PATTERN.test(item)
        ) {
          ids.add(item);
        }
      }
    }
  }

  return ids;
}
