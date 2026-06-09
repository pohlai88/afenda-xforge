export type BonusIncentiveManagementStatus = "draft" | "active" | "archived";

export type BonusIncentiveManagementRecord = {
  id: string;
  name: string;
  status: BonusIncentiveManagementStatus;
};

export type ListBonusIncentiveManagementQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateBonusIncentiveManagementInput = {
  name: string;
};

export type UpdateBonusIncentiveManagementInput = {
  id: string;
  name?: string;
  status?: BonusIncentiveManagementStatus;
};

export const bonusIncentiveManagementRouteContracts = [] as const;

export const bonusIncentiveManagementFeatureId =
  "hr-suite.payroll-compensation.bonus-incentive-management" as const;
