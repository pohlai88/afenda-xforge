import "server-only";

import type { CreateEmployeeSelfservicePortalProfileUpdateRequestInput } from "./schema.ts";

export type EmployeeSelfservicePortalProfileSource = Readonly<{
  countryCode: string;
  departmentName: string | null;
  displayName: string;
  email: string;
  employeeId: string;
  employeeNumber: string;
  employmentStatus: string;
  employmentType: string;
  languagePreference: string;
  legalName: string;
  managerEmployeeId: string | null;
  personalEmail: string;
  phoneNumber: string;
  positionTitle: string | null;
  preferredName: string | null;
  workLocationCode: string;
}>;

export type EmployeeSelfservicePortalProfileSourceQuery = Readonly<{
  canViewSensitive: boolean;
  employeeId: string;
  organizationId: string;
}>;

export type EmployeeSelfservicePortalApprovedProfileUpdateInput = Readonly<{
  approvalReference: string;
  employeeId: string;
  organizationId: string;
  reason: string;
  requestedChanges: CreateEmployeeSelfservicePortalProfileUpdateRequestInput["requestedChanges"];
  userId?: string;
}>;

export type EmployeeSelfservicePortalApprovedProfileUpdateResult =
  | Readonly<{ ok: true }>
  | Readonly<{ error: string; ok: false }>;

export type EmployeeSelfservicePortalEmployeeRecordsIntegration = Readonly<{
  applyApprovedProfileUpdate: (
    input: EmployeeSelfservicePortalApprovedProfileUpdateInput
  ) => Promise<EmployeeSelfservicePortalApprovedProfileUpdateResult>;
  getProfileSource: (
    input: EmployeeSelfservicePortalProfileSourceQuery
  ) => EmployeeSelfservicePortalProfileSource | null;
}>;

let employeeRecordsIntegration: EmployeeSelfservicePortalEmployeeRecordsIntegration | null =
  null;

export const configureEmployeeSelfservicePortalEmployeeRecordsIntegration = (
  integration: EmployeeSelfservicePortalEmployeeRecordsIntegration
): void => {
  employeeRecordsIntegration = integration;
};

export const resetEmployeeSelfservicePortalEmployeeRecordsIntegrationForTesting =
  (): void => {
    employeeRecordsIntegration = null;
  };

export const getEmployeeSelfservicePortalProfileSource = (
  input: EmployeeSelfservicePortalProfileSourceQuery
): EmployeeSelfservicePortalProfileSource | null =>
  employeeRecordsIntegration?.getProfileSource(input) ?? null;

export const applyEmployeeSelfservicePortalApprovedProfileUpdate = (
  input: EmployeeSelfservicePortalApprovedProfileUpdateInput
): Promise<EmployeeSelfservicePortalApprovedProfileUpdateResult> => {
  if (!employeeRecordsIntegration) {
    throw new Error(
      "Employee self-service portal employee records integration is not configured."
    );
  }

  return employeeRecordsIntegration.applyApprovedProfileUpdate(input);
};
