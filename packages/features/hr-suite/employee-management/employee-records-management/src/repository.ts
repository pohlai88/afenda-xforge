import "server-only";

import { createRequire } from "node:module";

export type {
  HrEmployeeRecordsRepositoryContext,
  HrEmployeeRecordsRepositoryState,
} from "./repository.file.ts";

type HrEmployeeRecordsRepositoryModule = typeof import("./repository.file.ts");

const nodeRequire = createRequire(import.meta.url);

const loadRepositoryModule = (): HrEmployeeRecordsRepositoryModule =>
  nodeRequire("./repository.file.ts") as HrEmployeeRecordsRepositoryModule;

export const archiveHrEmployeeRecordRepository: HrEmployeeRecordsRepositoryModule["archiveHrEmployeeRecordRepository"] =
  (...args) =>
    loadRepositoryModule().archiveHrEmployeeRecordRepository(...args);
export const assignHrEmployeeRecordRepository: HrEmployeeRecordsRepositoryModule["assignHrEmployeeRecordRepository"] =
  (...args) => loadRepositoryModule().assignHrEmployeeRecordRepository(...args);
export const createHrEmployeeRecordRepository: HrEmployeeRecordsRepositoryModule["createHrEmployeeRecordRepository"] =
  (...args) => loadRepositoryModule().createHrEmployeeRecordRepository(...args);
export const getHrEmployeeRecordRepository: HrEmployeeRecordsRepositoryModule["getHrEmployeeRecordRepository"] =
  (...args) => loadRepositoryModule().getHrEmployeeRecordRepository(...args);
export const getHrEmployeeRecordsRepositoryPath: HrEmployeeRecordsRepositoryModule["getHrEmployeeRecordsRepositoryPath"] =
  (...args) =>
    loadRepositoryModule().getHrEmployeeRecordsRepositoryPath(...args);
export const listHrEmployeeAssignmentsRepository: HrEmployeeRecordsRepositoryModule["listHrEmployeeAssignmentsRepository"] =
  (...args) =>
    loadRepositoryModule().listHrEmployeeAssignmentsRepository(...args);
export const listHrEmployeeRecordsRepository: HrEmployeeRecordsRepositoryModule["listHrEmployeeRecordsRepository"] =
  (...args) => loadRepositoryModule().listHrEmployeeRecordsRepository(...args);
export const listHrEmployeeStatusHistoryRepository: HrEmployeeRecordsRepositoryModule["listHrEmployeeStatusHistoryRepository"] =
  (...args) =>
    loadRepositoryModule().listHrEmployeeStatusHistoryRepository(...args);
export const loadHrEmployeeRecordsRepository: HrEmployeeRecordsRepositoryModule["loadHrEmployeeRecordsRepository"] =
  (...args) => loadRepositoryModule().loadHrEmployeeRecordsRepository(...args);
export const mutateHrEmployeeRecordsRepository: HrEmployeeRecordsRepositoryModule["mutateHrEmployeeRecordsRepository"] =
  (...args) =>
    loadRepositoryModule().mutateHrEmployeeRecordsRepository(...args);
export const rehireHrEmployeeRecordRepository: HrEmployeeRecordsRepositoryModule["rehireHrEmployeeRecordRepository"] =
  (...args) => loadRepositoryModule().rehireHrEmployeeRecordRepository(...args);
export const saveHrEmployeeRecordsRepository: HrEmployeeRecordsRepositoryModule["saveHrEmployeeRecordsRepository"] =
  (...args) => loadRepositoryModule().saveHrEmployeeRecordsRepository(...args);
export const updateHrEmployeeRecordRepository: HrEmployeeRecordsRepositoryModule["updateHrEmployeeRecordRepository"] =
  (...args) => loadRepositoryModule().updateHrEmployeeRecordRepository(...args);
export {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "./repository.testing.ts";
