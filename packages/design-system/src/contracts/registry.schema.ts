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
