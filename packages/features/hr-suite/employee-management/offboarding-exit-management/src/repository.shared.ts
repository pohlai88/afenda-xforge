import "server-only";

import { randomUUID } from "node:crypto";
import type {
  OffboardingAuditEvent,
  OffboardingCaseRecord,
  OffboardingRepositoryState,
} from "./contracts/index.ts";

export type OffboardingRepositoryScope = Readonly<{
  companyId?: string | null;
  tenantId?: string | null;
}>;

export const emptyState = (): OffboardingRepositoryState => ({
  cases: [],
  approvals: [],
  auditEvents: [],
});

export const cloneState = (
  state: OffboardingRepositoryState
): OffboardingRepositoryState => structuredClone(state);

const getRepositoryMode = (): "database" | "file" => {
  if (
    process.env.AFENDA_OFFBOARDING_EXIT_MANAGEMENT_REPOSITORY_MODE === "file"
  ) {
    return "file";
  }

  return process.env.DATABASE_URL ? "database" : "file";
};

export const shouldUseDatabaseRepository = (
  scope?: OffboardingRepositoryScope
): boolean => getRepositoryMode() === "database" && Boolean(scope?.tenantId);

export const assertNoDuplicateOpenCases = (
  state: OffboardingRepositoryState
): void => {
  const seenOpenCases = new Set<string>();

  for (const record of state.cases) {
    if (record.status !== "open") {
      continue;
    }

    const identity = `${record.tenantId}::${record.companyId ?? ""}::${record.employeeId}`;
    if (seenOpenCases.has(identity)) {
      throw new Error(
        `Employee ${record.employeeId} already has an open offboarding case.`
      );
    }

    seenOpenCases.add(identity);
  }
};

export const matchesScope = (
  record: Pick<
    OffboardingAuditEvent | OffboardingCaseRecord,
    "companyId" | "tenantId"
  >,
  scope?: OffboardingRepositoryScope
): boolean => {
  if (scope?.tenantId !== undefined && record.tenantId !== scope.tenantId) {
    return false;
  }

  if (scope?.companyId !== undefined && record.companyId !== scope.companyId) {
    return false;
  }

  return true;
};

export const createOffboardingRepositoryId = (): string => randomUUID();
