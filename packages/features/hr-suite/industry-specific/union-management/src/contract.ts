export type UnionManagementStatus = "draft" | "active" | "archived";

export type UnionManagementRecord = {
  id: string;
  name: string;
  status: UnionManagementStatus;
};

export type ListUnionManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateUnionManagementInput = {
  name: string;
};

export type UpdateUnionManagementInput = {
  id: string;
  name?: string;
  status?: UnionManagementStatus;
};

export const unionManagementRouteContracts = [] as const;

export const unionManagementFeatureId =
  "hr-suite.industry-specific.union-management" as const;
