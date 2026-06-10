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
import { hrRecordsEmploymentStatusSchema } from "./employment-status.schema.ts";
import type {
  HrEmployeeRecordDetail,
  HrEmployeeRecordSummary,
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsCreateEmployeeInput,
  HrRecordsRehireEmployeeInput,
  HrRecordsUpdateEmployeeInput,
} from "./records.contract.ts";
import { hrRecordsActionRegistry } from "./registry/action-registry.ts";
import {
  buildHrEmployeeRecordArchiveAuditRecord,
  buildHrEmployeeRecordAuditRecord,
} from "./registry/audit.ts";
import type {
  HrEmployeeAssignmentRecord as HrEmployeeAssignmentRecordModel,
  HrEmployeeRecordAuditEntry as HrEmployeeRecordAuditRecordModel,
  HrEmployeeStatusHistoryRecord as HrEmployeeStatusHistoryRecordModel,
} from "./schema.ts";
import {
  hrEmployeeAssignmentRecordSchema,
  hrEmployeeRecordAuditEntrySchema,
  hrEmployeeStatusHistoryRecordSchema,
} from "./schema.ts";

export type HrEmployeeRecordsRepositoryContext = {
  canRead?: boolean;
  organizationId?: string;
  userId?: string;
};

type HrEmployeeRecordEntity = HrEmployeeRecordDetail & {
  organizationId: string | null;
  assignmentHistory: HrEmployeeAssignmentRecordModel[];
  auditTrail: HrEmployeeRecordAuditRecordModel[];
  statusHistory: HrEmployeeStatusHistoryRecordModel[];
};

export type HrEmployeeRecordsRepositoryState = {
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
  assignmentHistory: hrEmployeeAssignmentRecordSchema.array().default([]),
  auditTrail: hrEmployeeRecordAuditEntrySchema.array().default([]),
  statusHistory: hrEmployeeStatusHistoryRecordSchema.array().default([]),
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
  /* turbopackIgnore: true */ process.cwd(),
  ".cache",
  "hr-suite",
  "employee-records-management.repository.json"
);

type HrEmployeeRecordsRepositoryRuntimeState = {
  cache: HrEmployeeRecordsRepositoryState | null;
  repositoryFilePath: string;
};

const hrEmployeeRecordsRepositoryStateKey = Symbol.for(
  "afenda.employee-records-management.repository-state"
);

const globalHrEmployeeRecordsRepositoryState = globalThis as typeof globalThis & {
  [hrEmployeeRecordsRepositoryStateKey]?: HrEmployeeRecordsRepositoryRuntimeState;
};

const runtimeState =
  globalHrEmployeeRecordsRepositoryState[hrEmployeeRecordsRepositoryStateKey] ??
  (globalHrEmployeeRecordsRepositoryState[hrEmployeeRecordsRepositoryStateKey] = {
    cache: null,
    repositoryFilePath:
      process.env.AFENDA_EMPLOYEE_RECORDS_MANAGEMENT_REPOSITORY_PATH ??
      process.env.AFENDA_EMPLOYEE_RECORDS_MANAGEMENT_STORE_PATH ??
      defaultRepositoryPath,
  });

const normalizeOrganizationId = (
  organizationId: string | undefined
): string | null => organizationId?.trim() || null;

const normalizeText = (value: string | undefined): string =>
  value?.trim() ?? "";

const normalizeNullableText = (
  value: string | null | undefined
): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeDate = (value: Date | undefined): Date | null => value ?? null;

const updateTextField = (current: string, next: string | undefined): string =>
  next === undefined ? current : normalizeText(next);

const updateNullableTextField = (
  current: string | null,
  next: string | undefined
): string | null =>
  next === undefined ? current : normalizeNullableText(next);

const updateDateField = (
  current: Date | null,
  next: Date | undefined
): Date | null => (next === undefined ? current : normalizeDate(next));

const normalizeAssignmentReason = (
  assignmentReason: string | undefined,
  reason: string | undefined
): string | null => normalizeNullableText(assignmentReason ?? reason);

const normalizeStatusReason = (
  reason: string | null | undefined
): string | null => normalizeNullableText(reason);

const compareAssignmentHistoryRecords = (
  left: HrEmployeeAssignmentRecordModel,
  right: HrEmployeeAssignmentRecordModel
): number =>
  right.effectiveFrom.getTime() - left.effectiveFrom.getTime() ||
  right.createdAt.getTime() - left.createdAt.getTime() ||
  right.updatedAt.getTime() - left.updatedAt.getTime() ||
  right.id.localeCompare(left.id);

const sortAssignmentHistoryRecords = (
  assignments: readonly HrEmployeeAssignmentRecordModel[]
): readonly HrEmployeeAssignmentRecordModel[] =>
  [...assignments].sort(compareAssignmentHistoryRecords);

const getCurrentAssignmentHistoryRecord = (
  assignments: readonly HrEmployeeAssignmentRecordModel[]
): HrEmployeeAssignmentRecordModel | null =>
  sortAssignmentHistoryRecords(assignments)[0] ?? null;

const closeCurrentAssignmentHistoryRecord = (
  assignments: readonly HrEmployeeAssignmentRecordModel[],
  effectiveTo: Date
): readonly HrEmployeeAssignmentRecordModel[] => {
  const currentAssignment = getCurrentAssignmentHistoryRecord(assignments);
  if (!currentAssignment) {
    return assignments;
  }

  if (currentAssignment.effectiveFrom.getTime() > effectiveTo.getTime()) {
    throw new Error(
      "Assignment effective date must not precede the current assignment"
    );
  }

  return sortAssignmentHistoryRecords([
    {
      ...currentAssignment,
      effectiveTo,
      updatedAt: effectiveTo,
    },
    ...assignments.filter(
      (assignment) => assignment.id !== currentAssignment.id
    ),
  ]);
};

const assertScopedEmployeeReferenceExists = (
  records: readonly HrEmployeeRecordEntity[],
  employeeReferenceId: string | null | undefined,
  context: HrEmployeeRecordsRepositoryContext | undefined,
  currentEmployeeId: string | null,
  fieldLabel: string
): void => {
  const referenceId = normalizeNullableText(employeeReferenceId);
  if (!referenceId) {
    return;
  }

  if (referenceId === currentEmployeeId) {
    throw new Error(
      `${fieldLabel} cannot reference the employee record itself`
    );
  }

  const referenceIndex = findScopedRecordIndex(records, referenceId, context);
  if (referenceIndex < 0) {
    throw new Error(
      `${fieldLabel} must reference an employee in the same organization`
    );
  }
};

const allowedEmploymentStatusTransitions: Readonly<
  Record<
    HrEmployeeRecordEntity["employmentStatus"],
    readonly HrEmployeeRecordEntity["employmentStatus"][]
  >
> = {
  draft: ["active", "archived"],
  active: ["archived", "separated"],
  archived: ["separated"],
  separated: [],
};

const assertEmploymentStatusTransition = (
  currentStatus: HrEmployeeRecordEntity["employmentStatus"],
  nextStatus: HrEmployeeRecordEntity["employmentStatus"]
): void => {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!allowedEmploymentStatusTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(
      `Invalid employment status transition from ${currentStatus} to ${nextStatus}`
    );
  }
};

const buildStatusHistoryRecord = (input: {
  actorId?: string | null;
  employeeId: string;
  effectiveAt: Date;
  organizationId: string | null;
  previousStatus: HrEmployeeRecordEntity["employmentStatus"] | null;
  reason?: string | null;
  source: string;
  status: HrEmployeeRecordEntity["employmentStatus"];
}): HrEmployeeStatusHistoryRecordModel =>
  hrEmployeeStatusHistoryRecordSchema.parse({
    id: randomUUID(),
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    status: input.status,
    previousStatus: input.previousStatus,
    effectiveAt: input.effectiveAt,
    source: input.source.trim(),
    reason: normalizeStatusReason(input.reason),
    actorId: normalizeNullableText(input.actorId),
    createdAt: input.effectiveAt,
    updatedAt: input.effectiveAt,
  });

const buildLegacyStatusHistoryRecord = (
  record: HrEmployeeRecordEntity
): HrEmployeeStatusHistoryRecordModel =>
  buildStatusHistoryRecord({
    actorId: undefined,
    employeeId: record.id,
    effectiveAt: record.createdAt,
    organizationId: record.organizationId,
    previousStatus: null,
    reason: undefined,
    source: "legacy",
    status: record.employmentStatus,
  });

const buildAssignmentHistoryRecord = (input: {
  actorId?: string | null;
  currentDepartmentId?: string | null;
  currentPositionId?: string | null;
  employeeId: string;
  effectiveFrom: Date;
  organizationId: string | null;
  reason?: string | null;
  source: string;
  workLocationCode?: string | null;
  managerEmployeeId?: string | null;
}): HrEmployeeAssignmentRecordModel =>
  hrEmployeeAssignmentRecordSchema.parse({
    id: randomUUID(),
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    departmentId: input.currentDepartmentId ?? null,
    positionId: input.currentPositionId ?? null,
    workLocationCode: normalizeNullableText(input.workLocationCode),
    managerEmployeeId: input.managerEmployeeId ?? null,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: null,
    source: input.source.trim(),
    reason: normalizeNullableText(input.reason),
    actorId: normalizeNullableText(input.actorId),
    createdAt: input.effectiveFrom,
    updatedAt: input.effectiveFrom,
  });

const buildAuditTrailRecord = (input: {
  action: (typeof hrRecordsActionRegistry)[keyof typeof hrRecordsActionRegistry]["auditEvent"];
  actorId?: string | null;
  employeeId: string;
  organizationId: string | null;
  reason?: string | null;
  occurredAt: Date;
}): HrEmployeeRecordAuditRecordModel =>
  buildHrEmployeeRecordAuditRecord({
    action: input.action,
    actorId: input.actorId,
    employeeId: input.employeeId,
    organizationId: input.organizationId,
    reason: input.reason,
    occurredAt: input.occurredAt,
  });

const buildLegacyAssignmentHistoryRecord = (
  record: HrEmployeeRecordEntity
): HrEmployeeAssignmentRecordModel =>
  buildAssignmentHistoryRecord({
    actorId: undefined,
    currentDepartmentId: record.currentDepartmentId,
    currentPositionId: record.currentPositionId,
    employeeId: record.id,
    effectiveFrom: record.createdAt,
    organizationId: record.organizationId,
    reason: undefined,
    source: "legacy",
    workLocationCode: record.workLocationCode,
    managerEmployeeId: record.managerEmployeeId,
  });

const cloneState = (
  state: HrEmployeeRecordsRepositoryState
): HrEmployeeRecordsRepositoryState => structuredClone(state);

const serializeState = (state: HrEmployeeRecordsRepositoryState): string =>
  JSON.stringify(state, (_key, value) =>
    value instanceof Date ? value.toISOString() : value
  );

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(runtimeState.repositoryFilePath), { recursive: true });
};

const readRepositoryStateFromDisk = (): HrEmployeeRecordsRepositoryState => {
  if (!existsSync(runtimeState.repositoryFilePath)) {
    return emptyState();
  }

  const content = readFileSync(runtimeState.repositoryFilePath, "utf8");
  const parsed = JSON.parse(content) as unknown;
  return hrEmployeeRecordsRepositoryStateSchema.parse(parsed);
};

const persistRepositoryState = (
  state: HrEmployeeRecordsRepositoryState
): void => {
  ensureRepositoryDirectory();
  const temporaryPath = `${runtimeState.repositoryFilePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, serializeState(state), "utf8");
  renameSync(temporaryPath, runtimeState.repositoryFilePath);
};

const loadRepositoryState = (): HrEmployeeRecordsRepositoryState => {
  if (runtimeState.cache === null) {
    runtimeState.cache = readRepositoryStateFromDisk();
  }

  return cloneState(runtimeState.cache);
};

const saveRepositoryState = (state: HrEmployeeRecordsRepositoryState): void => {
  runtimeState.cache = cloneState(state);
  persistRepositoryState(runtimeState.cache);
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
  const {
    assignmentHistory: _assignmentHistory,
    auditTrail: _auditTrail,
    organizationId: _organizationId,
    statusHistory: _statusHistory,
    ...detail
  } = record;
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
  timestamp?: Date;
}): HrEmployeeRecordEntity => {
  const now = input.timestamp ?? new Date();

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
    matrixManagerEmployeeId: normalizeNullableText(
      input.matrixManagerEmployeeId
    ),
    hrOwnerEmployeeId: normalizeNullableText(input.hrOwnerEmployeeId),
    assignmentHistory: [],
    auditTrail: [],
    statusHistory: [],
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
  runtimeState.repositoryFilePath;

export const setHrEmployeeRecordsRepositoryPathForTesting = (
  nextPath: string
): void => {
  runtimeState.repositoryFilePath = resolve(
    /* turbopackIgnore: true */ nextPath
  );
  runtimeState.cache = null;
};

export const resetHrEmployeeRecordsRepositoryForTesting = (): void => {
  runtimeState.cache = emptyState();
  persistRepositoryState(runtimeState.cache);
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
  const now = new Date();
  const initialAssignmentHistory =
    input.currentDepartmentId !== undefined ||
    input.currentPositionId !== undefined ||
    input.managerEmployeeId !== undefined ||
    input.workLocationCode !== undefined
      ? [
          buildAssignmentHistoryRecord({
            actorId: context?.userId,
            currentDepartmentId: normalizeNullableText(
              input.currentDepartmentId
            ),
            currentPositionId: normalizeNullableText(input.currentPositionId),
            employeeId: createdRecordId,
            effectiveFrom: now,
            organizationId: normalizeOrganizationId(context?.organizationId),
            reason: "Initial assignment",
            source: "create",
            workLocationCode: normalizeText(input.workLocationCode),
            managerEmployeeId: normalizeNullableText(input.managerEmployeeId),
          }),
        ]
      : [];
  const initialStatusHistory = [
    buildStatusHistoryRecord({
      actorId: context?.userId,
      employeeId: createdRecordId,
      effectiveAt: now,
      organizationId: normalizeOrganizationId(context?.organizationId),
      previousStatus: null,
      reason: "Initial status",
      source: "create",
      status: "draft",
    }),
  ];
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
    timestamp: now,
  });
  nextRecord.assignmentHistory = initialAssignmentHistory;
  nextRecord.statusHistory = initialStatusHistory;
  nextRecord.auditTrail = [
    buildAuditTrailRecord({
      action: hrRecordsActionRegistry.create.auditEvent,
      actorId: context?.userId,
      employeeId: createdRecordId,
      organizationId: normalizeOrganizationId(context?.organizationId),
      reason: "Initial create",
      occurredAt: now,
    }),
  ];

  mutateRepositoryState((draft) => {
    assertScopedEmployeeReferenceExists(
      draft.records,
      nextRecord.managerEmployeeId,
      context,
      nextRecord.id,
      "Manager"
    );
    assertScopedEmployeeReferenceExists(
      draft.records,
      nextRecord.matrixManagerEmployeeId,
      context,
      nextRecord.id,
      "Matrix manager"
    );
    assertScopedEmployeeReferenceExists(
      draft.records,
      nextRecord.hrOwnerEmployeeId,
      context,
      nextRecord.id,
      "HR owner"
    );
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
    if (
      current.employmentStatus === "archived" ||
      current.employmentStatus === "separated"
    ) {
      throw new Error("Archived employee records are read-only");
    }
    const now = new Date();
    assertScopedEmployeeReferenceExists(
      draft.records,
      input.matrixManagerEmployeeId,
      context,
      current.id,
      "Matrix manager"
    );
    assertScopedEmployeeReferenceExists(
      draft.records,
      input.hrOwnerEmployeeId,
      context,
      current.id,
      "HR owner"
    );
    const nextPreferredName = updateNullableTextField(
      current.preferredName,
      input.preferredName
    );
    const nextEmploymentStatus =
      input.employmentStatus ?? current.employmentStatus;
    const nextStatusHistory =
      input.employmentStatus === undefined ||
      input.employmentStatus === current.employmentStatus
        ? current.statusHistory
        : [
            ...(current.statusHistory.length > 0
              ? current.statusHistory
              : [buildLegacyStatusHistoryRecord(current)]),
            buildStatusHistoryRecord({
              actorId: context?.userId,
              employeeId: current.id,
              effectiveAt: new Date(),
              organizationId: current.organizationId,
              previousStatus: current.employmentStatus,
              reason: input.reason,
              source: "update",
              status: nextEmploymentStatus,
            }),
          ];

    assertEmploymentStatusTransition(
      current.employmentStatus,
      nextEmploymentStatus
    );

    updatedRecord = {
      ...current,
      employeeNumber: updateTextField(
        current.employeeNumber,
        input.employeeNumber
      ),
      displayName: buildDisplayName({
        legalName: updateTextField(current.legalName, input.legalName),
        preferredName: nextPreferredName ?? undefined,
      }),
      employmentStatus: nextEmploymentStatus,
      legalName: updateTextField(current.legalName, input.legalName),
      preferredName: nextPreferredName,
      employmentStartDate: updateDateField(
        current.employmentStartDate,
        input.employmentStartDate
      ),
      employmentType: updateTextField(
        current.employmentType,
        input.employmentType
      ),
      workerCategory: updateTextField(
        current.workerCategory,
        input.workerCategory
      ),
      grade: updateTextField(current.grade, input.grade),
      level: updateTextField(current.level, input.level),
      legalEntityCode: updateTextField(
        current.legalEntityCode,
        input.legalEntityCode
      ),
      workLocationCode: updateTextField(
        current.workLocationCode,
        input.workLocationCode
      ),
      countryCode: updateTextField(current.countryCode, input.countryCode),
      contractStartDate: updateDateField(
        current.contractStartDate,
        input.contractStartDate
      ),
      contractEndDate: updateDateField(
        current.contractEndDate,
        input.contractEndDate
      ),
      matrixManagerEmployeeId: updateNullableTextField(
        current.matrixManagerEmployeeId,
        input.matrixManagerEmployeeId
      ),
      hrOwnerEmployeeId: updateNullableTextField(
        current.hrOwnerEmployeeId,
        input.hrOwnerEmployeeId
      ),
      email: updateTextField(current.email, input.email),
      identityDocumentType: updateTextField(
        current.identityDocumentType,
        input.identityDocumentType
      ),
      identityNumber: updateTextField(
        current.identityNumber,
        input.identityNumber
      ),
      nationality: updateTextField(current.nationality, input.nationality),
      dateOfBirth: updateDateField(current.dateOfBirth, input.dateOfBirth),
      phoneNumber: updateTextField(current.phoneNumber, input.phoneNumber),
      personalEmail: updateTextField(
        current.personalEmail,
        input.personalEmail
      ),
      gender: updateTextField(current.gender, input.gender),
      maritalStatus: updateTextField(
        current.maritalStatus,
        input.maritalStatus
      ),
      languagePreference: updateTextField(
        current.languagePreference,
        input.languagePreference
      ),
      residentialAddress: updateTextField(
        current.residentialAddress,
        input.residentialAddress
      ),
      mailingAddress: updateTextField(
        current.mailingAddress,
        input.mailingAddress
      ),
      emergencyContactName: updateTextField(
        current.emergencyContactName,
        input.emergencyContactName
      ),
      emergencyContactRelationship: updateTextField(
        current.emergencyContactRelationship,
        input.emergencyContactRelationship
      ),
      emergencyContactPhoneNumber: updateTextField(
        current.emergencyContactPhoneNumber,
        input.emergencyContactPhoneNumber
      ),
      auditTrail: [
        ...current.auditTrail,
        buildAuditTrailRecord({
          action: hrRecordsActionRegistry.update.auditEvent,
          actorId: context?.userId,
          employeeId: current.id,
          organizationId: current.organizationId,
          reason: normalizeStatusReason(input.reason),
          occurredAt: now,
        }),
      ],
      statusHistory: nextStatusHistory,
      updatedAt: now,
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
    const now = new Date();
    if (current.employmentStatus === "archived") {
      archivedRecord = current;
      return;
    }

    assertEmploymentStatusTransition(current.employmentStatus, "archived");
    const currentStatusHistory =
      current.statusHistory.length > 0
        ? [...current.statusHistory]
        : [buildLegacyStatusHistoryRecord(current)];
    archivedRecord = {
      ...current,
      employmentStatus: hrRecordsEmploymentStatusSchema.parse("archived"),
      auditTrail: [
        ...current.auditTrail,
        buildHrEmployeeRecordArchiveAuditRecord({
          action: hrRecordsActionRegistry.archive.auditEvent,
          actorId: context?.userId,
          employeeId: current.id,
          organizationId: current.organizationId,
          reason: input.reason,
          occurredAt: now,
        }),
      ],
      statusHistory: [
        ...currentStatusHistory,
        buildStatusHistoryRecord({
          actorId: context?.userId,
          employeeId: current.id,
          effectiveAt: now,
          organizationId: current.organizationId,
          previousStatus: current.employmentStatus,
          reason: input.reason,
          source: "archive",
          status: "archived",
        }),
      ],
      updatedAt: now,
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
    if (
      current.employmentStatus === "archived" ||
      current.employmentStatus === "separated"
    ) {
      throw new Error("Archived employee records are read-only");
    }
    const now = new Date();
    assertScopedEmployeeReferenceExists(
      draft.records,
      input.managerEmployeeId,
      context,
      current.id,
      "Manager"
    );
    const currentAssignmentHistory =
      current.assignmentHistory.length > 0
        ? [...current.assignmentHistory]
        : [buildLegacyAssignmentHistoryRecord(current)];
    const nextCurrentDepartmentId =
      input.currentDepartmentId === undefined
        ? current.currentDepartmentId
        : normalizeNullableText(input.currentDepartmentId);
    const nextCurrentPositionId =
      input.currentPositionId === undefined
        ? current.currentPositionId
        : normalizeNullableText(input.currentPositionId);
    const nextManagerEmployeeId =
      input.managerEmployeeId === undefined
        ? current.managerEmployeeId
        : normalizeNullableText(input.managerEmployeeId);
    const nextWorkLocationCode =
      input.workLocationCode === undefined
        ? current.workLocationCode
        : updateTextField(current.workLocationCode, input.workLocationCode);
    const assignmentEffectiveFrom = input.assignmentEffectiveFrom ?? new Date();
    const nextAssignmentHistory = [
      ...closeCurrentAssignmentHistoryRecord(
        currentAssignmentHistory,
        assignmentEffectiveFrom
      ),
      buildAssignmentHistoryRecord({
        actorId: context?.userId,
        currentDepartmentId: nextCurrentDepartmentId,
        currentPositionId: nextCurrentPositionId,
        employeeId: current.id,
        effectiveFrom: assignmentEffectiveFrom,
        organizationId: current.organizationId,
        reason: normalizeAssignmentReason(input.assignmentReason, input.reason),
        source: "assignment",
        workLocationCode: nextWorkLocationCode,
        managerEmployeeId: nextManagerEmployeeId,
      }),
    ].sort(compareAssignmentHistoryRecords);

    assignedRecord = {
      ...current,
      departmentName: nextCurrentDepartmentId,
      positionTitle: nextCurrentPositionId,
      currentDepartmentId: nextCurrentDepartmentId,
      currentPositionId: nextCurrentPositionId,
      managerEmployeeId: nextManagerEmployeeId,
      workLocationCode: nextWorkLocationCode,
      assignmentHistory: nextAssignmentHistory,
      auditTrail: [
        ...current.auditTrail,
        buildAuditTrailRecord({
          action: hrRecordsActionRegistry.assignment.auditEvent,
          actorId: context?.userId,
          employeeId: current.id,
          organizationId: current.organizationId,
          reason: normalizeAssignmentReason(
            input.assignmentReason,
            input.reason
          ),
          occurredAt: now,
        }),
      ],
      updatedAt: now,
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
): HrEmployeeRecordDetail | null {
  let rehiredRecord: HrEmployeeRecordEntity | null = null;

  mutateRepositoryState((draft) => {
    const index = findScopedRecordIndex(
      draft.records,
      input.priorEmployeeId,
      context
    );
    if (index < 0) {
      return;
    }

    const current = draft.records[index];
    if (
      current.employmentStatus !== "archived" &&
      current.employmentStatus !== "separated"
    ) {
      throw new Error(
        "Rehire requires an archived or separated employee record"
      );
    }

    const currentStatusHistory =
      current.statusHistory.length > 0
        ? [...current.statusHistory]
        : [buildLegacyStatusHistoryRecord(current)];
    const now = new Date();

    rehiredRecord = {
      ...current,
      employeeNumber: updateTextField(
        current.employeeNumber,
        input.employeeNumber
      ),
      legalName: updateTextField(current.legalName, input.legalName),
      preferredName: updateNullableTextField(
        current.preferredName,
        input.preferredName
      ),
      displayName: buildDisplayName({
        legalName: updateTextField(current.legalName, input.legalName),
        preferredName:
          updateNullableTextField(current.preferredName, input.preferredName) ??
          undefined,
      }),
      employmentStartDate: input.employmentStartDate ?? now,
      email: updateTextField(current.email, input.email),
      employmentStatus: "active",
      statusHistory: [
        ...currentStatusHistory,
        buildStatusHistoryRecord({
          actorId: context?.userId,
          employeeId: current.id,
          effectiveAt: now,
          organizationId: current.organizationId,
          previousStatus: current.employmentStatus,
          reason: normalizeStatusReason(input.reason),
          source: "rehire",
          status: "active",
        }),
      ],
      auditTrail: [
        ...current.auditTrail,
        buildAuditTrailRecord({
          action: hrRecordsActionRegistry.rehire.auditEvent,
          actorId: context?.userId,
          employeeId: current.id,
          organizationId: current.organizationId,
          reason: normalizeStatusReason(input.reason),
          occurredAt: now,
        }),
      ],
      updatedAt: now,
    };

    const nextRecords = [...draft.records];
    nextRecords[index] = rehiredRecord;
    draft.records = nextRecords;
  });

  return rehiredRecord ? toDetail(rehiredRecord) : null;
}

export function listHrEmployeeAssignmentsRepository(
  context?: HrEmployeeRecordsRepositoryContext
): readonly HrEmployeeAssignmentRecordModel[] {
  if (context?.canRead === false) {
    return [];
  }

  return loadRepositoryState()
    .records.filter((record) => matchesScope(record, context))
    .flatMap((record) =>
      record.assignmentHistory.length > 0
        ? record.assignmentHistory
        : [buildLegacyAssignmentHistoryRecord(record)]
    );
}

export function listHrEmployeeStatusHistoryRepository(
  context?: HrEmployeeRecordsRepositoryContext
): readonly HrEmployeeStatusHistoryRecordModel[] {
  if (context?.canRead === false) {
    return [];
  }

  return loadRepositoryState()
    .records.filter((record) => matchesScope(record, context))
    .flatMap((record) =>
      record.statusHistory.length > 0
        ? record.statusHistory
        : [buildLegacyStatusHistoryRecord(record)]
    );
}
