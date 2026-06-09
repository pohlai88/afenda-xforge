import {
  createCandidateSelfservicePortal,
  getCandidateSelfservicePortal,
  listCandidateSelfservicePortal,
  updateCandidateSelfservicePortal,
} from "../server.ts";

export const candidateSelfservicePortalExecutionSurface = {
  create: createCandidateSelfservicePortal,
  getById: getCandidateSelfservicePortal,
  list: listCandidateSelfservicePortal,
  update: updateCandidateSelfservicePortal,
};
