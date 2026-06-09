import "server-only";

export {
  createCandidateSelfservicePortalRecord as createCandidateSelfservicePortal,
  updateCandidateSelfservicePortalRecord as updateCandidateSelfservicePortal,
} from "./actions.ts";
export { candidateSelfservicePortalRouteContracts } from "./contract.ts";
export {
  getCandidateSelfservicePortalRecord as getCandidateSelfservicePortal,
  listCandidateSelfservicePortalRecords as listCandidateSelfservicePortal,
} from "./queries.ts";
