export type GovernmentClassificationPayGradesStatus =
  | "draft"
  | "active"
  | "archived";

export type GovernmentClassificationPayGradesRecord = {
  id: string;
  name: string;
  status: GovernmentClassificationPayGradesStatus;
};

export type ListGovernmentClassificationPayGradesQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateGovernmentClassificationPayGradesInput = {
  name: string;
};

export type UpdateGovernmentClassificationPayGradesInput = {
  id: string;
  name?: string;
  status?: GovernmentClassificationPayGradesStatus;
};

export const governmentClassificationPayGradesRouteContracts = [] as const;

export const governmentClassificationPayGradesFeatureId =
  "hr-suite.industry-specific.government-classification-pay-grades" as const;
