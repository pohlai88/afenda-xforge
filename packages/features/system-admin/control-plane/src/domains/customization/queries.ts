import "server-only";

import type { CustomizationFixtureContract } from "@repo/customization";
import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";
import type {
  SystemAdminCustomizationReview,
  SystemAdminCustomizationReviewRequest,
  SystemAdminScope,
} from "../../schema.ts";
import type { ReviewSystemAdminCustomizationFixtureInput } from "./review.ts";
import { reviewSystemAdminCustomizationFixture } from "./review.ts";

export function reviewSystemAdminCustomizationImport(
  request: SystemAdminCustomizationReviewRequest,
  context: SystemAdminScope
): SystemAdminCustomizationReview;
export function reviewSystemAdminCustomizationImport(
  fixture: CustomizationFixtureContract,
  metadata: EntityMetadata | MetadataFeatureContract,
  mode: "draft-with-warnings" | "strict",
  context: SystemAdminScope
): SystemAdminCustomizationReview;
export function reviewSystemAdminCustomizationImport(
  fixtureOrRequest:
    | CustomizationFixtureContract
    | SystemAdminCustomizationReviewRequest,
  metadataOrContext:
    | EntityMetadata
    | MetadataFeatureContract
    | SystemAdminScope,
  mode?: "draft-with-warnings" | "strict",
  context?: SystemAdminScope
): SystemAdminCustomizationReview {
  if (context && mode) {
    return reviewSystemAdminCustomizationFixture(
      {
        fixture: fixtureOrRequest as CustomizationFixtureContract,
        metadata: metadataOrContext as EntityMetadata | MetadataFeatureContract,
        mode,
      },
      context
    );
  }

  const request = fixtureOrRequest as SystemAdminCustomizationReviewRequest;
  return reviewSystemAdminCustomizationFixture(
    {
      fixture: request.fixture,
      metadata:
        request.metadata as ReviewSystemAdminCustomizationFixtureInput["metadata"],
      mode: request.mode,
    },
    metadataOrContext as SystemAdminScope
  );
}
