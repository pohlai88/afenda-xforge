import "server-only";

import type {
  CustomizationFixtureContract,
  CustomizationImportMode,
  CustomizationImportReviewContract,
  CustomizationValidationIssue,
} from "@repo/customization";
import { reviewCustomizationFixtureImport } from "@repo/customization";
import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";
import { requirePermission } from "@repo/permissions";
import { createSystemAdminPermissionContext } from "../../feature-scope.ts";
import type {
  SystemAdminCustomizationReview,
  SystemAdminCustomizationReviewCategory,
  SystemAdminCustomizationReviewItem,
  SystemAdminCustomizationReviewReason,
  SystemAdminScope,
} from "../../schema.ts";
import { customizationCapabilities } from "./contract.ts";

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;
type ReviewItemAccumulator = Record<
  SystemAdminCustomizationReviewCategory,
  number
>;

const createEmptyCategorySummary = (): ReviewItemAccumulator => ({
  identity: 0,
  layering: 0,
  policy: 0,
  reference: 0,
  schema: 0,
  scope: 0,
  surface: 0,
});

const mapReviewCategory = (
  issue: CustomizationValidationIssue
): SystemAdminCustomizationReviewCategory => {
  switch (issue.code) {
    case "customization.company_scope_not_allowed":
    case "customization.tenant_scope_not_allowed":
      return "scope";
    case "customization.duplicate_target":
    case "customization.node_removed":
    case "customization.node_renamed":
    case "customization.node_key_drift":
    case "customization.unknown_node_id":
      return "identity";
    case "customization.node_shape_drift":
    case "customization.stale_metadata":
      return "layering";
    case "customization.entity_mismatch":
    case "customization.feature_mismatch":
    case "customization.invalid_contract":
      return "schema";
    case "customization.entity_table_not_supported":
      return "surface";
    case "customization.hidden_required_field":
    case "customization.hidden_system_field":
    case "customization.override_not_allowed":
    case "customization.unsafe_action":
      return "policy";
    case "customization.invalid_default_sort":
    case "customization.unknown_key":
    case "customization.unknown_reference":
      return "reference";
    default:
      throw new Error(
        `Unsupported customization review issue code: ${issue.code}`
      );
  }
};

const mapReviewReason = (
  issue: CustomizationValidationIssue
): SystemAdminCustomizationReviewReason | undefined => {
  switch (issue.code) {
    case "customization.duplicate_target":
      return "duplicate-target";
    case "customization.node_removed":
    case "customization.unknown_node_id":
      return "node-removed";
    case "customization.node_key_drift":
    case "customization.node_renamed":
      return "node-renamed";
    case "customization.node_shape_drift":
      return "node-shape-drift";
    case "customization.stale_metadata":
      return "metadata-version-drift";
    default:
      return;
  }
};

const toReviewItem = (
  issue: CustomizationValidationIssue
): SystemAdminCustomizationReviewItem => ({
  category: mapReviewCategory(issue),
  code: issue.code,
  hint: issue.hint,
  message: issue.message,
  metadataNodeId: issue.metadataNodeId,
  metadataNodeKey: issue.metadataNodeKey,
  path: [...issue.path],
  reason: mapReviewReason(issue),
  severity: issue.severity,
  surface: issue.surface,
  targetNodeId: issue.targetNodeId,
  targetNodeKey: issue.targetNodeKey,
});

const toReviewWarnings = (
  review: CustomizationImportReviewContract
): string[] => {
  const warnings: string[] = [];

  if (review.requiresReview) {
    warnings.push(
      "Review is required before this customization should be promoted."
    );
  }

  if (!review.publishable) {
    warnings.push(
      "Strict publication is blocked until all error-level diagnostics are repaired."
    );
  }

  if (
    review.issues.some(
      (issue) =>
        issue.code === "customization.node_key_drift" ||
        issue.code === "customization.node_renamed"
    )
  ) {
    warnings.push(
      "One or more target nodes were renamed; rebind the fixture against current metadata."
    );
  }

  if (
    review.issues.some((issue) => issue.code === "customization.node_removed")
  ) {
    warnings.push(
      "One or more target nodes no longer exist in the target metadata; repair or remove those overrides before promotion."
    );
  }

  if (
    review.issues.some(
      (issue) => issue.code === "customization.node_shape_drift"
    )
  ) {
    warnings.push(
      "One or more target nodes changed structurally since export; verify the customization against the current metadata shape."
    );
  }

  if (
    review.issues.some((issue) => issue.code === "customization.stale_metadata")
  ) {
    warnings.push(
      "The fixture was built against a stale metadata fingerprint and needs targeted review."
    );
  }

  return warnings;
};

export type ReviewSystemAdminCustomizationFixtureInput = {
  fixture: CustomizationFixtureContract;
  metadata: CustomizableMetadata;
  mode: CustomizationImportMode;
};

export const reviewSystemAdminCustomizationFixture = (
  input: ReviewSystemAdminCustomizationFixtureInput,
  context: SystemAdminScope
): SystemAdminCustomizationReview => {
  requirePermission(
    createSystemAdminPermissionContext(
      context,
      customizationCapabilities.customizationRead
    ),
    { allOf: [customizationCapabilities.customizationRead] }
  );

  const review = reviewCustomizationFixtureImport(input);
  const items = review.issues.map(toReviewItem);
  const byCategory = createEmptyCategorySummary();

  for (const item of items) {
    byCategory[item.category] += 1;
  }

  const blockedCount = items.filter((item) => item.severity === "error").length;
  const reviewCount = items.filter(
    (item) => item.severity === "warning"
  ).length;
  let status: SystemAdminCustomizationReview["status"] = "valid";

  if (blockedCount > 0) {
    status = "blocked";
  } else if (reviewCount > 0) {
    status = "review";
  }

  return {
    customizationId: review.customization.id,
    items,
    mode: review.mode,
    publishable: review.publishable,
    requiresReview: review.requiresReview,
    status,
    summary: {
      blockedCount,
      byCategory,
      reviewCount,
      totalCount: items.length,
    },
    tenantId: review.customization.tenantId,
    valid: review.valid,
    warnings: toReviewWarnings(review),
  };
};
