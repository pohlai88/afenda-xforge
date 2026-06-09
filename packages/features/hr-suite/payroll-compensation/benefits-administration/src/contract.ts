export type BenefitsAdministrationStatus = "draft" | "active" | "archived";

export type BenefitsAdministrationRecord = {
  id: string;
  name: string;
  status: BenefitsAdministrationStatus;
};

export type ListBenefitsAdministrationQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateBenefitsAdministrationInput = {
  name: string;
};

export type UpdateBenefitsAdministrationInput = {
  id: string;
  name?: string;
  status?: BenefitsAdministrationStatus;
};

export const benefitsAdministrationRouteContracts = [] as const;

export const benefitsAdministrationFeatureId =
  "hr-suite.payroll-compensation.benefits-administration" as const;
