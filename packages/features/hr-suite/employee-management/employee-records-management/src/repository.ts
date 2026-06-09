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
  email?: string;
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
    email: input.email,
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
    updatedRecord = {
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
    assignedRecord = {
      ...current,
      departmentName: input.currentDepartmentId ?? current.departmentName,
      positionTitle: input.currentPositionId ?? current.positionTitle,
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
    email: input.email,
    employmentStatus: "active",
  });

  mutateRepositoryState((draft) => {
    draft.records = [...draft.records, nextRecord];
  });

  return toDetail(nextRecord);
}
