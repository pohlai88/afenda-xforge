import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type {
  EmployeeSelfservicePortalProfileUpdateRequest,
  EmployeeSelfservicePortalRecord,
} from "./schema.ts";
import {
  employeeSelfservicePortalProfileUpdateRequestSchema,
  employeeSelfservicePortalRecordSchema,
} from "./schema.ts";

type EmployeeSelfservicePortalRepositorySnapshot = {
  profileUpdateRequests: EmployeeSelfservicePortalProfileUpdateRequest[];
  records: EmployeeSelfservicePortalRecord[];
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

    const profileUpdateRequests = Array.isArray(parsedRequests)
      ? parsedRequests.map((request) =>
          employeeSelfservicePortalProfileUpdateRequestSchema.parse(request)
        )
      : [];

    return { profileUpdateRequests, records };
  },
};

let repositoryPath = resolve(
  tmpdir(),
  "afenda-employee-selfservice-portal-repository.json"
);
let repositoryCache: EmployeeSelfservicePortalRepositorySnapshot | null = null;

function cloneSnapshot(
  snapshot: EmployeeSelfservicePortalRepositorySnapshot
): EmployeeSelfservicePortalRepositorySnapshot {
  return {
    profileUpdateRequests: snapshot.profileUpdateRequests.map((request) => ({
      ...request,
      requestedChanges: { ...request.requestedChanges },
    })),
    records: snapshot.records.map((record) => ({ ...record })),
  };
}

function loadSnapshot(): EmployeeSelfservicePortalRepositorySnapshot {
  if (repositoryCache) {
    return cloneSnapshot(repositoryCache);
  }

  if (!existsSync(repositoryPath)) {
    repositoryCache = { profileUpdateRequests: [], records: [] };
    return cloneSnapshot(repositoryCache);
  }

  const fileContents = readFileSync(repositoryPath, "utf8");
  const parsedContents = JSON.parse(fileContents) as unknown;
  repositoryCache =
    employeeSelfservicePortalRepositorySnapshotSchema.parse(parsedContents);

  return cloneSnapshot(repositoryCache);
}

function saveSnapshot(
  snapshot: EmployeeSelfservicePortalRepositorySnapshot
): EmployeeSelfservicePortalRepositorySnapshot {
  repositoryCache = cloneSnapshot(snapshot);
  writeFileSync(repositoryPath, JSON.stringify(repositoryCache, null, 2));
  return cloneSnapshot(repositoryCache);
}

export function listEmployeeSelfservicePortalRepositoryRecords(): readonly EmployeeSelfservicePortalRecord[] {
  return loadSnapshot().records;
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
  repositoryPath = nextRepositoryPath;
  repositoryCache = null;
}

export function resetEmployeeSelfservicePortalRepositoryForTesting(): void {
  repositoryCache = null;
}
