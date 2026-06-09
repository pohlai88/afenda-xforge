import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";
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

export type HrEmployeeRecordsRepositoryContext = {
  canRead?: boolean;
  organizationId?: string;
};

type HrEmployeeRecordEntity = HrEmployeeRecordDetail & {
  organizationId: string | null;
};

type HrEmployeeRecordsRepositoryState = {
  records: HrEmployeeRecordEntity[];
};

const isoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date());

const hrEmployeeRecordEntitySchema = z.object({
  id: z.string().trim().min(1),
  organizationId: z.string().trim().min(1).nullable(),
  employeeNumber: z.string(),
  displayName: z.string(),
  employmentStatus: hrRecordsEmploymentStatusSchema,
  legalName: z.string(),
  preferredName: z.string().nullable(),
  departmentName: z.string().nullable(),
  positionTitle: z.string().nullable(),
  employmentStartDate: isoDateSchema.nullable(),
  employmentType: z.string(),
  workerCategory: z.string(),
  grade: z.string(),
  level: z.string(),
  legalEntityCode: z.string(),
  workLocationCode: z.string(),
  countryCode: z.string(),
  contractStartDate: isoDateSchema.nullable(),
  contractEndDate: isoDateSchema.nullable(),
  currentDepartmentId: z.string().trim().min(1).nullable(),
  currentPositionId: z.string().trim().min(1).nullable(),
  managerEmployeeId: z.string().trim().min(1).nullable(),
  matrixManagerEmployeeId: z.string().trim().min(1).nullable(),
  hrOwnerEmployeeId: z.string().trim().min(1).nullable(),
  email: z.string(),
  identityNumber: z.string(),
  identityDocumentType: z.string(),
  nationality: z.string(),
  phoneNumber: z.string(),
  personalEmail: z.string(),
  dateOfBirth: isoDateSchema.nullable(),
  gender: z.string(),
  maritalStatus: z.string(),
  languagePreference: z.string(),
  residentialAddress: z.string(),
  mailingAddress: z.string(),
  emergencyContactName: z.string(),
  emergencyContactRelationship: z.string(),
  emergencyContactPhoneNumber: z.string(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

const hrEmployeeRecordsRepositoryStateSchema = z.object({
  records: hrEmployeeRecordEntitySchema.array(),
});

const emptyState = (): HrEmployeeRecordsRepositoryState => ({ records: [] });

const defaultRepositoryPath = resolve(
  process.cwd(),
  ".cache",
  "hr-suite",
  "employee-records-management.repository.json"
);

let repositoryFilePath: string =
  process.env.AFENDA_EMPLOYEE_RECORDS_MANAGEMENT_REPOSITORY_PATH ??
  process.env.AFENDA_EMPLOYEE_RECORDS_MANAGEMENT_STORE_PATH ??
  defaultRepositoryPath;

let cache: HrEmployeeRecordsRepositoryState | null = null;

const normalizeOrganizationId = (
  organizationId: string | undefined
): string | null => organizationId?.trim() || null;

const normalizeText = (value: string | undefined): string =>
  value?.trim() ?? "";

const normalizeNullableText = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeDate = (value: Date | undefined): Date | null => value ?? null;

const updateTextField = (
  current: string,
  next: string | undefined
): string => (next === undefined ? current : normalizeText(next));

const updateNullableTextField = (
  current: string | null,
  next: string | undefined
): string | null =>
  next === undefined ? current : normalizeNullableText(next);

const updateDateField = (
  current: Date | null,
  next: Date | undefined
): Date | null => (next === undefined ? current : normalizeDate(next));

const cloneState = (
  state: HrEmployeeRecordsRepositoryState
): HrEmployeeRecordsRepositoryState => structuredClone(state);

const serializeState = (state: HrEmployeeRecordsRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): HrEmployeeRecordsRepositoryState => {
  if (!existsSync(repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(repositoryFilePath, "utf8");
  const parsed = JSON.parse(content) as unknown;
  return hrEmployeeRecordsRepositoryStateSchema.parse(parsed);
};

const persistRepositoryState = (
  state: HrEmployeeRecordsRepositoryState
): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeState(state), "utf8");
  renameSync(temporaryPath, repositoryFilePath);
};

const loadRepositoryState = (): HrEmployeeRecordsRepositoryState => {
  if (cache === null) {
    cache = readRepositoryStateFromDisk();
  }

  return cloneState(cache);
};

const saveRepositoryState = (state: HrEmployeeRecordsRepositoryState): void => {
  cache = cloneState(state);
  persistRepositoryState(cache);
};

const mutateRepositoryState = (
  updater: (draft: HrEmployeeRecordsRepositoryState) => void
): HrEmployeeRecordsRepositoryState => {
  const nextState = loadRepositoryState();
  updater(nextState);
  saveRepositoryState(nextState);
  return loadRepositoryState();
};

const buildDisplayName = (input: {
  legalName: string;
  preferredName?: string;
}): string => input.preferredName?.trim() || input.legalName.trim();

const matchesScope = (
  record: HrEmployeeRecordEntity,
  context?: HrEmployeeRecordsRepositoryContext
): boolean => {
  if (!context?.organizationId) {
    return true;
  }

  return record.organizationId === context.organizationId;
};

const toSummary = (
  record: HrEmployeeRecordEntity
): HrEmployeeRecordSummary => ({
  id: record.id,
  employeeNumber: record.employeeNumber,
  displayName: record.displayName,
  employmentStatus: record.employmentStatus,
});

const toDetail = (record: HrEmployeeRecordEntity): HrEmployeeRecordDetail => {
  const { organizationId: _organizationId, ...detail } = record;
  return detail;
};

const findScopedRecordIndex = (
  records: readonly HrEmployeeRecordEntity[],
  employeeId: string,
  context?: HrEmployeeRecordsRepositoryContext
): number => {
  const index = records.findIndex((record) => record.id === employeeId);
  if (index < 0) {
    return -1;
  }

  return matchesScope(records[index] as HrEmployeeRecordEntity, context)
    ? index
    : -1;
};

const buildBaseRecord = (input: {
  id: string;
  organizationId: string | null;
  employeeNumber: string;
  legalName: string;
  preferredName?: string;
  employmentStartDate?: Date;
  employmentType?: string;
  workerCategory?: string;
  grade?: string;
  level?: string;
  legalEntityCode?: string;
  workLocationCode?: string;
  countryCode?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  currentDepartmentId?: string;
  currentPositionId?: string;
  managerEmployeeId?: string;
  matrixManagerEmployeeId?: string;
  hrOwnerEmployeeId?: string;
  email?: string;
  personalEmail?: string;
  identityDocumentType?: string;
  identityNumber?: string;
  nationality?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  gender?: string;
  maritalStatus?: string;
  languagePreference?: string;
  residentialAddress?: string;
  mailingAddress?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhoneNumber?: string;
  employmentStatus: HrEmployeeRecordEntity["employmentStatus"];
}): HrEmployeeRecordEntity => {
  const now = new Date();

  return {
    id: input.id,
    organizationId: input.organizationId,
    employeeNumber: input.employeeNumber.trim(),
    displayName: buildDisplayName({
      legalName: input.legalName,
      preferredName: input.preferredName,
    }),
    employmentStatus: input.employmentStatus,
    legalName: input.legalName.trim(),
    preferredName: input.preferredName?.trim() || null,
    departmentName: normalizeNullableText(input.currentDepartmentId),
    positionTitle: normalizeNullableText(input.currentPositionId),
    employmentStartDate: normalizeDate(input.employmentStartDate),
    employmentType: normalizeText(input.employmentType),
    workerCategory: normalizeText(input.workerCategory),
    grade: normalizeText(input.grade),
    level: normalizeText(input.level),
    legalEntityCode: normalizeText(input.legalEntityCode),
    workLocationCode: normalizeText(input.workLocationCode),
    countryCode: normalizeText(input.countryCode),
    contractStartDate: normalizeDate(input.contractStartDate),
    contractEndDate: normalizeDate(input.contractEndDate),
    currentDepartmentId: normalizeNullableText(input.currentDepartmentId),
    currentPositionId: normalizeNullableText(input.currentPositionId),
    managerEmployeeId: normalizeNullableText(input.managerEmployeeId),
    matrixManagerEmployeeId: normalizeNullableText(input.matrixManagerEmployeeId),
    hrOwnerEmployeeId: normalizeNullableText(input.hrOwnerEmployeeId),
    email: normalizeText(input.email),
    identityNumber: normalizeText(input.identityNumber),
    identityDocumentType: normalizeText(input.identityDocumentType),
    nationality: normalizeText(input.nationality),
    phoneNumber: normalizeText(input.phoneNumber),
    personalEmail: normalizeText(input.personalEmail),
    dateOfBirth: normalizeDate(input.dateOfBirth),
    gender: normalizeText(input.gender),
    maritalStatus: normalizeText(input.maritalStatus),
    languagePreference: normalizeText(input.languagePreference),
    residentialAddress: normalizeText(input.residentialAddress),
    mailingAddress: normalizeText(input.mailingAddress),
    emergencyContactName: normalizeText(input.emergencyContactName),
    emergencyContactRelationship: normalizeText(
      input.emergencyContactRelationship
    ),
    emergencyContactPhoneNumber: normalizeText(
      input.emergencyContactPhoneNumber
    ),
    createdAt: now,
    updatedAt: now,
  };
};

export const getHrEmployeeRecordsRepositoryPath = (): string =>
  repositoryFilePath;

export const setHrEmployeeRecordsRepositoryPathForTesting = (
  nextPath: string
): void => {
  repositoryFilePath = resolve(nextPath);
  cache = null;
};

export const resetHrEmployeeRecordsRepositoryForTesting = (): void => {
  cache = emptyState();
  persistRepositoryState(cache);
};

export const loadHrEmployeeRecordsRepository =
  (): HrEmployeeRecordsRepositoryState => loadRepositoryState();

export const saveHrEmployeeRecordsRepository = (
  state: HrEmployeeRecordsRepositoryState
): void => {
  saveRepositoryState(state);
};

export const mutateHrEmployeeRecordsRepository = (
  updater: (draft: HrEmployeeRecordsRepositoryState) => void
): HrEmployeeRecordsRepositoryState => mutateRepositoryState(updater);

export function listHrEmployeeRecordsRepository(
  context?: HrEmployeeRecordsRepositoryContext
): readonly HrEmployeeRecordSummary[] {
  if (context?.canRead === false) {
    return [];
  }

  return loadRepositoryState()
    .records.filter((record) => matchesScope(record, context))
    .map(toSummary);
}

export function getHrEmployeeRecordRepository(
  employeeId: string,
  context?: HrEmployeeRecordsRepositoryContext
): HrEmployeeRecordDetail | null {
  if (context?.canRead === false) {
    return null;
  }

  const record = loadRepositoryState().records.find(
    (entry) => entry.id === employeeId
  );

  if (!(record && matchesScope(record, context))) {
    return null;
  }

  return toDetail(record);
}

export function createHrEmployeeRecordRepository(
  input: HrRecordsCreateEmployeeInput,
  context?: HrEmployeeRecordsRepositoryContext
): HrEmployeeRecordDetail {
  const createdRecordId = randomUUID();
  const nextRecord = buildBaseRecord({
    id: createdRecordId,
    organizationId: normalizeOrganizationId(context?.organizationId),
    employeeNumber: input.employeeNumber,
    legalName: input.legalName,
    preferredName: input.preferredName,
    employmentStartDate: input.employmentStartDate,
    employmentType: input.employmentType,
    workerCategory: input.workerCategory,
    grade: input.grade,
    level: input.level,
    legalEntityCode: input.legalEntityCode,
    workLocationCode: input.workLocationCode,
    countryCode: input.countryCode,
    contractStartDate: input.contractStartDate,
    contractEndDate: input.contractEndDate,
    currentDepartmentId: input.currentDepartmentId,
    currentPositionId: input.currentPositionId,
    managerEmployeeId: input.managerEmployeeId,
    matrixManagerEmployeeId: input.matrixManagerEmployeeId,
    hrOwnerEmployeeId: input.hrOwnerEmployeeId,
    email: input.email,
    personalEmail: input.personalEmail,
    identityDocumentType: input.identityDocumentType,
    identityNumber: input.identityNumber,
    nationality: input.nationality,
    dateOfBirth: input.dateOfBirth,
    phoneNumber: input.phoneNumber,
    gender: input.gender,
    maritalStatus: input.maritalStatus,
    languagePreference: input.languagePreference,
    residentialAddress: input.residentialAddress,
    mailingAddress: input.mailingAddress,
    emergencyContactName: input.emergencyContactName,
    emergencyContactRelationship: input.emergencyContactRelationship,
    emergencyContactPhoneNumber: input.emergencyContactPhoneNumber,
    employmentStatus: "draft",
  });

  mutateRepositoryState((draft) => {
    draft.records = [...draft.records, nextRecord];
  });

  return toDetail(nextRecord);
}

export function updateHrEmployeeRecordRepository(
  input: HrRecordsUpdateEmployeeInput,
  context?: HrEmployeeRecordsRepositoryContext
): HrEmployeeRecordDetail | null {
  let updatedRecord: HrEmployeeRecordEntity | null = null;

  mutateRepositoryState((draft) => {
    const index = findScopedRecordIndex(
      draft.records,
      input.employeeId,
      context
    );
    if (index < 0) {
      return;
    }

    const current = draft.records[index];
    const nextPreferredName =
      input.preferredName !== undefined
        ? normalizeNullableText(input.preferredName)
        : current.preferredName;

    updatedRecord = {
      ...current,
      employeeNumber: input.employeeNumber?.trim() ?? current.employeeNumber,
      displayName: buildDisplayName({
        legalName: input.legalName?.trim() ?? current.legalName,
        preferredName: nextPreferredName ?? undefined,
      }),
      employmentStatus:
        input.employmentStatus ?? current.employmentStatus ?? "draft",
      legalName: input.legalName?.trim() ?? current.legalName,
      preferredName: nextPreferredName,
      employmentStartDate:
        input.employmentStartDate !== undefined
          ? normalizeDate(input.employmentStartDate)
          : current.employmentStartDate,
      employmentType:
        input.employmentType !== undefined
          ? normalizeText(input.employmentType)
          : current.employmentType,
      workerCategory:
        input.workerCategory !== undefined
          ? normalizeText(input.workerCategory)
          : current.workerCategory,
      grade:
        input.grade !== undefined ? normalizeText(input.grade) : current.grade,
      level:
        input.level !== undefined ? normalizeText(input.level) : current.level,
      legalEntityCode:
        input.legalEntityCode !== undefined
          ? normalizeText(input.legalEntityCode)
          : current.legalEntityCode,
      workLocationCode:
        input.workLocationCode !== undefined
          ? normalizeText(input.workLocationCode)
          : current.workLocationCode,
      countryCode:
        input.countryCode !== undefined
          ? normalizeText(input.countryCode)
          : current.countryCode,
      contractStartDate:
        input.contractStartDate !== undefined
          ? normalizeDate(input.contractStartDate)
          : current.contractStartDate,
      contractEndDate:
        input.contractEndDate !== undefined
          ? normalizeDate(input.contractEndDate)
          : current.contractEndDate,
      matrixManagerEmployeeId:
        input.matrixManagerEmployeeId !== undefined
          ? normalizeNullableText(input.matrixManagerEmployeeId)
          : current.matrixManagerEmployeeId,
      hrOwnerEmployeeId:
        input.hrOwnerEmployeeId !== undefined
          ? normalizeNullableText(input.hrOwnerEmployeeId)
          : current.hrOwnerEmployeeId,
      email: input.email?.trim() ?? current.email,
      identityDocumentType:
        input.identityDocumentType !== undefined
          ? normalizeText(input.identityDocumentType)
          : current.identityDocumentType,
      identityNumber:
        input.identityNumber !== undefined
          ? normalizeText(input.identityNumber)
          : current.identityNumber,
      nationality:
        input.nationality !== undefined
          ? normalizeText(input.nationality)
          : current.nationality,
      dateOfBirth:
        input.dateOfBirth !== undefined
          ? normalizeDate(input.dateOfBirth)
          : current.dateOfBirth,
      phoneNumber:
        input.phoneNumber !== undefined
          ? normalizeText(input.phoneNumber)
          : current.phoneNumber,
      personalEmail:
        input.personalEmail !== undefined
          ? normalizeText(input.personalEmail)
          : current.personalEmail,
      gender:
        input.gender !== undefined
          ? normalizeText(input.gender)
          : current.gender,
      maritalStatus:
        input.maritalStatus !== undefined
          ? normalizeText(input.maritalStatus)
          : current.maritalStatus,
      languagePreference:
        input.languagePreference !== undefined
          ? normalizeText(input.languagePreference)
          : current.languagePreference,
      residentialAddress:
        input.residentialAddress !== undefined
          ? normalizeText(input.residentialAddress)
          : current.residentialAddress,
      mailingAddress:
        input.mailingAddress !== undefined
          ? normalizeText(input.mailingAddress)
          : current.mailingAddress,
      emergencyContactName:
        input.emergencyContactName !== undefined
          ? normalizeText(input.emergencyContactName)
          : current.emergencyContactName,
      emergencyContactRelationship:
        input.emergencyContactRelationship !== undefined
          ? normalizeText(input.emergencyContactRelationship)
          : current.emergencyContactRelationship,
      emergencyContactPhoneNumber:
        input.emergencyContactPhoneNumber !== undefined
          ? normalizeText(input.emergencyContactPhoneNumber)
          : current.emergencyContactPhoneNumber,
      updatedAt: new Date(),
    };

    const nextRecords = [...draft.records];
    nextRecords[index] = updatedRecord;
    draft.records = nextRecords;
  });

  return updatedRecord ? toDetail(updatedRecord) : null;
}

export function archiveHrEmployeeRecordRepository(
  input: HrRecordsArchiveEmployeeInput,
  context?: HrEmployeeRecordsRepositoryContext
): HrEmployeeRecordDetail | null {
  let archivedRecord: HrEmployeeRecordEntity | null = null;

  mutateRepositoryState((draft) => {
    const index = findScopedRecordIndex(
      draft.records,
      input.employeeId,
      context
    );
    if (index < 0) {
      return;
    }

    const current = draft.records[index];
    archivedRecord = {
      ...current,
      employmentStatus: hrRecordsEmploymentStatusSchema.parse("archived"),
      updatedAt: new Date(),
    };

    const nextRecords = [...draft.records];
    nextRecords[index] = archivedRecord;
    draft.records = nextRecords;
  });

  return archivedRecord ? toDetail(archivedRecord) : null;
}

export function assignHrEmployeeRecordRepository(
  input: HrRecordsAssignmentInput,
  context?: HrEmployeeRecordsRepositoryContext
): HrEmployeeRecordDetail | null {
  let assignedRecord: HrEmployeeRecordEntity | null = null;

  mutateRepositoryState((draft) => {
    const index = findScopedRecordIndex(
      draft.records,
      input.employeeId,
      context
    );
    if (index < 0) {
      return;
    }

    const current = draft.records[index];
    const nextCurrentDepartmentId =
      input.currentDepartmentId !== undefined
        ? normalizeNullableText(input.currentDepartmentId)
        : current.currentDepartmentId;
    const nextCurrentPositionId =
      input.currentPositionId !== undefined
        ? normalizeNullableText(input.currentPositionId)
        : current.currentPositionId;
    const nextManagerEmployeeId =
      input.managerEmployeeId !== undefined
        ? normalizeNullableText(input.managerEmployeeId)
        : current.managerEmployeeId;

    assignedRecord = {
      ...current,
      departmentName: nextCurrentDepartmentId,
      positionTitle: nextCurrentPositionId,
      currentDepartmentId: nextCurrentDepartmentId,
      currentPositionId: nextCurrentPositionId,
      managerEmployeeId: nextManagerEmployeeId,
      updatedAt: new Date(),
    };

    const nextRecords = [...draft.records];
    nextRecords[index] = assignedRecord;
    draft.records = nextRecords;
  });

  return assignedRecord ? toDetail(assignedRecord) : null;
}

export function rehireHrEmployeeRecordRepository(
  input: HrRecordsRehireEmployeeInput,
  context?: HrEmployeeRecordsRepositoryContext
): HrEmployeeRecordDetail {
  const createdRecordId = randomUUID();
  const nextRecord = buildBaseRecord({
    id: createdRecordId,
    organizationId: normalizeOrganizationId(context?.organizationId),
    employeeNumber: input.employeeNumber,
    legalName: input.legalName,
    preferredName: input.preferredName,
    employmentStartDate: input.employmentStartDate,
    email: input.email,
    employmentStatus: "active",
  });

  mutateRepositoryState((draft) => {
    draft.records = [...draft.records, nextRecord];
  });

  return toDetail(nextRecord);
}
