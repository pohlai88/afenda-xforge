/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateBenefitsAdministrationInput,
  BenefitsAdministrationRecord,
  ListBenefitsAdministrationQuery,
  UpdateBenefitsAdministrationInput,
} from "./contract.ts";
export { benefitsAdministrationExecutionSurface } from "./execution/index.ts";
export { benefitsAdministrationManifest } from "./manifest.ts";
export { benefitsAdministrationMetadata } from "./metadata.ts";
export {
  createBenefitsAdministration,
  getBenefitsAdministration,
  listBenefitsAdministration,
  benefitsAdministrationRouteContracts,
  updateBenefitsAdministration,
} from "./server.ts";
export { benefitsAdministrationFeatureScope } from "./shared/index.ts";
