import type {
  EmployeeSelfservicePortalProfileView,
  EmployeeSelfservicePortalRecord,
} from "../schema.ts";
import { employeeSelfservicePortalProfileViewSchema } from "../schema.ts";

type EmployeeProfileDetailInput = {
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
};

export function projectEmployeeSelfservicePortalProfile(
  input: EmployeeProfileDetailInput,
  actorEmployeeId: string,
  canViewSensitive: boolean,
  portalRecord: EmployeeSelfservicePortalRecord | null
): EmployeeSelfservicePortalProfileView {
  return employeeSelfservicePortalProfileViewSchema.parse({
    portalRecordId: portalRecord?.id ?? null,
    portalStatus: portalRecord?.status ?? null,
    actorEmployeeId,
    employeeId: input.employeeId,
    employeeNumber: input.employeeNumber,
    displayName: input.displayName,
    legalName: input.legalName,
    preferredName: input.preferredName,
    employmentStatus: input.employmentStatus,
    departmentName: input.departmentName,
    positionTitle: input.positionTitle,
    managerEmployeeId: input.managerEmployeeId,
    workLocationCode: input.workLocationCode,
    employmentType: input.employmentType,
    countryCode: input.countryCode,
    languagePreference: input.languagePreference,
    email: input.email,
    personalEmail: input.personalEmail,
    phoneNumber: input.phoneNumber,
    canViewSensitive,
  });
}
