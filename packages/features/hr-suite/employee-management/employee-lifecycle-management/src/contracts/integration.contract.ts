import { z } from "zod";

const optionalStringSchema = z.string().trim().nullable();
const requiredStringSchema = z.string().trim().min(1);
const optionalIsoDateSchema = z.string().trim().nullable();

export const employeeLifecycleIntegrationSnapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  employeeId: requiredStringSchema,
  companyId: optionalStringSchema,
  tenantId: optionalStringSchema,
  lifecycleStage: requiredStringSchema,
  currentStageEffectiveAt: optionalIsoDateSchema,
  overview: z.object({
    movementCount: z.number().int().nonnegative(),
    needsAttention: z.boolean(),
    latestActivityAt: optionalIsoDateSchema,
  }),
  onboarding: z
    .object({
      workflowStatus: requiredStringSchema,
      isReadyForActivation: z.boolean(),
      isActivated: z.boolean(),
      totalTasks: z.number().int().nonnegative(),
      completedTasks: z.number().int().nonnegative(),
    })
    .nullable(),
  probation: z
    .object({
      workflowStatus: requiredStringSchema,
      reviewDueAt: optionalIsoDateSchema,
      isReviewDue: z.boolean(),
      isOverdue: z.boolean(),
      lastReviewOutcome: optionalStringSchema,
    })
    .nullable(),
  movement: z
    .object({
      latestMovementKind: requiredStringSchema,
      latestMovementAt: optionalIsoDateSchema,
      currentAssignment: z.record(z.string(), z.unknown()).nullable(),
    })
    .nullable(),
  contract: z
    .object({
      contractStatus: requiredStringSchema,
      expiryAt: optionalIsoDateSchema,
      isExpired: z.boolean(),
      isRenewalDue: z.boolean(),
      isReminderDue: z.boolean(),
    })
    .nullable(),
  suspension: z
    .object({
      suspensionStatus: requiredStringSchema,
      suspensionKind: requiredStringSchema,
      isRestricted: z.boolean(),
      isClosed: z.boolean(),
    })
    .nullable(),
  exit: z
    .object({
      exitKind: requiredStringSchema,
      exitStatus: requiredStringSchema,
      finalStage: requiredStringSchema,
      startedAt: optionalIsoDateSchema,
      noticeEndsAt: optionalIsoDateSchema,
      lastWorkingAt: optionalIsoDateSchema,
      isNoticeActive: z.boolean(),
      isOffboardingTriggered: z.boolean(),
      isArchived: z.boolean(),
    })
    .nullable(),
});

export const employeeLifecycleTaskAttentionSnapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  employeeId: requiredStringSchema,
  companyId: optionalStringSchema,
  tenantId: optionalStringSchema,
  totalTasks: z.number().int().nonnegative(),
  dueTasks: z.number().int().nonnegative(),
  overdueTasks: z.number().int().nonnegative(),
  pendingTasks: z.number().int().nonnegative(),
  taskKinds: z.array(requiredStringSchema),
  generatedAt: requiredStringSchema,
});

export const employeeLifecycleIntegrationChangeEventSchema = z.object({
  eventName: z.literal("hr.employee-lifecycle.integration.changed.v1"),
  eventVersion: z.literal(1),
  occurredAt: requiredStringSchema,
  companyId: optionalStringSchema,
  tenantId: optionalStringSchema,
  employeeId: requiredStringSchema,
  snapshot: employeeLifecycleIntegrationSnapshotSchema,
  taskAttention: employeeLifecycleTaskAttentionSnapshotSchema,
});

export const employeeLifecycleOffboardingHandoffSchema = z.object({
  handoffVersion: z.literal(1),
  employeeId: requiredStringSchema,
  companyId: optionalStringSchema,
  tenantId: optionalStringSchema,
  lifecycleExitReference: requiredStringSchema,
  exitKind: z.enum([
    "resignation",
    "termination",
    "retirement",
    "contract_expiry",
  ]),
  effectiveSeparationDate: requiredStringSchema,
  noticeEndsAt: optionalIsoDateSchema,
  lastWorkingAt: optionalIsoDateSchema,
});

export const employeeLifecyclePayrollSettlementReadinessSchema = z.object({
  contractVersion: z.literal(1),
  employeeId: requiredStringSchema,
  lifecycleStage: requiredStringSchema,
  exitKind: optionalStringSchema,
  finalStage: optionalStringSchema,
  isArchived: z.boolean(),
  lastWorkingAt: optionalIsoDateSchema,
});

export const employeeLifecycleLeaveAttendanceClearanceSchema = z.object({
  contractVersion: z.literal(1),
  employeeId: requiredStringSchema,
  lifecycleStage: requiredStringSchema,
  exitKind: optionalStringSchema,
  noticeEndsAt: optionalIsoDateSchema,
  lastWorkingAt: optionalIsoDateSchema,
});

export const employeeLifecycleIamRevocationTriggerSchema = z.object({
  contractVersion: z.literal(1),
  employeeId: requiredStringSchema,
  lifecycleStage: requiredStringSchema,
  exitKind: optionalStringSchema,
  offboardingTriggered: z.boolean(),
  lastWorkingAt: optionalIsoDateSchema,
});

export const employeeLifecycleComplianceWorkerStatusSchema = z.object({
  contractVersion: z.literal(1),
  employeeId: requiredStringSchema,
  lifecycleStage: requiredStringSchema,
  suspended: z.boolean(),
  noticePeriodActive: z.boolean(),
  separatedAt: optionalIsoDateSchema,
  retiredAt: optionalIsoDateSchema,
});

export type EmployeeLifecycleIntegrationSnapshot = z.infer<
  typeof employeeLifecycleIntegrationSnapshotSchema
>;
export type EmployeeLifecycleTaskAttentionSnapshot = z.infer<
  typeof employeeLifecycleTaskAttentionSnapshotSchema
>;
export type EmployeeLifecycleIntegrationChangeEvent = z.infer<
  typeof employeeLifecycleIntegrationChangeEventSchema
>;
export type EmployeeLifecycleOffboardingHandoff = z.infer<
  typeof employeeLifecycleOffboardingHandoffSchema
>;
export type EmployeeLifecyclePayrollSettlementReadiness = z.infer<
  typeof employeeLifecyclePayrollSettlementReadinessSchema
>;
export type EmployeeLifecycleLeaveAttendanceClearance = z.infer<
  typeof employeeLifecycleLeaveAttendanceClearanceSchema
>;
export type EmployeeLifecycleIamRevocationTrigger = z.infer<
  typeof employeeLifecycleIamRevocationTriggerSchema
>;
export type EmployeeLifecycleComplianceWorkerStatus = z.infer<
  typeof employeeLifecycleComplianceWorkerStatusSchema
>;
