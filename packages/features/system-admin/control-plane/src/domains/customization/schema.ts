import { customizationFixtureSchema } from "@repo/customization";
import { entityMetadataSchema, metadataFeatureSchema } from "@repo/metadata";
import { z } from "zod";

export const customizationGovernanceCommandSchema = z.object({
  customizationId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(240),
});

export const customizationReviewModeSchema = z.enum([
  "draft-with-warnings",
  "strict",
]);

export const systemAdminCustomizationReviewCategorySchema = z.enum([
  "identity",
  "layering",
  "policy",
  "reference",
  "schema",
  "scope",
  "surface",
]);

export const systemAdminCustomizationReviewReasonSchema = z.enum([
  "duplicate-target",
  "metadata-version-drift",
  "node-removed",
  "node-renamed",
  "node-shape-drift",
]);

export const systemAdminCustomizationReviewStatusSchema = z.enum([
  "blocked",
  "review",
  "valid",
]);

export const systemAdminCustomizationReviewRequestSchema = z.object({
  fixture: customizationFixtureSchema,
  metadata: z.union([entityMetadataSchema, metadataFeatureSchema]),
  mode: customizationReviewModeSchema,
});

export const systemAdminCustomizationReviewItemSchema = z.object({
  category: systemAdminCustomizationReviewCategorySchema,
  code: z.string().trim().min(1),
  hint: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1),
  metadataNodeId: z.string().trim().min(1).optional(),
  metadataNodeKey: z.string().trim().min(1).optional(),
  path: z.array(z.union([z.string().trim().min(1), z.number().int()])),
  reason: systemAdminCustomizationReviewReasonSchema.optional(),
  severity: z.enum(["error", "warning"]),
  surface: z.string().trim().min(1).optional(),
  targetNodeId: z.string().trim().min(1).optional(),
  targetNodeKey: z.string().trim().min(1).optional(),
});

export const systemAdminCustomizationReviewSummarySchema = z.object({
  blockedCount: z.number().int().nonnegative(),
  byCategory: z.record(
    systemAdminCustomizationReviewCategorySchema,
    z.number().int().nonnegative()
  ),
  reviewCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
});

export const systemAdminCustomizationReviewSchema = z.object({
  customizationId: z.string().trim().min(1),
  mode: customizationReviewModeSchema,
  publishable: z.boolean(),
  requiresReview: z.boolean(),
  status: systemAdminCustomizationReviewStatusSchema,
  summary: systemAdminCustomizationReviewSummarySchema,
  tenantId: z.string().trim().min(1),
  valid: z.boolean(),
  warnings: z.array(z.string().trim().min(1)),
  items: z.array(systemAdminCustomizationReviewItemSchema),
});

export type CustomizationGovernanceCommandShape = z.infer<
  typeof customizationGovernanceCommandSchema
>;
export type SystemAdminCustomizationReviewShape = z.infer<
  typeof systemAdminCustomizationReviewSchema
>;
export type SystemAdminCustomizationReviewRequestShape = z.infer<
  typeof systemAdminCustomizationReviewRequestSchema
>;
export type SystemAdminCustomizationReviewCategoryShape = z.infer<
  typeof systemAdminCustomizationReviewCategorySchema
>;
export type SystemAdminCustomizationReviewItemShape = z.infer<
  typeof systemAdminCustomizationReviewItemSchema
>;
export type SystemAdminCustomizationReviewReasonShape = z.infer<
  typeof systemAdminCustomizationReviewReasonSchema
>;
export type SystemAdminCustomizationReviewStatusShape = z.infer<
  typeof systemAdminCustomizationReviewStatusSchema
>;
