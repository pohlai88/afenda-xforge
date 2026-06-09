import { z } from "zod";

const registryEntrySchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const registryTupleSchema = z
  .array(registryEntrySchema)
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

export const designSystemRegistryEntrySchema: typeof registryEntrySchema =
  registryEntrySchema;

export function defineRegistry<const T extends readonly [string, ...string[]]>(
  entries: T
): T {
  registryTupleSchema.parse(entries);
  return entries;
}
