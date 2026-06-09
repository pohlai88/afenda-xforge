import "server-only";

import type {
  ComplianceAlertState,
  ComplianceAuditEvent,
  ComplianceCorrectiveAction,
  ComplianceEvidenceArtifact,
  ComplianceException,
  ComplianceFilingRecord,
  ComplianceObligation,
  ComplianceWorkerProfile,
} from "../contracts/index.ts";
import { complianceEvidenceSensitiveFields } from "../contracts/index.ts";
import {
  canReadCompliance,
  canReadComplianceSensitiveData,
} from "../policy.ts";
import { loadComplianceRepository } from "../repository.ts";
import type { ComplianceReadContext } from "../schema.ts";

export const DEFAULT_PAGE_SIZE = 25;

export const normalizeSearchTerm = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

export const normalizePage = (value: number | undefined): number =>
  Number.isFinite(value) && value && value > 0 ? Math.floor(value) : 1;

export const normalizePageSize = (value: number | undefined): number =>
  Number.isFinite(value) && value && value > 0
    ? Math.min(Math.floor(value), 500)
    : DEFAULT_PAGE_SIZE;

export const paginate = <T>(
  items: readonly T[],
  page?: number,
  pageSize?: number
): T[] => {
  const normalizedPage = normalizePage(page);
  const normalizedPageSize = normalizePageSize(pageSize);
  const startIndex = (normalizedPage - 1) * normalizedPageSize;
  return items.slice(startIndex, startIndex + normalizedPageSize);
};

export const matchesSearch = (
  haystacks: readonly (string | null | undefined)[],
  term: string
): boolean =>
  term.length === 0
    ? true
    : haystacks.some((value) => value?.toLowerCase().includes(term));

export const readContext = (
  context?: ComplianceReadContext
): {
  canRead: boolean;
  canViewSensitive: boolean;
  companyId?: string;
  tenantId?: string;
} => ({
  canRead: canReadCompliance(context ?? {}),
  canViewSensitive: canReadComplianceSensitiveData(context ?? {}),
  companyId: context?.companyId,
  tenantId:
    "tenantId" in (context ?? {})
      ? (context as { tenantId?: string }).tenantId
      : undefined,
});

export const filterByCompany = <
  T extends { companyId?: string | null | undefined },
>(
  items: readonly T[],
  companyId?: string
): T[] =>
  companyId
    ? items.filter((entry) => entry.companyId === companyId)
    : [...items];

export const maskEvidenceForRead = (
  evidence: readonly ComplianceEvidenceArtifact[],
  canViewSensitive: boolean
): readonly ComplianceEvidenceArtifact[] =>
  evidence.map((entry) =>
    canViewSensitive
      ? entry
      : {
          ...entry,
          [complianceEvidenceSensitiveFields[0]]: null,
          [complianceEvidenceSensitiveFields[1]]: null,
        }
  );

export const loadComplianceScopedSnapshot = async (
  context?: ComplianceReadContext
): Promise<ScopedComplianceSnapshot> => {
  const ctx = readContext(context);
  const snapshot = await loadComplianceRepository(ctx);

  if (!ctx.canRead) {
    return {
      ctx,
      snapshot,
      alertStates: [],
      obligations: [],
      workerProfiles: [],
      evidence: [],
      exceptions: [],
      correctiveActions: [],
      filings: [],
      auditEvents: [],
    };
  }

  return {
    ctx,
    snapshot,
    alertStates: filterByCompany(snapshot.alertStates, ctx.companyId),
    obligations: filterByCompany(snapshot.obligations, ctx.companyId),
    workerProfiles: filterByCompany(snapshot.workerProfiles, ctx.companyId),
    evidence: filterByCompany(snapshot.evidence, ctx.companyId),
    exceptions: filterByCompany(snapshot.exceptions, ctx.companyId),
    correctiveActions: filterByCompany(
      snapshot.correctiveActions,
      ctx.companyId
    ) as ComplianceCorrectiveAction[],
    filings: filterByCompany(snapshot.filings, ctx.companyId),
    auditEvents: filterByCompany(snapshot.auditEvents, ctx.companyId),
  };
};

export type ScopedComplianceSnapshot = {
  ctx: {
    canRead: boolean;
    canViewSensitive: boolean;
    companyId?: string;
    tenantId?: string;
  };
  snapshot: Awaited<ReturnType<typeof loadComplianceRepository>>;
  alertStates: ComplianceAlertState[];
  obligations: ComplianceObligation[];
  workerProfiles: ComplianceWorkerProfile[];
  evidence: ComplianceEvidenceArtifact[];
  exceptions: ComplianceException[];
  correctiveActions: ComplianceCorrectiveAction[];
  filings: ComplianceFilingRecord[];
  auditEvents: ComplianceAuditEvent[];
};
