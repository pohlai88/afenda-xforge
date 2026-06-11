import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type { Audit7W1HEvent } from "../../../../../audit/index.ts";
import { audit7w1hEventSchema } from "../../../../../audit/index.ts";
import type {
  EmployeeSelfservicePortalProfileUpdateRequest,
  EmployeeSelfservicePortalRecord,
} from "./schema.ts";
import {
  employeeSelfservicePortalProfileUpdateRequestSchema,
  employeeSelfservicePortalRecordSchema,
} from "./schema.ts";

export type EmployeeSelfservicePortalRepositorySnapshot = {
  auditEvents: Audit7W1HEvent[];
  profileUpdateRequests: EmployeeSelfservicePortalProfileUpdateRequest[];
  records: EmployeeSelfservicePortalRecord[];
};

type EmployeeSelfservicePortalRepositoryRuntimeState = {
  repositoryCache: EmployeeSelfservicePortalRepositorySnapshot | null;
  repositoryPath: string;
};

const employeeSelfservicePortalRepositoryStateKey = Symbol.for(
  "afenda.employee-selfservice-portal.repository-state"
);

const globalEmployeeSelfservicePortalState = globalThis as typeof globalThis & {
  [employeeSelfservicePortalRepositoryStateKey]?: EmployeeSelfservicePortalRepositoryRuntimeState;
};

globalEmployeeSelfservicePortalState[
  employeeSelfservicePortalRepositoryStateKey
] ??= {
  repositoryCache: null,
  repositoryPath: resolve(
    /* turbopackIgnore: true */ tmpdir(),
    "afenda-employee-selfservice-portal-repository.json"
  ),
};
const runtimeState =
  globalEmployeeSelfservicePortalState[
    employeeSelfservicePortalRepositoryStateKey
  ];

const reviveAuditEventDates = (value: unknown): unknown => {
  if (!value || typeof value !== "object") {
    return value;
  }

  const auditEvent = value as {
    createdAt?: unknown;
    occurredAt?: unknown;
  };

  return {
    ...auditEvent,
    createdAt:
      typeof auditEvent.createdAt === "string"
        ? new Date(auditEvent.createdAt)
        : auditEvent.createdAt,
    occurredAt:
      typeof auditEvent.occurredAt === "string"
        ? new Date(auditEvent.occurredAt)
        : auditEvent.occurredAt,
  };
};

const employeeSelfservicePortalRepositorySnapshotSchema = {
  parse(value: unknown): EmployeeSelfservicePortalRepositorySnapshot {
    const parsedValue =
      value && typeof value === "object" && "records" in value
        ? (value as { records?: unknown }).records
        : [];

    const records = Array.isArray(parsedValue)
      ? parsedValue.map((record) =>
          employeeSelfservicePortalRecordSchema.parse(record)
        )
      : [];

    const parsedRequests =
      value && typeof value === "object" && "profileUpdateRequests" in value
        ? (value as { profileUpdateRequests?: unknown }).profileUpdateRequests
        : [];
    const parsedAuditEvents =
      value && typeof value === "object" && "auditEvents" in value
        ? (value as { auditEvents?: unknown }).auditEvents
        : [];

    const profileUpdateRequests = Array.isArray(parsedRequests)
      ? parsedRequests.map((request) =>
          employeeSelfservicePortalProfileUpdateRequestSchema.parse(request)
        )
      : [];
    const auditEvents = Array.isArray(parsedAuditEvents)
      ? parsedAuditEvents.map((event) =>
          audit7w1hEventSchema.parse(reviveAuditEventDates(event))
        )
      : [];

    return { auditEvents, profileUpdateRequests, records };
  },
};

function cloneSnapshot(
  snapshot: EmployeeSelfservicePortalRepositorySnapshot
): EmployeeSelfservicePortalRepositorySnapshot {
  return {
    auditEvents: snapshot.auditEvents.map((event) => ({
      ...event,
      after: { ...event.after },
      before: { ...event.before },
      createdAt: new Date(event.createdAt),
      occurredAt: new Date(event.occurredAt),
    })),
    profileUpdateRequests: snapshot.profileUpdateRequests.map((request) => ({
      ...request,
      requestedChanges: { ...request.requestedChanges },
    })),
    records: snapshot.records.map((record) => ({ ...record })),
  };
}

function loadSnapshot(): EmployeeSelfservicePortalRepositorySnapshot {
  if (runtimeState.repositoryCache) {
    return cloneSnapshot(runtimeState.repositoryCache);
  }

  if (!existsSync(runtimeState.repositoryPath)) {
    runtimeState.repositoryCache = {
      auditEvents: [],
      profileUpdateRequests: [],
      records: [],
    };
    return cloneSnapshot(runtimeState.repositoryCache);
  }

  const fileContents = readFileSync(runtimeState.repositoryPath, "utf8");
  const parsedContents = JSON.parse(fileContents) as unknown;
  runtimeState.repositoryCache =
    employeeSelfservicePortalRepositorySnapshotSchema.parse(parsedContents);

  return cloneSnapshot(runtimeState.repositoryCache);
}

function saveSnapshot(
  snapshot: EmployeeSelfservicePortalRepositorySnapshot
): EmployeeSelfservicePortalRepositorySnapshot {
  runtimeState.repositoryCache = cloneSnapshot(snapshot);
  writeFileSync(
    runtimeState.repositoryPath,
    JSON.stringify(runtimeState.repositoryCache, null, 2)
  );
  return cloneSnapshot(runtimeState.repositoryCache);
}

export function listEmployeeSelfservicePortalRepositoryRecords(): readonly EmployeeSelfservicePortalRecord[] {
  return loadSnapshot().records;
}

export function listEmployeeSelfservicePortalRepositoryAuditEvents(): readonly Audit7W1HEvent[] {
  return loadSnapshot().auditEvents;
}

export function getEmployeeSelfservicePortalRepositoryRecordById(
  id: string
): EmployeeSelfservicePortalRecord | null {
  return loadSnapshot().records.find((record) => record.id === id) ?? null;
}

export function getEmployeeSelfservicePortalRepositoryRecordByEmployeeId(
  employeeId: string,
  scope?: {
    companyId?: string;
    tenantId?: string;
  }
): EmployeeSelfservicePortalRecord | null {
  return (
    loadSnapshot().records.find((record) => {
      if (record.employeeId !== employeeId) {
        return false;
      }

      if (scope?.tenantId && record.tenantId !== scope.tenantId) {
        return false;
      }

      if (scope?.companyId && record.companyId !== scope.companyId) {
        return false;
      }

      return true;
    }) ?? null
  );
}

export function mutateEmployeeSelfservicePortalRepository(
  mutation: (
    snapshot: EmployeeSelfservicePortalRepositorySnapshot
  ) => EmployeeSelfservicePortalRepositorySnapshot
): EmployeeSelfservicePortalRepositorySnapshot {
  const currentSnapshot = loadSnapshot();
  const nextSnapshot = mutation(currentSnapshot);
  return saveSnapshot(nextSnapshot);
}

export function appendEmployeeSelfservicePortalAuditEvent(
  event: Audit7W1HEvent
): void {
  mutateEmployeeSelfservicePortalRepository((snapshot) => ({
    ...snapshot,
    auditEvents: [...snapshot.auditEvents, event],
  }));
}

export function createEmployeeSelfservicePortalRecordId(): string {
  return randomUUID();
}

export function createEmployeeSelfservicePortalProfileUpdateRequestId(): string {
  return randomUUID();
}

export function getEmployeeSelfservicePortalProfileUpdateRequestById(
  id: string
): EmployeeSelfservicePortalProfileUpdateRequest | null {
  return (
    loadSnapshot().profileUpdateRequests.find((request) => request.id === id) ??
    null
  );
}

export function listEmployeeSelfservicePortalProfileUpdateRequests(): readonly EmployeeSelfservicePortalProfileUpdateRequest[] {
  return loadSnapshot().profileUpdateRequests;
}

export function setEmployeeSelfservicePortalRepositoryPathForTesting(
  nextRepositoryPath: string
): void {
  runtimeState.repositoryPath = resolve(
    /* turbopackIgnore: true */ nextRepositoryPath
  );
  runtimeState.repositoryCache = null;
}

export function resetEmployeeSelfservicePortalRepositoryForTesting(): void {
  runtimeState.repositoryCache = null;
}
