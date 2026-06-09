import type { HrEmployeeRecordDetail } from "../hr.workforce.records.contract.ts";
import {
  hrEmployeeIntegrationChangeEventSchema,
  hrEmployeeIntegrationSnapshotSchema,
} from "../contracts/integration.contract.ts";

const toIsoDate = (value: Date | null | undefined): string | null =>
  value ? value.toISOString() : null;

const toNullableString = (value: string | null | undefined): string | null =>
  value?.trim() || null;

export function projectHrEmployeeIntegrationSnapshot(
  record: HrEmployeeRecordDetail,
  canViewSensitive = false
): ReturnType<typeof hrEmployeeIntegrationSnapshotSchema.parse> {
  const snapshot = {
    snapshotVersion: 1 as const,
    reference: {
      employeeId: record.id,
      employeeNumber: record.employeeNumber,
      displayName: record.displayName,
      organizationId: record.organizationId,
      employmentStatus: record.employmentStatus,
    },
    assignment: {
      departmentId: toNullableString(record.currentDepartmentId),
      positionId: toNullableString(record.currentPositionId),
      managerEmployeeId: toNullableString(record.managerEmployeeId),
      matrixManagerEmployeeId: toNullableString(record.matrixManagerEmployeeId),
      hrOwnerEmployeeId: toNullableString(record.hrOwnerEmployeeId),
      workLocationCode: toNullableString(record.workLocationCode),
    },
    employment: {
      employmentStartDate: toIsoDate(record.employmentStartDate),
      employmentType: toNullableString(record.employmentType),
      workerCategory: toNullableString(record.workerCategory),
      grade: toNullableString(record.grade),
      level: toNullableString(record.level),
      legalEntityCode: toNullableString(record.legalEntityCode),
      countryCode: toNullableString(record.countryCode),
      contractStartDate: toIsoDate(record.contractStartDate),
      contractEndDate: toIsoDate(record.contractEndDate),
    },
    status: {
      currentStatus: record.employmentStatus,
      effectiveAt: toIsoDate(record.updatedAt),
      reason: null,
      source: "employee-records.current",
    },
    documentReferenceCoverage: {
      status: "not-owned" as const,
      reason: "Document references are owned by the document-management package.",
    },
    ...(canViewSensitive
      ? {
          sensitive: {
            dateOfBirth: toIsoDate(record.dateOfBirth),
            email: toNullableString(record.email),
            emergencyContactPhoneNumber: toNullableString(
              record.emergencyContactPhoneNumber
            ),
            identityNumber: toNullableString(record.identityNumber),
            mailingAddress: toNullableString(record.mailingAddress),
            personalEmail: toNullableString(record.personalEmail),
            phoneNumber: toNullableString(record.phoneNumber),
            residentialAddress: toNullableString(record.residentialAddress),
          },
        }
      : {}),
  };

  return hrEmployeeIntegrationSnapshotSchema.parse(snapshot);
}

export function projectHrEmployeeIntegrationChangeEvent(
  record: HrEmployeeRecordDetail,
  canViewSensitive = false
): ReturnType<typeof hrEmployeeIntegrationChangeEventSchema.parse> {
  return hrEmployeeIntegrationChangeEventSchema.parse({
    eventName: "hr.employees.employee.integration.changed.v1",
    eventVersion: 1,
    occurredAt: record.updatedAt.toISOString(),
    organizationId: record.organizationId,
    employeeId: record.id,
    snapshot: projectHrEmployeeIntegrationSnapshot(record, canViewSensitive),
  });
}
