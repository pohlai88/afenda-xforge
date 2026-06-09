export type CandidateSelfservicePortalStatus = "draft" | "active" | "archived";

export type CandidateSelfservicePortalRecord = {
  id: string;
  name: string;
  status: CandidateSelfservicePortalStatus;
};

export type ListCandidateSelfservicePortalQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateCandidateSelfservicePortalInput = {
  name: string;
};

export type UpdateCandidateSelfservicePortalInput = {
  id: string;
  name?: string;
  status?: CandidateSelfservicePortalStatus;
};

export const candidateSelfservicePortalRouteContracts = [] as const;

export const candidateSelfservicePortalFeatureId = "hr-suite.talent-management.candidate-selfservice-portal" as const;
