/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateRecruitmentOnboardingInput,
  RecruitmentOnboardingRecord,
  ListRecruitmentOnboardingQuery,
  UpdateRecruitmentOnboardingInput,
} from "./contract.ts";
export { recruitmentOnboardingExecutionSurface } from "./execution/index.ts";
export { recruitmentOnboardingManifest } from "./manifest.ts";
export { recruitmentOnboardingMetadata } from "./metadata.ts";
export {
  createRecruitmentOnboarding,
  getRecruitmentOnboarding,
  listRecruitmentOnboarding,
  recruitmentOnboardingRouteContracts,
  updateRecruitmentOnboarding,
} from "./server.ts";
export { recruitmentOnboardingFeatureScope } from "./shared/index.ts";
