import "server-only";

import { createRequire } from "node:module";

export type { EmployeeSelfservicePortalRepositorySnapshot } from "./repository.file.ts";

type EmployeeSelfservicePortalRepositoryModule =
  typeof import("./repository.file.ts");

const nodeRequire = createRequire(import.meta.url);

const loadRepositoryModule =
  (): EmployeeSelfservicePortalRepositoryModule =>
    nodeRequire("./repository.file.ts") as EmployeeSelfservicePortalRepositoryModule;

export const appendEmployeeSelfservicePortalAuditEvent: EmployeeSelfservicePortalRepositoryModule["appendEmployeeSelfservicePortalAuditEvent"] =
  (...args) =>
    loadRepositoryModule().appendEmployeeSelfservicePortalAuditEvent(...args);
export const createEmployeeSelfservicePortalProfileUpdateRequestId: EmployeeSelfservicePortalRepositoryModule["createEmployeeSelfservicePortalProfileUpdateRequestId"] =
  (...args) =>
    loadRepositoryModule().createEmployeeSelfservicePortalProfileUpdateRequestId(
      ...args
    );
export const createEmployeeSelfservicePortalRecordId: EmployeeSelfservicePortalRepositoryModule["createEmployeeSelfservicePortalRecordId"] =
  (...args) =>
    loadRepositoryModule().createEmployeeSelfservicePortalRecordId(...args);
export const getEmployeeSelfservicePortalProfileUpdateRequestById: EmployeeSelfservicePortalRepositoryModule["getEmployeeSelfservicePortalProfileUpdateRequestById"] =
  (...args) =>
    loadRepositoryModule().getEmployeeSelfservicePortalProfileUpdateRequestById(
      ...args
    );
export const getEmployeeSelfservicePortalRepositoryRecordByEmployeeId: EmployeeSelfservicePortalRepositoryModule["getEmployeeSelfservicePortalRepositoryRecordByEmployeeId"] =
  (...args) =>
    loadRepositoryModule().getEmployeeSelfservicePortalRepositoryRecordByEmployeeId(
      ...args
    );
export const getEmployeeSelfservicePortalRepositoryRecordById: EmployeeSelfservicePortalRepositoryModule["getEmployeeSelfservicePortalRepositoryRecordById"] =
  (...args) =>
    loadRepositoryModule().getEmployeeSelfservicePortalRepositoryRecordById(
      ...args
    );
export const listEmployeeSelfservicePortalProfileUpdateRequests: EmployeeSelfservicePortalRepositoryModule["listEmployeeSelfservicePortalProfileUpdateRequests"] =
  (...args) =>
    loadRepositoryModule().listEmployeeSelfservicePortalProfileUpdateRequests(
      ...args
    );
export const listEmployeeSelfservicePortalRepositoryAuditEvents: EmployeeSelfservicePortalRepositoryModule["listEmployeeSelfservicePortalRepositoryAuditEvents"] =
  (...args) =>
    loadRepositoryModule().listEmployeeSelfservicePortalRepositoryAuditEvents(
      ...args
    );
export const listEmployeeSelfservicePortalRepositoryRecords: EmployeeSelfservicePortalRepositoryModule["listEmployeeSelfservicePortalRepositoryRecords"] =
  (...args) =>
    loadRepositoryModule().listEmployeeSelfservicePortalRepositoryRecords(
      ...args
    );
export const mutateEmployeeSelfservicePortalRepository: EmployeeSelfservicePortalRepositoryModule["mutateEmployeeSelfservicePortalRepository"] =
  (...args) =>
    loadRepositoryModule().mutateEmployeeSelfservicePortalRepository(...args);
export {
  resetEmployeeSelfservicePortalRepositoryForTesting,
  setEmployeeSelfservicePortalRepositoryPathForTesting,
} from "./repository.testing.ts";
