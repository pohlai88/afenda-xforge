import { z } from "zod";
import {
  canReadEmployeeLifecycleManagement,
  canViewEmployeeLifecycleManagementSensitiveData,
} from "./policy.ts";
import type { EmployeeLifecycleRepositoryScope } from "./repository.ts";
import {
  findEmployeeLifecycleContractRecordByEmployeeId,
  findEmployeeLifecycleExitRecordByEmployeeId,
  findEmployeeLifecycleMovementRecordByEmployeeId,
  findEmployeeLifecycleOnboardingRecordByEmployeeId,
  findEmployeeLifecycleProbationRecordByEmployeeId,
  findEmployeeLifecycleSuspensionRecordByEmployeeId,
  loadEmployeeLifecycleRepository,
} from "./repository.ts";
import type {
  EmployeeLifecycleContractReadModel,
  EmployeeLifecycleExitReadModel,
  EmployeeLifecycleMovementReadModel,
  EmployeeLifecycleOnboardingReadModel,
  EmployeeLifecycleProbationReadModel,
  EmployeeLifecycleStageValue,
  EmployeeLifecycleState,
  EmployeeLifecycleSuspensionReadModel,
} from "./schema.ts";
import {
  buildEmployeeLifecycleContractReadModel,
  buildEmployeeLifecycleExitReadModel,
  buildEmployeeLifecycleMovementReadModel,
  buildEmployeeLifecycleOnboardingReadModel,
  buildEmployeeLifecycleProbationReadModel,
  buildEmployeeLifecycleSuspensionReadModel,
  employeeLifecycleContractStatusValues,
  employeeLifecycleDateSchema,
  employeeLifecycleExitStatusValues,
  employeeLifecycleOnboardingWorkflowStatusValues,
  employeeLifecycleProbationStatusValues,
  employeeLifecycleStageSchema,
  employeeLifecycleStageValues,
  employeeLifecycleSuspensionStatusValues,
} from "./schema.ts";

const employeeLifecycleTimelineSourceValues = [
  "state",
  "onboarding",
  "probation",
  "movement",
  "contract",
  "suspension",
  "exit",
] as const;

export const employeeLifecycleTimelineSourceSchema = z.enum(
  employeeLifecycleTimelineSourceValues
);

export type EmployeeLifecycleTimelineSourceValue =
  (typeof employeeLifecycleTimelineSourceValues)[number];

const employeeLifecycleTimelineStatusValues = [
  "completed",
  "due",
  "overdue",
  "pending",
  "scheduled",
] as const;

export const employeeLifecycleTimelineStatusSchema = z.enum(
  employeeLifecycleTimelineStatusValues
);

export type EmployeeLifecycleTimelineStatusValue =
  (typeof employeeLifecycleTimelineStatusValues)[number];

const employeeLifecycleTimelineStatusOrder: Record<
  EmployeeLifecycleTimelineStatusValue,
  number
> = {
  overdue: 0,
  due: 1,
  pending: 2,
  scheduled: 3,
  completed: 4,
};

const employeeLifecycleStageOrder = new Map(
  employeeLifecycleStageValues.map((stage, index) => [stage, index])
);

const buildEmployeeLifecycleHistoryEntry = (
  input: EmployeeLifecycleHistoryEntry
): EmployeeLifecycleHistoryEntry =>
  employeeLifecycleHistoryEntrySchema.parse(input);

const describeEmployeeLifecycleStateEvent = (
  entry: EmployeeLifecycleState["history"][number]
): string =>
  entry.event === "hr.employee-lifecycle.state.initialized"
    ? `Lifecycle initialized to ${entry.stage}`
    : `Lifecycle transitioned to ${entry.toStage}`;

const describeEmployeeLifecycleOnboardingEvent = (
  entry: NonNullable<EmployeeLifecycleOnboardingReadModel["events"]>[number]
): string => {
  switch (entry.event) {
    case "started":
      return "Onboarding started";
    case "task_completed":
      return `Onboarding task completed: ${entry.taskCode ?? "unknown"}`;
    case "ready_for_activation":
      return "Onboarding ready for activation";
    case "activated":
      return "Onboarding activated";
    default:
      throw new Error("Unsupported onboarding event");
  }
};

const describeEmployeeLifecycleProbationEvent = (
  entry: NonNullable<EmployeeLifecycleProbationReadModel["events"]>[number]
): string => {
  switch (entry.event) {
    case "started":
      return "Probation started";
    case "review_scheduled":
      return "Probation review scheduled";
    case "review_recorded":
      return `Probation review recorded: ${entry.reviewOutcome}`;
    case "extended":
      return "Probation extended";
    case "confirmation_approved":
      return "Probation confirmation approved";
    case "termination_recommended":
      return "Probation termination recommended";
    default:
      throw new Error("Unsupported probation event");
  }
};

const describeEmployeeLifecycleMovementEvent = (): string =>
  "Movement recorded";

const describeEmployeeLifecycleContractEvent = (
  entry: NonNullable<EmployeeLifecycleContractReadModel["events"]>[number]
): string => {
  switch (entry.event) {
    case "started":
      return "Contract started";
    case "renewed":
      return "Contract renewed";
    case "review_recorded":
      return "Contract review recorded";
    case "reminder_recorded":
      return "Contract reminder recorded";
    default:
      throw new Error("Unsupported contract event");
  }
};

const describeEmployeeLifecycleSuspensionEvent = (
  entry: NonNullable<EmployeeLifecycleSuspensionReadModel["events"]>[number]
): string => {
  switch (entry.event) {
    case "started":
      return "Suspension started";
    case "released":
      return "Suspension released";
    case "resolved":
      return "Suspension resolved";
    default:
      throw new Error("Unsupported suspension event");
  }
};

const describeEmployeeLifecycleExitEvent = (
  entry: NonNullable<EmployeeLifecycleExitReadModel["events"]>[number]
): string => {
  switch (entry.event) {
    case "resignation_started":
      return "Resignation started";
    case "termination_started":
      return "Termination started";
    case "retirement_started":
      return "Retirement started";
    case "notice_recorded":
      return "Exit notice recorded";
    case "offboarding_triggered":
      return "Exit offboarding triggered";
    case "archived":
      return "Exit archived";
    default:
      throw new Error("Unsupported exit event");
  }
};

export const employeeLifecycleStageSummarySchema = z.object({
  stage: employeeLifecycleStageSchema,
  count: z.number().int().nonnegative(),
  employeeIds: z.array(z.string().trim().min(1)),
});

export const employeeLifecycleOverviewEntrySchema = z.object({
  employeeId: z.string().trim().min(1),
  companyId: z.string().trim().min(1).nullable().optional(),
  tenantId: z.string().trim().min(1).nullable().optional(),
  lifecycleStage: employeeLifecycleStageSchema,
  currentStageEffectiveAt: employeeLifecycleDateSchema,
  currentStageSequence: z.number().int().nonnegative(),
  onboardingWorkflowStatus: z
    .enum(employeeLifecycleOnboardingWorkflowStatusValues)
    .nullable(),
  onboardingTaskCount: z.number().int().nonnegative(),
  onboardingCompletedTaskCount: z.number().int().nonnegative(),
  probationStatus: z.enum(employeeLifecycleProbationStatusValues).nullable(),
  contractStatus: z.enum(employeeLifecycleContractStatusValues).nullable(),
  suspensionStatus: z.enum(employeeLifecycleSuspensionStatusValues).nullable(),
  exitStatus: z.enum(employeeLifecycleExitStatusValues).nullable(),
  movementCount: z.number().int().nonnegative(),
  latestActivityAt: employeeLifecycleDateSchema,
  needsAttention: z.boolean(),
});

export const employeeLifecycleOverviewSnapshotSchema = z.object({
  generatedAt: employeeLifecycleDateSchema,
  totalEmployees: z.number().int().nonnegative(),
  attentionRequiredCount: z.number().int().nonnegative(),
  stageCounts: z.record(
    z.string().trim().min(1),
    z.number().int().nonnegative()
  ),
  overview: z.array(employeeLifecycleOverviewEntrySchema),
});

export const employeeLifecycleHistoryEntrySchema = z.object({
  id: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  companyId: z.string().trim().min(1).nullable().optional(),
  tenantId: z.string().trim().min(1).nullable().optional(),
  source: employeeLifecycleTimelineSourceSchema,
  kind: z.string().trim().min(1),
  lifecycleStage: employeeLifecycleStageSchema.nullish(),
  status: z.string().trim().min(1).nullable().optional(),
  occurredAt: employeeLifecycleDateSchema,
  effectiveAt: employeeLifecycleDateSchema.nullish(),
  actorId: z.string().trim().min(1).nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  summary: z.string().trim().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const employeeLifecycleTaskEntrySchema = z.object({
  id: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  companyId: z.string().trim().min(1).nullable().optional(),
  tenantId: z.string().trim().min(1).nullable().optional(),
  source: employeeLifecycleTimelineSourceSchema,
  kind: z.string().trim().min(1),
  title: z.string().trim().min(1),
  status: employeeLifecycleTimelineStatusSchema,
  lifecycleStage: employeeLifecycleStageSchema.nullish(),
  dueAt: employeeLifecycleDateSchema.nullish(),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
  summary: z.string().trim().min(1),
});

const stageCountsFromOverview = (
  overview: readonly EmployeeLifecycleOverviewEntry[]
): Record<EmployeeLifecycleStageValue, number> =>
  Object.fromEntries(
    employeeLifecycleStageValues.map((stage) => [
      stage,
      overview.filter((entry) => entry.lifecycleStage === stage).length,
    ])
  ) as Record<EmployeeLifecycleStageValue, number>;

const getLatestActivityAt = (values: readonly Date[]): Date =>
  new Date(
    Math.max(...values.map((value) => value.getTime()), new Date(0).getTime())
  );

const buildStateHistoryEntry = (
  state: EmployeeLifecycleState,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  state.history.map((entry) =>
    buildEmployeeLifecycleHistoryEntry({
      id: entry.id,
      employeeId: entry.employeeId,
      companyId: state.companyId ?? undefined,
      tenantId: state.tenantId ?? undefined,
      source: "state",
      kind: entry.event,
      lifecycleStage: "stage" in entry ? entry.stage : entry.toStage,
      status: "stage" in entry ? entry.stage : entry.toStage,
      occurredAt: entry.recordedAt,
      effectiveAt: entry.effectiveAt,
      actorId: canViewSensitive ? (entry.actorId ?? null) : null,
      approvalReference: canViewSensitive
        ? "approvalReference" in entry
          ? (entry.approvalReference ?? null)
          : null
        : null,
      reason: canViewSensitive ? (entry.reason ?? null) : null,
      summary: describeEmployeeLifecycleStateEvent(entry),
      metadata: entry.metadata,
    })
  );

const buildOnboardingHistoryEntries = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleOnboardingReadModel | null,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  record
    ? record.events.map((entry) =>
        buildEmployeeLifecycleHistoryEntry({
          id: entry.id,
          employeeId: entry.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "onboarding",
          kind: entry.event,
          lifecycleStage: state.currentStage,
          status: record.workflowStatus,
          occurredAt: entry.createdAt,
          effectiveAt: entry.createdAt,
          actorId: canViewSensitive ? (entry.actorId ?? null) : null,
          approvalReference: null,
          reason: canViewSensitive ? (entry.reason ?? null) : null,
          summary: describeEmployeeLifecycleOnboardingEvent(entry),
          metadata: entry.metadata,
        })
      )
    : [];

const buildProbationHistoryEntries = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleProbationReadModel | null,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  record
    ? record.events.map((entry) =>
        buildEmployeeLifecycleHistoryEntry({
          id: entry.id,
          employeeId: entry.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "probation",
          kind: entry.event,
          lifecycleStage: state.currentStage,
          status: record.workflowStatus,
          occurredAt: entry.createdAt,
          effectiveAt: entry.createdAt,
          actorId: canViewSensitive ? (entry.actorId ?? null) : null,
          approvalReference: canViewSensitive
            ? (entry.approvalReference ?? null)
            : null,
          reason: canViewSensitive ? (entry.reason ?? null) : null,
          summary: describeEmployeeLifecycleProbationEvent(entry),
          metadata: entry.metadata,
        })
      )
    : [];

const buildMovementHistoryEntries = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleMovementReadModel | null,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  record
    ? record.events.map((entry) =>
        buildEmployeeLifecycleHistoryEntry({
          id: entry.id,
          employeeId: entry.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "movement",
          kind: entry.event,
          lifecycleStage: state.currentStage,
          status: record.latestMovementKind,
          occurredAt: entry.createdAt,
          effectiveAt: entry.createdAt,
          actorId: canViewSensitive ? (entry.actorId ?? null) : null,
          approvalReference: canViewSensitive
            ? (entry.approvalReference ?? null)
            : null,
          reason: canViewSensitive ? (entry.reason ?? null) : null,
          summary: describeEmployeeLifecycleMovementEvent(),
          metadata: entry.metadata,
        })
      )
    : [];

const buildContractHistoryEntries = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleContractReadModel | null,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  record
    ? record.events.map((entry) =>
        buildEmployeeLifecycleHistoryEntry({
          id: entry.id,
          employeeId: entry.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "contract",
          kind: entry.event,
          lifecycleStage: state.currentStage,
          status: record.contractStatus,
          occurredAt: entry.createdAt,
          effectiveAt: entry.createdAt,
          actorId: canViewSensitive ? (entry.actorId ?? null) : null,
          approvalReference: canViewSensitive
            ? (entry.approvalReference ?? null)
            : null,
          reason: canViewSensitive ? (entry.reason ?? null) : null,
          summary: describeEmployeeLifecycleContractEvent(entry),
          metadata: entry.metadata,
        })
      )
    : [];

const buildSuspensionHistoryEntries = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleSuspensionReadModel | null,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  record
    ? record.events.map((entry) =>
        buildEmployeeLifecycleHistoryEntry({
          id: entry.id,
          employeeId: entry.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "suspension",
          kind: entry.event,
          lifecycleStage: state.currentStage,
          status: record.suspensionStatus,
          occurredAt: entry.createdAt,
          effectiveAt: entry.createdAt,
          actorId: canViewSensitive ? (entry.actorId ?? null) : null,
          approvalReference: canViewSensitive
            ? (entry.approvalReference ?? null)
            : null,
          reason: canViewSensitive ? (entry.reason ?? null) : null,
          summary: describeEmployeeLifecycleSuspensionEvent(entry),
          metadata: entry.metadata,
        })
      )
    : [];

const buildExitHistoryEntries = (
  state: EmployeeLifecycleState,
  record: EmployeeLifecycleExitReadModel | null,
  canViewSensitive: boolean
): readonly EmployeeLifecycleHistoryEntry[] =>
  record
    ? record.events.map((entry) =>
        buildEmployeeLifecycleHistoryEntry({
          id: entry.id,
          employeeId: entry.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "exit",
          kind: entry.event,
          lifecycleStage: state.currentStage,
          status: record.exitStatus,
          occurredAt: entry.createdAt,
          effectiveAt: entry.createdAt,
          actorId: canViewSensitive ? (entry.actorId ?? null) : null,
          approvalReference: canViewSensitive
            ? (entry.approvalReference ?? null)
            : null,
          reason: canViewSensitive ? (entry.reason ?? null) : null,
          summary: describeEmployeeLifecycleExitEvent(entry),
          metadata: entry.metadata,
        })
      )
    : [];

const compareTimelineEntries = (
  left: EmployeeLifecycleHistoryEntry,
  right: EmployeeLifecycleHistoryEntry
): number =>
  left.occurredAt.getTime() - right.occurredAt.getTime() ||
  left.employeeId.localeCompare(right.employeeId) ||
  left.source.localeCompare(right.source) ||
  left.id.localeCompare(right.id);

const buildEmployeeLifecycleOverviewEntry = (
  state: EmployeeLifecycleState,
  scope?: EmployeeLifecycleRepositoryScope
): EmployeeLifecycleOverviewEntry => {
  const onboarding = buildEmployeeLifecycleOnboardingReadModel({
    state,
    record: findEmployeeLifecycleOnboardingRecordByEmployeeId(
      state.employeeId,
      scope
    ),
  });
  const probation = buildEmployeeLifecycleProbationReadModel({
    state,
    record: findEmployeeLifecycleProbationRecordByEmployeeId(
      state.employeeId,
      scope
    ),
  });
  const movement = buildEmployeeLifecycleMovementReadModel({
    state,
    record: findEmployeeLifecycleMovementRecordByEmployeeId(
      state.employeeId,
      scope
    ),
  });
  const contract = buildEmployeeLifecycleContractReadModel({
    state,
    record: findEmployeeLifecycleContractRecordByEmployeeId(
      state.employeeId,
      scope
    ),
  });
  const suspension = buildEmployeeLifecycleSuspensionReadModel({
    state,
    record: findEmployeeLifecycleSuspensionRecordByEmployeeId(
      state.employeeId,
      scope
    ),
  });
  const exit = buildEmployeeLifecycleExitReadModel({
    state,
    record: findEmployeeLifecycleExitRecordByEmployeeId(
      state.employeeId,
      scope
    ),
  });

  const overview = employeeLifecycleOverviewEntrySchema.parse({
    employeeId: state.employeeId,
    companyId: state.companyId ?? undefined,
    tenantId: state.tenantId ?? undefined,
    lifecycleStage: state.currentStage,
    currentStageEffectiveAt: state.currentStageEffectiveAt,
    currentStageSequence: state.currentStageSequence,
    onboardingWorkflowStatus: onboarding?.workflowStatus ?? null,
    onboardingTaskCount: onboarding?.totalTasks ?? 0,
    onboardingCompletedTaskCount: onboarding?.completedTasks ?? 0,
    probationStatus: probation?.workflowStatus ?? null,
    contractStatus: contract?.contractStatus ?? null,
    suspensionStatus: suspension?.suspensionStatus ?? null,
    exitStatus: exit?.exitStatus ?? null,
    movementCount: movement?.movementCount ?? 0,
    latestActivityAt: getLatestActivityAt([
      state.updatedAt,
      onboarding?.activatedAt ??
        onboarding?.readyAt ??
        onboarding?.startedAt ??
        state.updatedAt,
      probation?.startedAt ?? state.updatedAt,
      movement?.latestMovementAt ?? state.updatedAt,
      contract?.startedAt ?? state.updatedAt,
      suspension?.startedAt ?? state.updatedAt,
      exit?.startedAt ?? state.updatedAt,
    ]),
    needsAttention:
      Boolean(onboarding && onboarding.workflowStatus !== "activated") ||
      Boolean(probation && probation.workflowStatus !== "confirmed") ||
      Boolean(contract && contract.contractStatus !== "active") ||
      Boolean(suspension && suspension.suspensionStatus !== "released") ||
      Boolean(exit && exit.exitStatus !== "archived"),
  });

  return overview;
};

export type EmployeeLifecycleOverviewEntry = z.infer<
  typeof employeeLifecycleOverviewEntrySchema
>;
export type EmployeeLifecycleOverviewSnapshot = z.infer<
  typeof employeeLifecycleOverviewSnapshotSchema
>;
export type EmployeeLifecycleHistoryEntry = z.infer<
  typeof employeeLifecycleHistoryEntrySchema
>;
export type EmployeeLifecycleTaskEntry = z.infer<
  typeof employeeLifecycleTaskEntrySchema
>;
export type EmployeeLifecycleStageSummary = z.infer<
  typeof employeeLifecycleStageSummarySchema
>;

export function projectEmployeeLifecycleOverviewEntries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): readonly EmployeeLifecycleOverviewEntry[] {
  if (!canReadEmployeeLifecycleManagement(context)) {
    return [];
  }

  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .map((state) => buildEmployeeLifecycleOverviewEntry(state, scope))
    .sort(
      (left, right) =>
        (employeeLifecycleStageOrder.get(left.lifecycleStage) ?? 0) -
          (employeeLifecycleStageOrder.get(right.lifecycleStage) ?? 0) ||
        left.employeeId.localeCompare(right.employeeId)
    );
}

export function projectEmployeeLifecycleOverviewSnapshot(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): EmployeeLifecycleOverviewSnapshot {
  const overview = projectEmployeeLifecycleOverviewEntries(scope, context);
  const snapshot = employeeLifecycleOverviewSnapshotSchema.parse({
    generatedAt: new Date(),
    totalEmployees: overview.length,
    attentionRequiredCount: overview.filter((entry) => entry.needsAttention)
      .length,
    stageCounts: stageCountsFromOverview(overview),
    overview,
  });

  return snapshot;
}

export function projectEmployeeLifecycleStageSummaries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
  }>
): readonly z.infer<typeof employeeLifecycleStageSummarySchema>[] {
  const overview = projectEmployeeLifecycleOverviewEntries(scope, context);

  return employeeLifecycleStageValues
    .map((stage) =>
      employeeLifecycleStageSummarySchema.parse({
        stage,
        count: overview.filter((entry) => entry.lifecycleStage === stage)
          .length,
        employeeIds: overview
          .filter((entry) => entry.lifecycleStage === stage)
          .map((entry) => entry.employeeId),
      })
    )
    .filter((summary) => summary.count > 0);
}

export function projectEmployeeLifecycleHistoryEntries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
    employeeId?: string;
  }>
): readonly EmployeeLifecycleHistoryEntry[] {
  if (!canReadEmployeeLifecycleManagement(context)) {
    return [];
  }

  const repositoryState = loadEmployeeLifecycleRepository(scope);
  const canViewSensitive =
    canViewEmployeeLifecycleManagementSensitiveData(context);

  return repositoryState.states
    .filter(
      (state) => !context?.employeeId || state.employeeId === context.employeeId
    )
    .flatMap((state) => {
      const onboarding = buildEmployeeLifecycleOnboardingReadModel({
        state,
        record: findEmployeeLifecycleOnboardingRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const probation = buildEmployeeLifecycleProbationReadModel({
        state,
        record: findEmployeeLifecycleProbationRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const movement = buildEmployeeLifecycleMovementReadModel({
        state,
        record: findEmployeeLifecycleMovementRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const contract = buildEmployeeLifecycleContractReadModel({
        state,
        record: findEmployeeLifecycleContractRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const suspension = buildEmployeeLifecycleSuspensionReadModel({
        state,
        record: findEmployeeLifecycleSuspensionRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const exit = buildEmployeeLifecycleExitReadModel({
        state,
        record: findEmployeeLifecycleExitRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });

      return [
        ...buildStateHistoryEntry(state, canViewSensitive),
        ...buildOnboardingHistoryEntries(state, onboarding, canViewSensitive),
        ...buildProbationHistoryEntries(state, probation, canViewSensitive),
        ...buildMovementHistoryEntries(state, movement, canViewSensitive),
        ...buildContractHistoryEntries(state, contract, canViewSensitive),
        ...buildSuspensionHistoryEntries(state, suspension, canViewSensitive),
        ...buildExitHistoryEntries(state, exit, canViewSensitive),
      ];
    })
    .sort(compareTimelineEntries);
}

export function projectEmployeeLifecycleAuditTrailEntries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
    employeeId?: string;
  }>
): readonly EmployeeLifecycleHistoryEntry[] {
  return [...projectEmployeeLifecycleHistoryEntries(scope, context)].sort(
    (left, right) =>
      right.occurredAt.getTime() - left.occurredAt.getTime() ||
      left.employeeId.localeCompare(right.employeeId) ||
      left.id.localeCompare(right.id)
  );
}

const buildOnboardingTaskEntries = (
  state: EmployeeLifecycleState,
  onboarding: EmployeeLifecycleOnboardingReadModel | null
): readonly EmployeeLifecycleTaskEntry[] =>
  onboarding?.tasks.map((task) =>
    employeeLifecycleTaskEntrySchema.parse({
      id: task.id,
      employeeId: state.employeeId,
      companyId: state.companyId ?? undefined,
      tenantId: state.tenantId ?? undefined,
      source: "onboarding",
      kind: task.code,
      title: task.title,
      status: task.status === "completed" ? "completed" : "pending",
      lifecycleStage: state.currentStage,
      dueAt: null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      summary:
        task.status === "completed"
          ? "Onboarding task completed"
          : "Onboarding task pending",
    })
  ) ?? [];

const buildProbationTaskEntries = (
  state: EmployeeLifecycleState,
  probation: EmployeeLifecycleProbationReadModel | null
): readonly EmployeeLifecycleTaskEntry[] =>
  (() => {
    if (!probation) {
      return [] as readonly EmployeeLifecycleTaskEntry[];
    }

    let status: EmployeeLifecycleTimelineStatusValue = "scheduled";
    if (probation.isOverdue) {
      status = "overdue";
    } else if (probation.isReviewDue) {
      status = "due";
    }

    return [
      employeeLifecycleTaskEntrySchema.parse({
        id: `${state.employeeId}:probation-review`,
        employeeId: state.employeeId,
        companyId: state.companyId ?? undefined,
        tenantId: state.tenantId ?? undefined,
        source: "probation",
        kind: "review",
        title: "Probation review due",
        status,
        lifecycleStage: state.currentStage,
        dueAt: probation.reviewDueAt,
        createdAt: probation.startedAt,
        updatedAt: probation.lastReviewAt ?? probation.startedAt,
        summary:
          probation.isOverdue || probation.isReviewDue
            ? "Probation review requires attention"
            : "Probation review scheduled",
      }),
    ];
  })();

const buildContractTaskEntries = (
  state: EmployeeLifecycleState,
  contract: EmployeeLifecycleContractReadModel | null
): readonly EmployeeLifecycleTaskEntry[] =>
  (() => {
    if (!contract) {
      return [] as readonly EmployeeLifecycleTaskEntry[];
    }

    const tasks: EmployeeLifecycleTaskEntry[] = [];

    if (contract.isReminderDue) {
      tasks.push(
        employeeLifecycleTaskEntrySchema.parse({
          id: `${state.employeeId}:contract-reminder`,
          employeeId: state.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "contract",
          kind: "reminder",
          title: "Contract renewal reminder due",
          status: "due",
          lifecycleStage: state.currentStage,
          dueAt: contract.renewalReminderDueAt,
          createdAt: contract.startedAt,
          updatedAt: contract.lastReminderAt ?? contract.startedAt,
          summary: "Contract renewal reminder requires attention",
        })
      );
    }

    if (contract.isRenewalDue || contract.isExpired) {
      tasks.push(
        employeeLifecycleTaskEntrySchema.parse({
          id: `${state.employeeId}:contract-review`,
          employeeId: state.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "contract",
          kind: "review",
          title: "Contract review due",
          status: contract.isExpired ? "overdue" : "due",
          lifecycleStage: state.currentStage,
          dueAt: contract.renewalReviewDueAt,
          createdAt: contract.startedAt,
          updatedAt: contract.lastReviewAt ?? contract.startedAt,
          summary: "Contract renewal review requires attention",
        })
      );
    }

    return tasks;
  })();

const buildSuspensionTaskEntries = (
  state: EmployeeLifecycleState,
  suspension: EmployeeLifecycleSuspensionReadModel | null
): readonly EmployeeLifecycleTaskEntry[] =>
  suspension && suspension.isRestricted && !suspension.isClosed
    ? [
        employeeLifecycleTaskEntrySchema.parse({
          id: `${state.employeeId}:suspension-resolution`,
          employeeId: state.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "suspension",
          kind: "resolution",
          title: "Suspension resolution required",
          status: "due",
          lifecycleStage: state.currentStage,
          dueAt: suspension.lastSuspendedAt ?? suspension.startedAt,
          createdAt: suspension.startedAt,
          updatedAt: suspension.lastSuspendedAt ?? suspension.startedAt,
          summary: "Suspension remains open",
        }),
      ]
    : [];

const buildExitTaskEntries = (
  state: EmployeeLifecycleState,
  exit: EmployeeLifecycleExitReadModel | null
): readonly EmployeeLifecycleTaskEntry[] =>
  (() => {
    if (!exit || exit.isArchived) {
      return [] as readonly EmployeeLifecycleTaskEntry[];
    }

    const tasks: EmployeeLifecycleTaskEntry[] = [];

    if (exit.isNoticeActive) {
      tasks.push(
        employeeLifecycleTaskEntrySchema.parse({
          id: `${state.employeeId}:exit-notice`,
          employeeId: state.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "exit",
          kind: "notice",
          title: "Exit notice active",
          status: "due",
          lifecycleStage: state.currentStage,
          dueAt: exit.noticeEndsAt,
          createdAt: exit.startedAt,
          updatedAt: exit.lastNoticeAt ?? exit.startedAt,
          summary: "Exit notice is active",
        })
      );
    }

    if (!exit.isOffboardingTriggered) {
      tasks.push(
        employeeLifecycleTaskEntrySchema.parse({
          id: `${state.employeeId}:exit-offboarding`,
          employeeId: state.employeeId,
          companyId: state.companyId ?? undefined,
          tenantId: state.tenantId ?? undefined,
          source: "exit",
          kind: "offboarding",
          title: "Offboarding handoff pending",
          status: "pending",
          lifecycleStage: state.currentStage,
          dueAt: exit.lastWorkingAt ?? exit.noticeEndsAt ?? null,
          createdAt: exit.startedAt,
          updatedAt: exit.lastOffboardingAt ?? exit.startedAt,
          summary: "Exit offboarding handoff is pending",
        })
      );
    }

    return tasks;
  })();

export function projectEmployeeLifecycleTaskEntries(
  scope?: EmployeeLifecycleRepositoryScope,
  context?: Readonly<{
    canRead?: boolean;
    canViewSensitive?: boolean;
    companyId?: string;
    tenantId?: string;
    employeeId?: string;
  }>
): readonly EmployeeLifecycleTaskEntry[] {
  if (!canReadEmployeeLifecycleManagement(context)) {
    return [];
  }

  const repositoryState = loadEmployeeLifecycleRepository(scope);

  return repositoryState.states
    .filter(
      (state) => !context?.employeeId || state.employeeId === context.employeeId
    )
    .flatMap((state) => {
      const onboarding = buildEmployeeLifecycleOnboardingReadModel({
        state,
        record: findEmployeeLifecycleOnboardingRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const probation = buildEmployeeLifecycleProbationReadModel({
        state,
        record: findEmployeeLifecycleProbationRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const contract = buildEmployeeLifecycleContractReadModel({
        state,
        record: findEmployeeLifecycleContractRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const suspension = buildEmployeeLifecycleSuspensionReadModel({
        state,
        record: findEmployeeLifecycleSuspensionRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });
      const exit = buildEmployeeLifecycleExitReadModel({
        state,
        record: findEmployeeLifecycleExitRecordByEmployeeId(
          state.employeeId,
          scope
        ),
      });

      return [
        ...buildOnboardingTaskEntries(state, onboarding),
        ...buildProbationTaskEntries(state, probation),
        ...buildContractTaskEntries(state, contract),
        ...buildSuspensionTaskEntries(state, suspension),
        ...buildExitTaskEntries(state, exit),
      ];
    })
    .sort(
      (left, right) =>
        employeeLifecycleTimelineStatusOrder[left.status] -
          employeeLifecycleTimelineStatusOrder[right.status] ||
        (left.dueAt?.getTime() ?? 0) - (right.dueAt?.getTime() ?? 0) ||
        left.employeeId.localeCompare(right.employeeId) ||
        left.id.localeCompare(right.id)
    );
}
