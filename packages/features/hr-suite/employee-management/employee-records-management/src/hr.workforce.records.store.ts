import { randomUUID } from "node:crypto";
import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsCreateEmployeeInput,
  HrRecordsRehireEmployeeInput,
  HrRecordsUpdateEmployeeInput,
} from "./hr.workforce.records.contract.ts";
import { hrRecordsEmploymentStatusSchema } from "./hr.workforce.records-employment-status.schema.ts";

const records = new Map<string, HrEmployeeRecordDetail>();

const now = (): Date => new Date();

const buildDisplayName = (input: {
  legalName: string;
  preferredName?: string;
}): string => input.preferredName?.trim() || input.legalName.trim();

const toSummary = (
  record: HrEmployeeRecordDetail
): HrEmployeeRecordSummary => ({
  id: record.id,
  employeeNumber: record.employeeNumber,
  displayName: record.displayName,
  employmentStatus: record.employmentStatus,
});

export const hrRecordsStore = {
  list(): readonly HrEmployeeRecordSummary[] {
    return Array.from(records.values()).map(toSummary);
  },
  get(id: string): HrEmployeeRecordDetail | null {
    return records.get(id) ?? null;
  },
  create(input: HrRecordsCreateEmployeeInput): HrEmployeeRecordDetail {
    const id = randomUUID();
    const record: HrEmployeeRecordDetail = {
      id,
      employeeNumber: input.employeeNumber.trim(),
      displayName: buildDisplayName(input),
      employmentStatus: "draft",
      legalName: input.legalName.trim(),
      preferredName: input.preferredName?.trim() || null,
      departmentName: null,
      positionTitle: null,
      email: input.email?.trim() || "",
      identityNumber: "",
      identityDocumentType: "",
      nationality: "",
      phoneNumber: "",
      personalEmail: "",
      dateOfBirth: null,
      gender: "",
      maritalStatus: "",
      languagePreference: "",
      residentialAddress: "",
      mailingAddress: "",
      createdAt: now(),
      updatedAt: now(),
    };
    records.set(id, record);
    return record;
  },
  update(input: HrRecordsUpdateEmployeeInput): HrEmployeeRecordDetail | null {
    const current = records.get(input.employeeId);
    if (!current) {
      return null;
    }

    const next: HrEmployeeRecordDetail = {
      ...current,
      employeeNumber: input.employeeNumber?.trim() ?? current.employeeNumber,
      displayName: buildDisplayName({
        legalName: input.legalName?.trim() ?? current.legalName,
        preferredName:
          input.preferredName ?? current.preferredName ?? undefined,
      }),
      employmentStatus:
        input.employmentStatus ?? current.employmentStatus ?? "draft",
      legalName: input.legalName?.trim() ?? current.legalName,
      preferredName: input.preferredName?.trim() ?? current.preferredName,
      email: input.email?.trim() ?? current.email,
      updatedAt: now(),
    };
    records.set(input.employeeId, next);
    return next;
  },
  archive(input: HrRecordsArchiveEmployeeInput): HrEmployeeRecordDetail | null {
    const current = records.get(input.employeeId);
    if (!current) {
      return null;
    }

    const next = {
      ...current,
      employmentStatus: hrRecordsEmploymentStatusSchema.parse("archived"),
      updatedAt: now(),
    };
    records.set(input.employeeId, next);
    return next;
  },
  assign(input: HrRecordsAssignmentInput): HrEmployeeRecordDetail | null {
    const current = records.get(input.employeeId);
    if (!current) {
      return null;
    }

    const next = {
      ...current,
      departmentName: input.currentDepartmentId ?? current.departmentName,
      positionTitle: input.currentPositionId ?? current.positionTitle,
      updatedAt: now(),
    };
    records.set(input.employeeId, next);
    return next;
  },
  rehire(input: HrRecordsRehireEmployeeInput): HrEmployeeRecordDetail {
    const record = this.create({
      employeeNumber: input.employeeNumber,
      legalName: input.legalName,
      preferredName: input.preferredName,
      email: input.email,
    });
    const next = {
      ...record,
      employmentStatus: "active" as const,
    };
    records.set(next.id, next);
    return next;
  },
};
