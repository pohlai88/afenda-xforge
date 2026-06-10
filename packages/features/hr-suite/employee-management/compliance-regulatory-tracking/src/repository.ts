import "server-only";

import { createRequire } from "node:module";

export type {
  ComplianceRepositoryScope,
  ComplianceRepositoryState,
} from "./repository.file.ts";

type ComplianceRepositoryModule = typeof import("./repository.file.ts");

const nodeRequire = createRequire(import.meta.url);

const loadRepositoryModule = (): ComplianceRepositoryModule =>
  nodeRequire("./repository.file.ts") as ComplianceRepositoryModule;

export const createComplianceRecordId: ComplianceRepositoryModule["createComplianceRecordId"] =
  (...args) => loadRepositoryModule().createComplianceRecordId(...args);
export const getComplianceRepositoryPath: ComplianceRepositoryModule["getComplianceRepositoryPath"] =
  (...args) => loadRepositoryModule().getComplianceRepositoryPath(...args);
export const loadComplianceRepository: ComplianceRepositoryModule["loadComplianceRepository"] =
  (...args) => loadRepositoryModule().loadComplianceRepository(...args);
export const mutateComplianceRepository: ComplianceRepositoryModule["mutateComplianceRepository"] =
  (...args) => loadRepositoryModule().mutateComplianceRepository(...args);
export const saveComplianceRepository: ComplianceRepositoryModule["saveComplianceRepository"] =
  (...args) => loadRepositoryModule().saveComplianceRepository(...args);
export {
  resetComplianceRepositoryForTesting,
  setComplianceRepositoryPathForTesting,
} from "./repository.testing.ts";
