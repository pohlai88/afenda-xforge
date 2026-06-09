import { metadataIdSchema } from "@repo/metadata";
import { z } from "zod";

const addDuplicateKeyIssues = (
  items: readonly { key: string }[] | undefined,
  context: z.RefinementCtx,
  path: readonly (number | string)[]
): void => {
  if (!items) {
    return;
  }

  const seen = new Set<string>();

  for (const [index, item] of items.entries()) {
    if (seen.has(item.key)) {
      context.addIssue({
        code: "custom",
        message: `duplicate override key "${item.key}"`,
        path: [...path, index, "key"],
      });
      return;
    }

    seen.add(item.key);
  }
};

const addCustomizationIssue = (
  context: z.RefinementCtx,
  path: readonly (number | string)[],
  message: string
): void => {
  context.addIssue({
    code: "custom",
    message,
    path: [...path],
  });
};

type CustomizationSchemaRefinementInput = {
  archived?: unknown;
  baseMetadataFingerprint?: string;
  companyId?: string;
  created?: unknown;
  published?: unknown;
  rolledBack?: unknown;
  scope: "company" | "tenant";
  status?: "archived" | "draft" | "published";
  updated?: unknown;
  version?: number;
};

const validateCustomizationScope = (
  customization: CustomizationSchemaRefinementInput,
  context: z.RefinementCtx
): void => {
  if (customization.scope === "company" && !customization.companyId) {
    addCustomizationIssue(
      context,
      ["companyId"],
      "company-scoped customization requires companyId"
    );
  }

  if (customization.scope === "tenant" && customization.companyId) {
    addCustomizationIssue(
      context,
      ["companyId"],
      "tenant-scoped customization must not include companyId"
    );
  }
};

const validateCustomizationLifecycle = (
  customization: CustomizationSchemaRefinementInput,
  context: z.RefinementCtx
): void => {
  const requiresPersistedLifecycle =
    customization.status === "archived" || customization.status === "published";

  if (customization.status === "published" && !customization.published) {
    addCustomizationIssue(
      context,
      ["published"],
      "published customization requires published actor metadata"
    );
  }

  if (customization.status === "archived" && !customization.archived) {
    addCustomizationIssue(
      context,
      ["archived"],
      "archived customization requires archived actor metadata"
    );
  }

  if (requiresPersistedLifecycle && !customization.baseMetadataFingerprint) {
    addCustomizationIssue(
      context,
      ["baseMetadataFingerprint"],
      "published and archived customization requires base metadata fingerprint"
    );
  }

  if (requiresPersistedLifecycle && !customization.created) {
    addCustomizationIssue(
      context,
      ["created"],
      "published and archived customization requires created actor metadata"
    );
  }

  if (requiresPersistedLifecycle && !customization.updated) {
    addCustomizationIssue(
      context,
      ["updated"],
      "published and archived customization requires updated actor metadata"
    );
  }

  if (requiresPersistedLifecycle && !customization.version) {
    addCustomizationIssue(
      context,
      ["version"],
      "published and archived customization requires version"
    );
  }

  if (customization.rolledBack && customization.status !== "published") {
    addCustomizationIssue(
      context,
      ["rolledBack"],
      "rollback metadata is only valid on published customization"
    );
  }
};

export const customizationActorMetadataSchema = z
  .object({
    at: z.string().trim().datetime({ offset: true }),
    by: z.string().trim().min(1),
  })
  .strict();

export const customizationRollbackMetadataSchema =
  customizationActorMetadataSchema
    .extend({
      fromVersion: z.number().int().positive(),
    })
    .strict();

export const customizationPresentationSchema = z
  .object({
    density: z.enum(["comfortable", "compact", "default"]).optional(),
    icon: z.string().trim().min(1).optional(),
    size: z.enum(["icon", "lg", "md", "sm"]).optional(),
    tone: z
      .enum(["destructive", "info", "neutral", "success", "warning"])
      .optional(),
    variant: z
      .enum([
        "default",
        "destructive",
        "ghost",
        "info",
        "link",
        "muted",
        "outline",
        "secondary",
        "success",
        "warning",
      ])
      .optional(),
  })
  .strict();

export const customizationFieldOverrideSchema = z
  .object({
    description: z.string().trim().min(1).optional(),
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
    order: z.number().finite().optional(),
    placeholder: z.string().trim().min(1).optional(),
  })
  .strict();

export const customizationSectionOverrideSchema = z
  .object({
    columns: z
      .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
      .optional(),
    description: z.string().trim().min(1).optional(),
    fieldKeys: z.array(z.string().trim().min(1)).readonly().optional(),
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
  })
  .strict();

export const customizationFormOverrideSchema = z
  .object({
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
    layout: z.enum(["grid", "inline", "stack"]).optional(),
    sectionKeys: z.array(z.string().trim().min(1)).readonly().optional(),
  })
  .strict();

export const customizationTableColumnOverrideSchema = z
  .object({
    align: z.enum(["center", "end", "start"]).optional(),
    field: z.string().trim().min(1).optional(),
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
    order: z.number().finite().optional(),
    width: z.enum(["auto", "lg", "md", "sm"]).optional(),
  })
  .strict();

export const customizationTableOverrideSchema = z
  .object({
    columns: z
      .array(customizationTableColumnOverrideSchema)
      .readonly()
      .optional(),
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    title: z.string().trim().min(1).optional(),
  })
  .strict();

export const customizationEntityTableOverrideSchema = z
  .object({
    columns: z
      .array(customizationTableColumnOverrideSchema)
      .readonly()
      .optional(),
    defaultSort: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();

export const customizationFilterOverrideSchema = z
  .object({
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
  })
  .strict();

export const customizationActionOverrideSchema = z
  .object({
    hidden: z.boolean().optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1).optional(),
    placement: z.enum(["overflow", "primary", "row", "secondary"]).optional(),
  })
  .strict();

const customizationSchemaShape = {
  actions: z.array(customizationActionOverrideSchema).readonly().optional(),
  archived: customizationActorMetadataSchema.optional(),
  baseMetadataFingerprint: z.string().trim().min(1).optional(),
  companyId: z.string().trim().min(1).optional(),
  created: customizationActorMetadataSchema.optional(),
  description: z.string().trim().min(1).optional(),
  entity: z.string().trim().min(1),
  featureId: metadataIdSchema,
  fields: z.array(customizationFieldOverrideSchema).readonly().optional(),
  filters: z.array(customizationFilterOverrideSchema).readonly().optional(),
  forms: z.array(customizationFormOverrideSchema).readonly().optional(),
  id: metadataIdSchema,
  presentation: customizationPresentationSchema.optional(),
  published: customizationActorMetadataSchema.optional(),
  rolledBack: customizationRollbackMetadataSchema.optional(),
  sections: z.array(customizationSectionOverrideSchema).readonly().optional(),
  scope: z.enum(["company", "tenant"]),
  status: z.enum(["archived", "draft", "published"]).optional(),
  table: customizationEntityTableOverrideSchema.optional(),
  tables: z.array(customizationTableOverrideSchema).readonly().optional(),
  tenantId: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  updated: customizationActorMetadataSchema.optional(),
  version: z.number().int().positive().optional(),
} satisfies z.ZodRawShape;

export const customizationSchema = z
  .object(customizationSchemaShape)
  .strict()
  .superRefine((customization, context) => {
    validateCustomizationScope(customization, context);
    validateCustomizationLifecycle(customization, context);

    addDuplicateKeyIssues(customization.actions, context, ["actions"]);
    addDuplicateKeyIssues(customization.fields, context, ["fields"]);
    addDuplicateKeyIssues(customization.filters, context, ["filters"]);
    addDuplicateKeyIssues(customization.forms, context, ["forms"]);
    addDuplicateKeyIssues(customization.sections, context, ["sections"]);
    addDuplicateKeyIssues(customization.tables, context, ["tables"]);
    addDuplicateKeyIssues(customization.table?.columns, context, [
      "table",
      "columns",
    ]);

    for (const [tableIndex, table] of (customization.tables ?? []).entries()) {
      addDuplicateKeyIssues(table.columns, context, [
        "tables",
        tableIndex,
        "columns",
      ]);
    }
  });

export const customizationFixtureSchema = z
  .object({
    exportedAt: z.string().trim().datetime({ offset: true }),
    exportedBy: z.string().trim().min(1),
    schemaVersion: z.literal(1),
    customization: customizationSchema,
  })
  .strict();
