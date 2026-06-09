export type FieldWorkerRemoteWorkforceManagementStatus =
  | "draft"
  | "active"
  | "archived";

export type FieldWorkerRemoteWorkforceManagementRecord = {
  id: string;
  name: string;
  status: FieldWorkerRemoteWorkforceManagementStatus;
};

export type ListFieldWorkerRemoteWorkforceManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateFieldWorkerRemoteWorkforceManagementInput = {
  name: string;
};

export type UpdateFieldWorkerRemoteWorkforceManagementInput = {
  id: string;
  name?: string;
  status?: FieldWorkerRemoteWorkforceManagementStatus;
};

export const fieldWorkerRemoteWorkforceManagementRouteContracts = [] as const;

export const fieldWorkerRemoteWorkforceManagementFeatureId =
  "hr-suite.industry-specific.field-worker-remote-workforce-management" as const;
