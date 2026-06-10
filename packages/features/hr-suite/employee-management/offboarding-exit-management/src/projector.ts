import type {
  OffboardingApprovalBlockerProjection,
  OffboardingApprovalProjection,
  OffboardingApprovalStepRecord,
  OffboardingAuditTrailProjection,
  OffboardingCaseProjection,
  OffboardingCaseRecord,
  OffboardingFoundationSnapshot,
} from "./contracts/index.ts";
import {
  offboardingApprovalBlockerProjectionSchema,
  offboardingApprovalProjectionSchema,
  offboardingAuditTrailProjectionSchema,
  offboardingCaseProjectionSchema,
  offboardingExitManagementPermissions,
  offboardingExitManagementRouteContracts,
  offboardingFoundationSnapshotSchema,
} from "./contracts/index.ts";
import { offboardingExitManagementFeatureScope } from "./feature-scope.ts";
import {
  offboardingExitManagementFeatureId,
  offboardingExitManagementFeatureLabel,
} from "./identity.ts";
import {
  canReadOffboardingExitManagement,
  canViewOffboardingExitManagementSensitiveData,
} from "./policy.ts";
import {
  offboardingExitManagementAcceptanceCoverage,
  offboardingExitManagementBoundedContext,
  offboardingExitManagementCapabilityCatalog,
  offboardingExitManagementCapabilityGroups,
  offboardingExitManagementRequirementCoverage,
} from "./registry/index.ts";
import type { OffboardingRepositoryScope } from "./repository.ts";
import { loadOffboardingRepository } from "./repository.ts";
import { resolveOffboardingNoticeStatus } from "./schema.ts";

const redactAuditEvent = (
  entry: OffboardingAuditTrailProjection,
  canViewSensitive: boolean
): OffboardingAuditTrailProjection =>
  offboardingAuditTrailProjectionSchema.parse({
    ...entry,
    actorId: canViewSensitive || !entry.sensitive ? entry.actorId : null,
    summary: canViewSensitive || !entry.sensitive ? entry.summary : null,
    reason: canViewSensitive || !entry.sensitive ? entry.reason : null,
    metadata: canViewSensitive || !entry.sensitive ? entry.metadata : {},
  });

const redactOffboardingCaseProjection = (
  entry: OffboardingCaseProjection,
  canViewSensitive: boolean
): OffboardingCaseProjection =>
  offboardingCaseProjectionSchema.parse({
    ...entry,
    reason: canViewSensitive ? entry.reason : null,
    reasonDetails: canViewSensitive ? entry.reasonDetails : null,
    waivedNoticeReason: canViewSensitive ? entry.waivedNoticeReason : null,
  });

const redactApprovalProjection = (
  entry: OffboardingApprovalProjection,
  canViewSensitive: boolean
): OffboardingApprovalProjection =>
  offboardingApprovalProjectionSchema.parse({
    ...entry,
    decisionNotes: canViewSensitive ? entry.decisionNotes : null,
    rejectionReason: canViewSensitive ? entry.rejectionReason : null,
    reopenedReason: canViewSensitive ? entry.reopenedReason : null,
    escalationReason: canViewSensitive ? entry.escalationReason : null,
  });

export const projectOffboardingCase = (
  entry: OffboardingCaseRecord
): OffboardingCaseProjection => {
  const notice = resolveOffboardingNoticeStatus({
    exitType: entry.exitType,
    waivedNotice: entry.waivedNotice,
    requiredNoticeDays: entry.requiredNoticeDays ?? null,
    noticeStartDate: entry.noticeStartDate ?? null,
    noticeEndDate: entry.noticeEndDate ?? null,
  });

  return offboardingCaseProjectionSchema.parse({
    ...entry,
    requiredNoticeDays: entry.requiredNoticeDays ?? null,
    ...notice,
  });
};

export const projectOffboardingApproval = (
  entry: OffboardingApprovalStepRecord
): OffboardingApprovalProjection =>
  offboardingApprovalProjectionSchema.parse({
    ...entry,
    blocking: entry.required && entry.status !== "approved",
    actionable:
      entry.status === "draft" ||
      entry.status === "pending" ||
      entry.status === "rejected",
  });

const sortByUpdatedDesc = (
  left: { id: string; updatedAt: Date },
  right: { id: string; updatedAt: Date }
): number =>
  right.updatedAt.getTime() - left.updatedAt.getTime() ||
  left.id.localeCompare(right.id);

export async function projectOffboardingCaseRecords(
  scope?: OffboardingRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): Promise<readonly OffboardingCaseProjection[]> {
  if (!canReadOffboardingExitManagement(context)) {
    return [];
  }

  const canViewSensitive =
    canViewOffboardingExitManagementSensitiveData(context);

  return (await loadOffboardingRepository(scope)).cases
    .map((entry) => projectOffboardingCase(entry))
    .map((entry) => redactOffboardingCaseProjection(entry, canViewSensitive))
    .sort(
      (left, right) =>
        right.effectiveSeparationDate.getTime() -
          left.effectiveSeparationDate.getTime() ||
        sortByUpdatedDesc(left, right)
    );
}

export async function projectOffboardingApprovalRecords(
  scope?: OffboardingRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): Promise<readonly OffboardingApprovalProjection[]> {
  if (!canReadOffboardingExitManagement(context)) {
    return [];
  }

  const canViewSensitive =
    canViewOffboardingExitManagementSensitiveData(context);

  return (await loadOffboardingRepository(scope)).approvals
    .map((entry) => projectOffboardingApproval(entry))
    .map((entry) => redactApprovalProjection(entry, canViewSensitive))
    .sort(
      (left, right) =>
        left.caseId.localeCompare(right.caseId) ||
        left.sequence - right.sequence ||
        sortByUpdatedDesc(left, right)
    );
}

export async function projectOffboardingApprovalBlockers(
  scope?: OffboardingRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): Promise<readonly OffboardingApprovalBlockerProjection[]> {
  const approvals = await projectOffboardingApprovalRecords(scope, context);
  const grouped = new Map<string, OffboardingApprovalProjection[]>();

  for (const approval of approvals) {
    const key = `${approval.tenantId ?? ""}::${approval.companyId ?? ""}::${approval.caseId}`;
    const current = grouped.get(key);
    if (current) {
      current.push(approval);
    } else {
      grouped.set(key, [approval]);
    }
  }

  return [...grouped.values()]
    .map((entries) => {
      const requiredApprovals = entries.filter((entry) => entry.required);
      const approvedRequiredCount = requiredApprovals.filter(
        (entry) => entry.status === "approved"
      ).length;
      const pendingRequiredCount = requiredApprovals.filter(
        (entry) => entry.status === "pending" || entry.status === "draft"
      ).length;
      const rejectedRequiredCount = requiredApprovals.filter(
        (entry) => entry.status === "rejected"
      ).length;
      const blockers = requiredApprovals.filter(
        (entry) => entry.status !== "approved"
      );
      const latestActionAt = entries.reduce<Date | null>(
        (latest, entry) =>
          latest === null || entry.updatedAt.getTime() > latest.getTime()
            ? entry.updatedAt
            : latest,
        null
      );
      let blockingStatus: "blocked" | "clear" | "pending" = "clear";

      if (rejectedRequiredCount > 0) {
        blockingStatus = "blocked";
      } else if (blockers.length > 0) {
        blockingStatus = "pending";
      }

      return offboardingApprovalBlockerProjectionSchema.parse({
        companyId: entries[0]?.companyId ?? null,
        tenantId: entries[0]?.tenantId ?? null,
        caseId: entries[0]?.caseId,
        employeeId: entries[0]?.employeeId,
        blockingStatus,
        requiredApprovalCount: requiredApprovals.length,
        approvedRequiredCount,
        pendingRequiredCount,
        rejectedRequiredCount,
        blockingApprovalCount: blockers.length,
        blockers: blockers.map((entry) => ({
          approvalId: entry.id,
          stepCode: entry.stepCode,
          stepLabel: entry.stepLabel,
          sequence: entry.sequence,
          status: entry.status,
          routeToId: entry.routeToId,
          routeToLabel: entry.routeToLabel ?? null,
          required: entry.required,
        })),
        lastActionAt: latestActionAt,
      });
    })
    .sort(
      (left, right) =>
        (right.lastActionAt?.getTime() ?? 0) -
          (left.lastActionAt?.getTime() ?? 0) ||
        left.caseId.localeCompare(right.caseId)
    );
}

export async function projectOffboardingAuditTrailEntries(
  scope?: OffboardingRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): Promise<readonly OffboardingAuditTrailProjection[]> {
  if (!canReadOffboardingExitManagement(context)) {
    return [];
  }

  const canViewSensitive =
    canViewOffboardingExitManagementSensitiveData(context);

  return (await loadOffboardingRepository(scope)).auditEvents
    .map((entry) => redactAuditEvent(entry, canViewSensitive))
    .sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime() ||
        left.id.localeCompare(right.id)
    );
}

export async function projectOffboardingFoundationSnapshot(
  scope?: OffboardingRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): Promise<OffboardingFoundationSnapshot | null> {
  if (!canReadOffboardingExitManagement(context)) {
    return null;
  }

  const state = await loadOffboardingRepository(scope);
  const lastAuditAt = state.auditEvents.reduce<Date | null>(
    (latest, entry) =>
      latest === null || entry.createdAt.getTime() > latest.getTime()
        ? entry.createdAt
        : latest,
    null
  );

  return offboardingFoundationSnapshotSchema.parse({
    generatedAt: new Date(),
    featureId: offboardingExitManagementFeatureId,
    title: offboardingExitManagementFeatureLabel,
    packageName: offboardingExitManagementFeatureScope.packageName,
    caseCount: state.cases.length,
    approvalCount: state.approvals.length,
    auditEventCount: state.auditEvents.length,
    lastAuditAt,
    boundedContext: offboardingExitManagementBoundedContext,
    capabilities: offboardingExitManagementCapabilityCatalog,
    capabilityGroups: offboardingExitManagementCapabilityGroups,
    permissions: offboardingExitManagementPermissions,
    routeContracts: offboardingExitManagementRouteContracts,
    requirementCoverage: offboardingExitManagementRequirementCoverage,
    acceptanceCoverage: offboardingExitManagementAcceptanceCoverage,
  });
}
