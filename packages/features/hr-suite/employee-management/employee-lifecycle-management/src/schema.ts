import { z } from "zod";
import type { EmployeeLifecycleManagementAuditEvent } from "./registry/audit.ts";
import { employeeLifecycleManagementAuditEvents } from "./registry/audit.ts";

const normalizeDateValue = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
};

export const employeeLifecycleStageValues = [
  "preboarding",
  "hiring",
  "onboarding",
  "probation",
  "confirmed",
  "active",
  "suspended",
  "notice_period",
  "offboarding",
  "separated",
  "retired",
  "archived",
] as const;

export type EmployeeLifecycleStageValue =
  (typeof employeeLifecycleStageValues)[number];

export const employeeLifecycleStageSchema = z.enum(
  employeeLifecycleStageValues
);

export type EmployeeLifecycleTransitionRuleMap = Readonly<
  Record<EmployeeLifecycleStageValue, readonly EmployeeLifecycleStageValue[]>
>;

export const employeeLifecycleTransitionRules: EmployeeLifecycleTransitionRuleMap =
  {
    preboarding: ["hiring", "onboarding", "archived"],
    hiring: ["onboarding", "archived"],
    onboarding: ["probation", "confirmed", "active", "archived"],
    probation: ["confirmed", "active", "archived"],
    confirmed: ["active", "suspended", "notice_period", "archived"],
    active: [
      "suspended",
      "notice_period",
      "offboarding",
      "separated",
      "retired",
      "archived",
    ],
    suspended: ["active", "notice_period", "offboarding", "archived"],
    notice_period: ["offboarding", "separated", "retired", "archived"],
    offboarding: ["separated", "retired", "archived"],
    separated: ["archived"],
    retired: ["archived"],
    archived: [],
  } as const;

export const employeeLifecycleDateSchema = z.preprocess(
  normalizeDateValue,
  z.date()
);

const employeeLifecycleTrimmedStringSchema = z.string().trim().min(1);
const employeeLifecycleOptionalTrimmedStringSchema = z
  .string()
  .trim()
  .min(1)
  .optional();
const employeeLifecycleMetadataSchema = z
  .record(z.string(), z.unknown())
  .optional();

export const employeeLifecycleTransitionInputSchema = z.object({
  toStage: employeeLifecycleStageSchema,
  effectiveAt: employeeLifecycleDateSchema.optional(),
  recordedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleStateCreationInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  initialStage: employeeLifecycleStageSchema.optional(),
  effectiveAt: employeeLifecycleDateSchema.optional(),
  recordedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleStateHistoryBaseSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  recordedAt: employeeLifecycleDateSchema,
  effectiveAt: employeeLifecycleDateSchema,
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleStateInitializedEventSchema =
  employeeLifecycleStateHistoryBaseSchema.extend({
    event: z.literal(employeeLifecycleManagementAuditEvents.stateInitialized),
    stage: employeeLifecycleStageSchema,
  });

export const employeeLifecycleStateTransitionEventSchema =
  employeeLifecycleStateHistoryBaseSchema.extend({
    event: z.literal(employeeLifecycleManagementAuditEvents.transitionApplied),
    fromStage: employeeLifecycleStageSchema,
    toStage: employeeLifecycleStageSchema,
    approvalReference: z.string().trim().min(1).nullable().optional(),
  });

export const employeeLifecycleStateHistoryEntrySchema = z.union([
  employeeLifecycleStateInitializedEventSchema,
  employeeLifecycleStateTransitionEventSchema,
]);

export const employeeLifecycleStateSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  currentStage: employeeLifecycleStageSchema,
  currentStageEffectiveAt: employeeLifecycleDateSchema,
  currentStageSequence: z.number().int().nonnegative(),
  history: z.array(employeeLifecycleStateHistoryEntrySchema),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export type EmployeeLifecycleTransitionInput = z.infer<
  typeof employeeLifecycleTransitionInputSchema
>;
export type EmployeeLifecycleStateCreationInput = z.infer<
  typeof employeeLifecycleStateCreationInputSchema
>;
export type EmployeeLifecycleStateHistoryBase = z.infer<
  typeof employeeLifecycleStateHistoryBaseSchema
>;
export type EmployeeLifecycleStateInitializedEvent = z.infer<
  typeof employeeLifecycleStateInitializedEventSchema
>;
export type EmployeeLifecycleStateTransitionEvent = z.infer<
  typeof employeeLifecycleStateTransitionEventSchema
>;
export type EmployeeLifecycleStateHistoryEntry = z.infer<
  typeof employeeLifecycleStateHistoryEntrySchema
>;
export type EmployeeLifecycleState = z.infer<
  typeof employeeLifecycleStateSchema
>;

export class EmployeeLifecycleTransitionError extends Error {
  readonly code = "employee_lifecycle_transition_not_allowed" as const;
  readonly currentStage: EmployeeLifecycleStageValue;
  readonly targetStage: EmployeeLifecycleStageValue;
  readonly allowedTargets: readonly EmployeeLifecycleStageValue[];

  constructor(
    currentStage: EmployeeLifecycleStageValue,
    targetStage: EmployeeLifecycleStageValue,
    allowedTargets: readonly EmployeeLifecycleStageValue[]
  ) {
    super(
      `Transition from ${currentStage} to ${targetStage} is not allowed. Allowed targets: ${allowedTargets.join(", ") || "none"}.`
    );
    this.name = "EmployeeLifecycleTransitionError";
    this.currentStage = currentStage;
    this.targetStage = targetStage;
    this.allowedTargets = allowedTargets;
  }
}

export function getEmployeeLifecycleAllowedTransitionTargets(
  currentStage: EmployeeLifecycleStageValue
): readonly EmployeeLifecycleStageValue[] {
  return employeeLifecycleTransitionRules[currentStage];
}

export function isEmployeeLifecycleTransitionAllowed(
  currentStage: EmployeeLifecycleStageValue,
  targetStage: EmployeeLifecycleStageValue
): boolean {
  return getEmployeeLifecycleAllowedTransitionTargets(currentStage).includes(
    targetStage
  );
}

export function assertEmployeeLifecycleTransitionAllowed(
  currentStage: EmployeeLifecycleStageValue,
  targetStage: EmployeeLifecycleStageValue
): void {
  if (isEmployeeLifecycleTransitionAllowed(currentStage, targetStage)) {
    return;
  }

  throw new EmployeeLifecycleTransitionError(
    currentStage,
    targetStage,
    getEmployeeLifecycleAllowedTransitionTargets(currentStage)
  );
}

export function isEmployeeLifecycleStateHistoryEntry(
  value: unknown
): value is EmployeeLifecycleStateHistoryEntry {
  return employeeLifecycleStateHistoryEntrySchema.safeParse(value).success;
}

export function getEmployeeLifecycleStateFromHistory(
  input: Readonly<{
    employeeId: string;
    companyId?: string | null;
    tenantId?: string | null;
    history: readonly EmployeeLifecycleStateHistoryEntry[];
  }>
): EmployeeLifecycleState {
  if (input.history.length === 0) {
    throw new Error(
      "Employee lifecycle history must contain at least one entry."
    );
  }

  const normalizedHistory = [...input.history].sort(
    (left, right) => left.sequence - right.sequence
  );
  const [firstEntry] = normalizedHistory;

  if (
    firstEntry.event !== employeeLifecycleManagementAuditEvents.stateInitialized
  ) {
    throw new Error(
      "Employee lifecycle history must start with an initialization entry."
    );
  }

  let currentStage: EmployeeLifecycleStageValue = firstEntry.stage;
  let currentStageEffectiveAt = firstEntry.effectiveAt;
  let currentStageSequence = firstEntry.sequence;
  let updatedAt = firstEntry.recordedAt;

  normalizedHistory.forEach((entry, index) => {
    if (entry.sequence !== index) {
      throw new Error(
        "Employee lifecycle history sequences must be contiguous and start at zero."
      );
    }
  });

  for (const entry of normalizedHistory.slice(1)) {
    if (
      entry.event !== employeeLifecycleManagementAuditEvents.transitionApplied
    ) {
      throw new Error(
        "Employee lifecycle history contains an unsupported event."
      );
    }

    assertEmployeeLifecycleTransitionAllowed(currentStage, entry.toStage);
    currentStage = entry.toStage;
    currentStageEffectiveAt = entry.effectiveAt;
    currentStageSequence = entry.sequence;
    updatedAt = entry.recordedAt;
  }

  return employeeLifecycleStateSchema.parse({
    employeeId: input.employeeId,
    companyId: input.companyId ?? undefined,
    tenantId: input.tenantId ?? undefined,
    currentStage,
    currentStageEffectiveAt,
    currentStageSequence,
    history: normalizedHistory,
    createdAt: firstEntry.recordedAt,
    updatedAt,
  });
}

export function isEmployeeLifecycleStateConsistent(
  state: EmployeeLifecycleState
): boolean {
  try {
    return (
      getEmployeeLifecycleStateFromHistory({
        employeeId: state.employeeId,
        companyId: state.companyId ?? undefined,
        tenantId: state.tenantId ?? undefined,
        history: state.history,
      }).currentStage === state.currentStage
    );
  } catch {
    return false;
  }
}

export function assertEmployeeLifecycleStateConsistent(
  state: EmployeeLifecycleState
): void {
  const rebuilt = getEmployeeLifecycleStateFromHistory({
    employeeId: state.employeeId,
    companyId: state.companyId ?? undefined,
    tenantId: state.tenantId ?? undefined,
    history: state.history,
  });

  if (
    rebuilt.currentStage !== state.currentStage ||
    rebuilt.currentStageEffectiveAt.getTime() !==
      state.currentStageEffectiveAt.getTime() ||
    rebuilt.currentStageSequence !== state.currentStageSequence
  ) {
    throw new Error("Employee lifecycle state is not consistent with history.");
  }
}

function buildEmployeeLifecycleHistoryEntryId(
  employeeId: string,
  sequence: number,
  event: EmployeeLifecycleManagementAuditEvent
): string {
  return `${employeeId}:${sequence}:${event}`;
}

export function createEmployeeLifecycleState(
  input: EmployeeLifecycleStateCreationInput
): EmployeeLifecycleState {
  const parsed = employeeLifecycleStateCreationInputSchema.parse(input);
  const initialStage = parsed.initialStage ?? "preboarding";
  const effectiveAt = parsed.effectiveAt ?? new Date();
  const recordedAt = parsed.recordedAt ?? effectiveAt;
  const historyEntry: EmployeeLifecycleStateInitializedEvent = {
    id: buildEmployeeLifecycleHistoryEntryId(
      parsed.employeeId,
      0,
      employeeLifecycleManagementAuditEvents.stateInitialized
    ),
    sequence: 0,
    event: employeeLifecycleManagementAuditEvents.stateInitialized,
    employeeId: parsed.employeeId,
    stage: initialStage,
    effectiveAt,
    recordedAt,
    actorId: parsed.actorId,
    reason: parsed.reason,
    metadata: parsed.metadata,
  };

  return employeeLifecycleStateSchema.parse({
    employeeId: parsed.employeeId,
    companyId: parsed.companyId ?? undefined,
    tenantId: parsed.tenantId ?? undefined,
    currentStage: initialStage,
    currentStageEffectiveAt: effectiveAt,
    currentStageSequence: 0,
    history: [historyEntry],
    createdAt: recordedAt,
    updatedAt: recordedAt,
  });
}

export function applyEmployeeLifecycleTransition(
  state: EmployeeLifecycleState,
  transition: EmployeeLifecycleTransitionInput
): EmployeeLifecycleState {
  const parsedTransition =
    employeeLifecycleTransitionInputSchema.parse(transition);
  assertEmployeeLifecycleStateConsistent(state);
  assertEmployeeLifecycleTransitionAllowed(
    state.currentStage,
    parsedTransition.toStage
  );

  const effectiveAt = parsedTransition.effectiveAt ?? new Date();
  const recordedAt = parsedTransition.recordedAt ?? effectiveAt;
  const sequence = state.history.length;
  const entry: EmployeeLifecycleStateTransitionEvent = {
    id: buildEmployeeLifecycleHistoryEntryId(
      state.employeeId,
      sequence,
      employeeLifecycleManagementAuditEvents.transitionApplied
    ),
    sequence,
    event: employeeLifecycleManagementAuditEvents.transitionApplied,
    employeeId: state.employeeId,
    fromStage: state.currentStage,
    toStage: parsedTransition.toStage,
    effectiveAt,
    recordedAt,
    actorId: parsedTransition.actorId,
    reason: parsedTransition.reason,
    approvalReference: parsedTransition.approvalReference,
    metadata: parsedTransition.metadata,
  };

  return employeeLifecycleStateSchema.parse({
    employeeId: state.employeeId,
    companyId: state.companyId ?? undefined,
    tenantId: state.tenantId ?? undefined,
    currentStage: parsedTransition.toStage,
    currentStageEffectiveAt: effectiveAt,
    currentStageSequence: sequence,
    history: [...state.history, entry],
    createdAt: state.createdAt,
    updatedAt: recordedAt,
  });
}

export const employeeLifecycleOnboardingTaskCodeValues = [
  "document_verification",
  "department_orientation",
  "employment_type_review",
  "legal_entity_setup",
  "location_orientation",
  "policy_acknowledgment",
  "role_enablement",
  "welcome_packet",
] as const;

export type EmployeeLifecycleOnboardingTaskCodeValue =
  (typeof employeeLifecycleOnboardingTaskCodeValues)[number];

export const employeeLifecycleOnboardingTaskStatusValues = [
  "pending",
  "completed",
] as const;

export type EmployeeLifecycleOnboardingTaskStatusValue =
  (typeof employeeLifecycleOnboardingTaskStatusValues)[number];

export const employeeLifecycleOnboardingWorkflowStatusValues = [
  "in_progress",
  "ready_for_activation",
  "activated",
] as const;

export type EmployeeLifecycleOnboardingWorkflowStatusValue =
  (typeof employeeLifecycleOnboardingWorkflowStatusValues)[number];

export const employeeLifecycleOnboardingEventKindValues = [
  "started",
  "task_completed",
  "ready_for_activation",
  "activated",
] as const;

export type EmployeeLifecycleOnboardingEventKindValue =
  (typeof employeeLifecycleOnboardingEventKindValues)[number];

export const employeeLifecycleOnboardingProfileSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  employmentType: employeeLifecycleOptionalTrimmedStringSchema,
  legalEntityCode: employeeLifecycleOptionalTrimmedStringSchema,
  departmentId: employeeLifecycleOptionalTrimmedStringSchema,
  workLocationCode: employeeLifecycleOptionalTrimmedStringSchema,
  roleTitle: employeeLifecycleOptionalTrimmedStringSchema,
  roleCode: employeeLifecycleOptionalTrimmedStringSchema,
});

export const employeeLifecycleOnboardingTaskSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  employeeId: employeeLifecycleTrimmedStringSchema,
  code: z.enum(employeeLifecycleOnboardingTaskCodeValues),
  title: employeeLifecycleTrimmedStringSchema,
  required: z.boolean(),
  status: z.enum(employeeLifecycleOnboardingTaskStatusValues),
  documentReferenceId: employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  policyAcknowledgmentId:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  notes: z.string().trim().nullable().optional(),
  completedBy: employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  completedAt: employeeLifecycleDateSchema.nullish(),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleOnboardingEventSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  event: z.enum(employeeLifecycleOnboardingEventKindValues),
  taskCode: z.enum(employeeLifecycleOnboardingTaskCodeValues).nullish(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleOnboardingRecordSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  workflowStatus: z.enum(employeeLifecycleOnboardingWorkflowStatusValues),
  tasks: z.array(employeeLifecycleOnboardingTaskSchema),
  events: z.array(employeeLifecycleOnboardingEventSchema),
  startedAt: employeeLifecycleDateSchema,
  readyAt: employeeLifecycleDateSchema.nullish(),
  activatedAt: employeeLifecycleDateSchema.nullish(),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleOnboardingReadModelSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  lifecycleStage: employeeLifecycleStageSchema,
  workflowStatus: z.enum(employeeLifecycleOnboardingWorkflowStatusValues),
  totalTasks: z.number().int().nonnegative(),
  completedTasks: z.number().int().nonnegative(),
  requiredTasks: z.number().int().nonnegative(),
  remainingRequiredTasks: z.number().int().nonnegative(),
  isReadyForActivation: z.boolean(),
  isActivated: z.boolean(),
  startedAt: employeeLifecycleDateSchema,
  readyAt: employeeLifecycleDateSchema.nullish(),
  activatedAt: employeeLifecycleDateSchema.nullish(),
  tasks: z.array(employeeLifecycleOnboardingTaskSchema),
  events: z.array(employeeLifecycleOnboardingEventSchema),
});

export type EmployeeLifecycleOnboardingProfile = z.infer<
  typeof employeeLifecycleOnboardingProfileSchema
>;
export type EmployeeLifecycleOnboardingTask = z.infer<
  typeof employeeLifecycleOnboardingTaskSchema
>;
export type EmployeeLifecycleOnboardingEvent = z.infer<
  typeof employeeLifecycleOnboardingEventSchema
>;
export type EmployeeLifecycleOnboardingRecord = z.infer<
  typeof employeeLifecycleOnboardingRecordSchema
>;
export type EmployeeLifecycleOnboardingReadModel = z.infer<
  typeof employeeLifecycleOnboardingReadModelSchema
>;

export function generateEmployeeLifecycleOnboardingTaskDefinitions(
  profile: EmployeeLifecycleOnboardingProfile
): readonly {
  code: EmployeeLifecycleOnboardingTaskCodeValue;
  title: string;
  required: boolean;
}[] {
  const definitions: Array<{
    code: EmployeeLifecycleOnboardingTaskCodeValue;
    title: string;
    required: boolean;
  }> = [
    {
      code: "welcome_packet",
      title: "Review welcome packet",
      required: true,
    },
    {
      code: "document_verification",
      title: "Verify onboarding documents",
      required: true,
    },
    {
      code: "policy_acknowledgment",
      title: "Acknowledge onboarding policies",
      required: true,
    },
  ];

  if (profile.employmentType) {
    definitions.push({
      code: "employment_type_review",
      title: `Review employment type: ${profile.employmentType}`,
      required: true,
    });
  }

  if (profile.legalEntityCode) {
    definitions.push({
      code: "legal_entity_setup",
      title: `Confirm legal entity: ${profile.legalEntityCode}`,
      required: true,
    });
  }

  if (profile.departmentId) {
    definitions.push({
      code: "department_orientation",
      title: `Complete department orientation: ${profile.departmentId}`,
      required: true,
    });
  }

  if (profile.workLocationCode) {
    definitions.push({
      code: "location_orientation",
      title: `Complete location orientation: ${profile.workLocationCode}`,
      required: true,
    });
  }

  if (profile.roleTitle || profile.roleCode) {
    definitions.push({
      code: "role_enablement",
      title: `Complete role enablement${profile.roleTitle ? ` for ${profile.roleTitle}` : ""}`,
      required: true,
    });
  }

  return definitions;
}

function buildEmployeeLifecycleOnboardingTaskId(
  employeeId: string,
  code: EmployeeLifecycleOnboardingTaskCodeValue
): string {
  return `${employeeId}:${code}`;
}

function buildEmployeeLifecycleOnboardingEventId(
  employeeId: string,
  sequence: number,
  event: EmployeeLifecycleOnboardingEventKindValue
): string {
  return `${employeeId}:onboarding:${sequence}:${event}`;
}

function buildEmployeeLifecycleOnboardingTask(
  profile: EmployeeLifecycleOnboardingProfile,
  definition: Readonly<{
    code: EmployeeLifecycleOnboardingTaskCodeValue;
    title: string;
    required: boolean;
  }>,
  timestamps: Readonly<{ createdAt: Date; updatedAt: Date }>
): EmployeeLifecycleOnboardingTask {
  return employeeLifecycleOnboardingTaskSchema.parse({
    id: buildEmployeeLifecycleOnboardingTaskId(
      profile.employeeId,
      definition.code
    ),
    employeeId: profile.employeeId,
    code: definition.code,
    title: definition.title,
    required: definition.required,
    status: "pending",
    documentReferenceId: null,
    policyAcknowledgmentId: null,
    notes: null,
    completedBy: null,
    completedAt: null,
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  });
}

function buildEmployeeLifecycleOnboardingEvent(
  input: Readonly<{
    employeeId: string;
    event: EmployeeLifecycleOnboardingEventKindValue;
    sequence: number;
    actorId?: string | null;
    taskCode?: EmployeeLifecycleOnboardingTaskCodeValue | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }>
): EmployeeLifecycleOnboardingEvent {
  return employeeLifecycleOnboardingEventSchema.parse({
    id: buildEmployeeLifecycleOnboardingEventId(
      input.employeeId,
      input.sequence,
      input.event
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    event: input.event,
    taskCode: input.taskCode ?? null,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt,
  });
}

export function createEmployeeLifecycleOnboardingRecord(
  profile: EmployeeLifecycleOnboardingProfile,
  input?: Readonly<{
    actorId?: string | null;
    reason?: string | null;
    startedAt?: Date;
    recordedAt?: Date;
  }>
): EmployeeLifecycleOnboardingRecord {
  const parsedProfile = employeeLifecycleOnboardingProfileSchema.parse(profile);
  const startedAt = input?.startedAt ?? new Date();
  const recordedAt = input?.recordedAt ?? startedAt;
  const tasks = generateEmployeeLifecycleOnboardingTaskDefinitions(
    parsedProfile
  ).map((definition) =>
    buildEmployeeLifecycleOnboardingTask(parsedProfile, definition, {
      createdAt: startedAt,
      updatedAt: recordedAt,
    })
  );

  return employeeLifecycleOnboardingRecordSchema.parse({
    id: `${parsedProfile.employeeId}:onboarding`,
    employeeId: parsedProfile.employeeId,
    companyId: parsedProfile.companyId ?? undefined,
    tenantId: parsedProfile.tenantId ?? undefined,
    workflowStatus: "in_progress",
    tasks,
    events: [
      buildEmployeeLifecycleOnboardingEvent({
        employeeId: parsedProfile.employeeId,
        event: "started",
        sequence: 0,
        actorId: input?.actorId ?? undefined,
        reason: input?.reason ?? null,
        metadata: {
          employmentType: parsedProfile.employmentType ?? null,
          legalEntityCode: parsedProfile.legalEntityCode ?? null,
          departmentId: parsedProfile.departmentId ?? null,
          workLocationCode: parsedProfile.workLocationCode ?? null,
          roleTitle: parsedProfile.roleTitle ?? null,
          roleCode: parsedProfile.roleCode ?? null,
          taskCodes: tasks.map((task) => task.code),
        },
        createdAt: recordedAt,
      }),
    ],
    startedAt,
    readyAt: null,
    activatedAt: null,
    createdAt: recordedAt,
    updatedAt: recordedAt,
  });
}

function recalculateEmployeeLifecycleOnboardingStatus(
  record: EmployeeLifecycleOnboardingRecord
): EmployeeLifecycleOnboardingRecord {
  const completedRequiredTasks = record.tasks.filter(
    (task) => task.required && task.status === "completed"
  );
  const requiredTasks = record.tasks.filter((task) => task.required);
  const isReadyForActivation =
    requiredTasks.length > 0 &&
    completedRequiredTasks.length === requiredTasks.length;
  let workflowStatus: EmployeeLifecycleOnboardingWorkflowStatusValue =
    "in_progress";

  if (record.activatedAt) {
    workflowStatus = "activated";
  } else if (isReadyForActivation) {
    workflowStatus = "ready_for_activation";
  }

  return employeeLifecycleOnboardingRecordSchema.parse({
    ...record,
    workflowStatus,
    readyAt:
      workflowStatus === "ready_for_activation" ||
      workflowStatus === "activated"
        ? (record.readyAt ?? record.updatedAt)
        : null,
  });
}

export function isEmployeeLifecycleOnboardingReady(
  record: EmployeeLifecycleOnboardingRecord
): boolean {
  return (
    record.workflowStatus === "ready_for_activation" ||
    record.workflowStatus === "activated"
  );
}

export function completeEmployeeLifecycleOnboardingRecordTask(
  record: EmployeeLifecycleOnboardingRecord,
  input: Readonly<{
    taskCode: EmployeeLifecycleOnboardingTaskCodeValue;
    actorId?: string | null;
    completedAt?: Date;
    documentReferenceId?: string | null;
    policyAcknowledgmentId?: string | null;
    notes?: string | null;
    reason?: string | null;
  }>
): EmployeeLifecycleOnboardingRecord {
  const parsedRecord = employeeLifecycleOnboardingRecordSchema.parse(record);
  const completedAt = input.completedAt ?? new Date();
  const index = parsedRecord.tasks.findIndex(
    (task) => task.code === input.taskCode
  );

  if (index < 0) {
    throw new Error(
      `Onboarding task ${input.taskCode} was not found for employee ${parsedRecord.employeeId}.`
    );
  }

  const nextTasks = [...parsedRecord.tasks];
  const currentTask = nextTasks[index];
  nextTasks[index] = employeeLifecycleOnboardingTaskSchema.parse({
    ...currentTask,
    status: "completed",
    documentReferenceId:
      input.documentReferenceId ?? currentTask.documentReferenceId ?? null,
    policyAcknowledgmentId:
      input.policyAcknowledgmentId ??
      currentTask.policyAcknowledgmentId ??
      null,
    notes: input.notes ?? currentTask.notes ?? null,
    completedBy: input.actorId ?? currentTask.completedBy ?? null,
    completedAt,
    updatedAt: completedAt,
  });

  const nextEvents = [
    ...parsedRecord.events,
    buildEmployeeLifecycleOnboardingEvent({
      employeeId: parsedRecord.employeeId,
      event: "task_completed",
      sequence: parsedRecord.events.length,
      actorId: input.actorId ?? undefined,
      taskCode: input.taskCode,
      reason: input.reason ?? null,
      metadata: {
        documentReferenceId: input.documentReferenceId ?? null,
        policyAcknowledgmentId: input.policyAcknowledgmentId ?? null,
        notes: input.notes ?? null,
      },
      createdAt: completedAt,
    }),
  ];

  let nextRecord = employeeLifecycleOnboardingRecordSchema.parse({
    ...parsedRecord,
    tasks: nextTasks,
    events: nextEvents,
    updatedAt: completedAt,
  });

  nextRecord = recalculateEmployeeLifecycleOnboardingStatus(nextRecord);

  if (
    nextRecord.workflowStatus === "ready_for_activation" &&
    parsedRecord.workflowStatus !== "ready_for_activation"
  ) {
    nextRecord = employeeLifecycleOnboardingRecordSchema.parse({
      ...nextRecord,
      readyAt: nextRecord.readyAt ?? completedAt,
      events: [
        ...nextRecord.events,
        buildEmployeeLifecycleOnboardingEvent({
          employeeId: nextRecord.employeeId,
          event: "ready_for_activation",
          sequence: nextRecord.events.length,
          actorId: input.actorId ?? undefined,
          reason: input.reason ?? null,
          metadata: {
            requiredTasks: nextRecord.tasks.filter((task) => task.required)
              .length,
            completedTasks: nextRecord.tasks.filter(
              (task) => task.required && task.status === "completed"
            ).length,
          },
          createdAt: completedAt,
        }),
      ],
      updatedAt: completedAt,
    });
  }

  return nextRecord;
}

export function activateEmployeeLifecycleOnboardingRecord(
  record: EmployeeLifecycleOnboardingRecord,
  input?: Readonly<{
    actorId?: string | null;
    activatedAt?: Date;
    reason?: string | null;
  }>
): EmployeeLifecycleOnboardingRecord {
  const parsedRecord = employeeLifecycleOnboardingRecordSchema.parse(record);
  if (parsedRecord.workflowStatus === "activated") {
    return parsedRecord;
  }

  if (!isEmployeeLifecycleOnboardingReady(parsedRecord)) {
    throw new Error(
      `Employee ${parsedRecord.employeeId} is not ready for onboarding activation.`
    );
  }

  const activatedAt = input?.activatedAt ?? new Date();

  return employeeLifecycleOnboardingRecordSchema.parse({
    ...parsedRecord,
    workflowStatus: "activated",
    readyAt: parsedRecord.readyAt ?? activatedAt,
    activatedAt,
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleOnboardingEvent({
        employeeId: parsedRecord.employeeId,
        event: "activated",
        sequence: parsedRecord.events.length,
        actorId: input?.actorId ?? undefined,
        reason: input?.reason ?? null,
        metadata: {
          taskCodes: parsedRecord.tasks.map((task) => task.code),
        },
        createdAt: activatedAt,
      }),
    ],
    updatedAt: activatedAt,
  });
}

export function buildEmployeeLifecycleOnboardingReadModel(
  input: Readonly<{
    state: EmployeeLifecycleState | null;
    record?: EmployeeLifecycleOnboardingRecord | null;
  }>
): EmployeeLifecycleOnboardingReadModel | null {
  if (!input.state) {
    return null;
  }

  const record = input.record
    ? employeeLifecycleOnboardingRecordSchema.parse(input.record)
    : null;
  const tasks = record?.tasks ?? [];
  const requiredTasks = tasks.filter((task) => task.required).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const remainingRequiredTasks = tasks.filter(
    (task) => task.required && task.status !== "completed"
  ).length;

  return employeeLifecycleOnboardingReadModelSchema.parse({
    employeeId: input.state.employeeId,
    companyId: record?.companyId ?? input.state.companyId ?? undefined,
    tenantId: record?.tenantId ?? input.state.tenantId ?? undefined,
    lifecycleStage: input.state.currentStage,
    workflowStatus: record?.workflowStatus ?? "in_progress",
    totalTasks: tasks.length,
    completedTasks,
    requiredTasks,
    remainingRequiredTasks,
    isReadyForActivation:
      record?.workflowStatus === "ready_for_activation" ||
      record?.workflowStatus === "activated",
    isActivated: record?.workflowStatus === "activated",
    startedAt: record?.startedAt ?? input.state.currentStageEffectiveAt,
    readyAt: record?.readyAt ?? null,
    activatedAt: record?.activatedAt ?? null,
    tasks,
    events: record?.events ?? [],
  });
}

export const employeeLifecycleProbationReviewOutcomeValues = [
  "confirm",
  "extend",
  "termination_recommended",
] as const;

export type EmployeeLifecycleProbationReviewOutcomeValue =
  (typeof employeeLifecycleProbationReviewOutcomeValues)[number];

export const employeeLifecycleProbationStatusValues = [
  "scheduled",
  "extended",
  "confirmation_pending",
  "confirmed",
  "termination_recommended",
] as const;

export type EmployeeLifecycleProbationStatusValue =
  (typeof employeeLifecycleProbationStatusValues)[number];

export const employeeLifecycleProbationEventKindValues = [
  "started",
  "review_scheduled",
  "review_recorded",
  "extended",
  "confirmation_approved",
  "termination_recommended",
] as const;

export type EmployeeLifecycleProbationEventKindValue =
  (typeof employeeLifecycleProbationEventKindValues)[number];

export const employeeLifecycleProbationStartInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  reviewDueAt: employeeLifecycleDateSchema,
  scheduledEndAt: employeeLifecycleDateSchema.nullish(),
  startedAt: employeeLifecycleDateSchema.optional(),
  recordedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleProbationReviewInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  outcome: z.enum(employeeLifecycleProbationReviewOutcomeValues),
  reviewedAt: employeeLifecycleDateSchema.optional(),
  nextReviewDueAt: employeeLifecycleDateSchema.nullish(),
  scheduledEndAt: employeeLifecycleDateSchema.nullish(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleProbationApprovalInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  approvedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  approvalReference: z.string().trim().min(1),
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleProbationExtensionInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  extendedAt: employeeLifecycleDateSchema.optional(),
  nextReviewDueAt: employeeLifecycleDateSchema,
  scheduledEndAt: employeeLifecycleDateSchema.nullish(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleProbationReviewEntrySchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  outcome: z.enum(employeeLifecycleProbationReviewOutcomeValues),
  reviewedAt: employeeLifecycleDateSchema,
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  nextReviewDueAt: employeeLifecycleDateSchema.nullish(),
  scheduledEndAt: employeeLifecycleDateSchema.nullish(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleProbationEventSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  event: z.enum(employeeLifecycleProbationEventKindValues),
  reviewOutcome: z
    .enum(employeeLifecycleProbationReviewOutcomeValues)
    .nullish(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  reviewDueAt: employeeLifecycleDateSchema.nullish(),
  scheduledEndAt: employeeLifecycleDateSchema.nullish(),
  nextReviewDueAt: employeeLifecycleDateSchema.nullish(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleProbationRecordSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  workflowStatus: z.enum(employeeLifecycleProbationStatusValues),
  startedAt: employeeLifecycleDateSchema,
  reviewDueAt: employeeLifecycleDateSchema,
  scheduledEndAt: employeeLifecycleDateSchema,
  extensionCount: z.number().int().nonnegative(),
  lastReviewAt: employeeLifecycleDateSchema.nullish(),
  lastReviewOutcome: z
    .enum(employeeLifecycleProbationReviewOutcomeValues)
    .nullish(),
  confirmationApprovedAt: employeeLifecycleDateSchema.nullish(),
  confirmationApprovalReference:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  confirmationApprovedBy:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  reviewHistory: z.array(employeeLifecycleProbationReviewEntrySchema),
  events: z.array(employeeLifecycleProbationEventSchema),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleProbationReadModelSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  lifecycleStage: employeeLifecycleStageSchema,
  workflowStatus: z.enum(employeeLifecycleProbationStatusValues),
  startedAt: employeeLifecycleDateSchema,
  reviewDueAt: employeeLifecycleDateSchema,
  scheduledEndAt: employeeLifecycleDateSchema,
  extensionCount: z.number().int().nonnegative(),
  lastReviewAt: employeeLifecycleDateSchema.nullish(),
  lastReviewOutcome: z
    .enum(employeeLifecycleProbationReviewOutcomeValues)
    .nullish(),
  confirmationApprovedAt: employeeLifecycleDateSchema.nullish(),
  confirmationApprovalReference:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  confirmationApprovedBy:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  reviewHistory: z.array(employeeLifecycleProbationReviewEntrySchema),
  events: z.array(employeeLifecycleProbationEventSchema),
  isReviewDue: z.boolean(),
  isOverdue: z.boolean(),
});

export type EmployeeLifecycleProbationStartInput = z.infer<
  typeof employeeLifecycleProbationStartInputSchema
>;
export type EmployeeLifecycleProbationReviewInput = z.infer<
  typeof employeeLifecycleProbationReviewInputSchema
>;
export type EmployeeLifecycleProbationApprovalInput = z.infer<
  typeof employeeLifecycleProbationApprovalInputSchema
>;
export type EmployeeLifecycleProbationExtensionInput = z.infer<
  typeof employeeLifecycleProbationExtensionInputSchema
>;
export type EmployeeLifecycleProbationReviewEntry = z.infer<
  typeof employeeLifecycleProbationReviewEntrySchema
>;
export type EmployeeLifecycleProbationEvent = z.infer<
  typeof employeeLifecycleProbationEventSchema
>;
export type EmployeeLifecycleProbationRecord = z.infer<
  typeof employeeLifecycleProbationRecordSchema
>;
export type EmployeeLifecycleProbationReadModel = z.infer<
  typeof employeeLifecycleProbationReadModelSchema
>;

function buildEmployeeLifecycleProbationReviewEntryId(
  employeeId: string,
  sequence: number,
  outcome: EmployeeLifecycleProbationReviewOutcomeValue
): string {
  return `${employeeId}:probation-review:${sequence}:${outcome}`;
}

function buildEmployeeLifecycleProbationEventId(
  employeeId: string,
  sequence: number,
  event: EmployeeLifecycleProbationEventKindValue
): string {
  return `${employeeId}:probation:${sequence}:${event}`;
}

function buildEmployeeLifecycleProbationEvent(
  input: Readonly<{
    employeeId: string;
    event: EmployeeLifecycleProbationEventKindValue;
    sequence: number;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    reviewOutcome?: EmployeeLifecycleProbationReviewOutcomeValue | null;
    reviewDueAt?: Date | null;
    scheduledEndAt?: Date | null;
    nextReviewDueAt?: Date | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }>
): EmployeeLifecycleProbationEvent {
  return employeeLifecycleProbationEventSchema.parse({
    id: buildEmployeeLifecycleProbationEventId(
      input.employeeId,
      input.sequence,
      input.event
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    event: input.event,
    reviewOutcome: input.reviewOutcome ?? null,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    reviewDueAt: input.reviewDueAt ?? null,
    scheduledEndAt: input.scheduledEndAt ?? null,
    nextReviewDueAt: input.nextReviewDueAt ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt,
  });
}

function assertEmployeeLifecycleProbationDateOrder(
  input: Readonly<{
    startedAt: Date;
    reviewDueAt: Date;
    scheduledEndAt: Date;
  }>
): void {
  if (input.reviewDueAt.getTime() < input.startedAt.getTime()) {
    throw new Error(
      "Probation review due date cannot be before probation start."
    );
  }

  if (input.scheduledEndAt.getTime() < input.reviewDueAt.getTime()) {
    throw new Error("Probation end date cannot be before the review due date.");
  }
}

export function createEmployeeLifecycleProbationRecord(
  input: EmployeeLifecycleProbationStartInput
): EmployeeLifecycleProbationRecord {
  const parsedInput = employeeLifecycleProbationStartInputSchema.parse(input);
  const startedAt = parsedInput.startedAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? startedAt;
  const reviewDueAt = parsedInput.reviewDueAt;
  const scheduledEndAt = parsedInput.scheduledEndAt ?? reviewDueAt;

  assertEmployeeLifecycleProbationDateOrder({
    startedAt,
    reviewDueAt,
    scheduledEndAt,
  });

  const reviewScheduleEvent = buildEmployeeLifecycleProbationEvent({
    employeeId: parsedInput.employeeId,
    event: "review_scheduled",
    sequence: 1,
    actorId: parsedInput.actorId ?? undefined,
    reason: parsedInput.reason ?? null,
    reviewDueAt,
    scheduledEndAt,
    metadata: parsedInput.metadata ?? {},
    createdAt: recordedAt,
  });

  return employeeLifecycleProbationRecordSchema.parse({
    id: `${parsedInput.employeeId}:probation`,
    employeeId: parsedInput.employeeId,
    companyId: parsedInput.companyId ?? undefined,
    tenantId: parsedInput.tenantId ?? undefined,
    workflowStatus: "scheduled",
    startedAt,
    reviewDueAt,
    scheduledEndAt,
    extensionCount: 0,
    lastReviewAt: null,
    lastReviewOutcome: null,
    confirmationApprovedAt: null,
    confirmationApprovalReference: null,
    confirmationApprovedBy: null,
    reviewHistory: [],
    events: [
      buildEmployeeLifecycleProbationEvent({
        employeeId: parsedInput.employeeId,
        event: "started",
        sequence: 0,
        actorId: parsedInput.actorId ?? undefined,
        reason: parsedInput.reason ?? null,
        reviewDueAt,
        scheduledEndAt,
        metadata: {
          ...(parsedInput.metadata ?? {}),
          probationStartAt: startedAt.toISOString(),
        },
        createdAt: recordedAt,
      }),
      reviewScheduleEvent,
    ],
    createdAt: recordedAt,
    updatedAt: recordedAt,
  });
}

export function isEmployeeLifecycleProbationReviewDue(
  record: EmployeeLifecycleProbationRecord,
  at: Date = new Date()
): boolean {
  const parsedRecord = employeeLifecycleProbationRecordSchema.parse(record);

  return (
    parsedRecord.workflowStatus !== "confirmed" &&
    parsedRecord.workflowStatus !== "termination_recommended" &&
    parsedRecord.reviewDueAt.getTime() <= at.getTime()
  );
}

function recalculateEmployeeLifecycleProbationRecord(
  record: EmployeeLifecycleProbationRecord
): EmployeeLifecycleProbationRecord {
  return employeeLifecycleProbationRecordSchema.parse(record);
}

function buildEmployeeLifecycleProbationReviewRecordedEvent(
  input: Readonly<{
    employeeId: string;
    sequence: number;
    reviewedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    outcome: EmployeeLifecycleProbationReviewOutcomeValue;
    reviewDueAt: Date;
    scheduledEndAt: Date;
    nextReviewDueAt?: Date | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleProbationEvent {
  return buildEmployeeLifecycleProbationEvent({
    employeeId: input.employeeId,
    event: "review_recorded",
    sequence: input.sequence,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    reviewOutcome: input.outcome,
    reviewDueAt: input.reviewDueAt,
    scheduledEndAt: input.scheduledEndAt,
    nextReviewDueAt: input.nextReviewDueAt ?? null,
    notes: input.notes ?? null,
    metadata: {
      ...(input.metadata ?? {}),
      reviewOutcome: input.outcome,
    },
    createdAt: input.reviewedAt,
  });
}

function buildEmployeeLifecycleProbationReviewBaseRecord(
  record: EmployeeLifecycleProbationRecord,
  input: Readonly<{
    reviewedAt: Date;
    reviewHistoryEntry: EmployeeLifecycleProbationReviewEntry;
    reviewRecordedEvent: EmployeeLifecycleProbationEvent;
    outcome: EmployeeLifecycleProbationReviewOutcomeValue;
  }>
): EmployeeLifecycleProbationRecord {
  return employeeLifecycleProbationRecordSchema.parse({
    ...record,
    reviewHistory: [...record.reviewHistory, input.reviewHistoryEntry],
    events: [...record.events, input.reviewRecordedEvent],
    lastReviewAt: input.reviewedAt,
    lastReviewOutcome: input.outcome,
    updatedAt: input.reviewedAt,
  });
}

function applyEmployeeLifecycleProbationConfirmationReviewOutcome(
  record: EmployeeLifecycleProbationRecord
): EmployeeLifecycleProbationRecord {
  return employeeLifecycleProbationRecordSchema.parse({
    ...record,
    workflowStatus: "confirmation_pending",
  });
}

function applyEmployeeLifecycleProbationTerminationReviewOutcome(
  record: EmployeeLifecycleProbationRecord,
  input: Readonly<{
    reviewedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleProbationRecord {
  return employeeLifecycleProbationRecordSchema.parse({
    ...record,
    workflowStatus: "termination_recommended",
    events: [
      ...record.events,
      buildEmployeeLifecycleProbationEvent({
        employeeId: record.employeeId,
        event: "termination_recommended",
        sequence: record.events.length,
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        reviewOutcome: "termination_recommended",
        reviewDueAt: record.reviewDueAt,
        scheduledEndAt: record.scheduledEndAt,
        metadata: {
          ...(input.metadata ?? {}),
          reviewOutcome: "termination_recommended",
        },
        createdAt: input.reviewedAt,
      }),
    ],
    updatedAt: input.reviewedAt,
  });
}

function applyEmployeeLifecycleProbationExtensionReviewOutcome(
  record: EmployeeLifecycleProbationRecord,
  input: Readonly<{
    reviewedAt: Date;
    nextReviewDueAt?: Date | null;
    scheduledEndAt?: Date | null;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleProbationRecord {
  if (!input.nextReviewDueAt) {
    throw new Error("Extending probation requires a next review due date.");
  }

  const scheduledEndAt = input.scheduledEndAt ?? input.nextReviewDueAt;
  assertEmployeeLifecycleProbationDateOrder({
    startedAt: record.startedAt,
    reviewDueAt: input.nextReviewDueAt,
    scheduledEndAt,
  });

  return employeeLifecycleProbationRecordSchema.parse({
    ...record,
    workflowStatus: "extended",
    reviewDueAt: input.nextReviewDueAt,
    scheduledEndAt,
    extensionCount: record.extensionCount + 1,
    events: [
      ...record.events,
      buildEmployeeLifecycleProbationEvent({
        employeeId: record.employeeId,
        event: "extended",
        sequence: record.events.length,
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        reviewOutcome: "extend",
        reviewDueAt: record.reviewDueAt,
        scheduledEndAt,
        nextReviewDueAt: input.nextReviewDueAt,
        notes: input.notes ?? null,
        metadata: {
          ...(input.metadata ?? {}),
          previousReviewDueAt: record.reviewDueAt.toISOString(),
          nextReviewDueAt: input.nextReviewDueAt.toISOString(),
        },
        createdAt: input.reviewedAt,
      }),
    ],
    updatedAt: input.reviewedAt,
  });
}

function assertEmployeeLifecycleProbationReviewOutcomeDates(
  input: EmployeeLifecycleProbationReviewInput
): void {
  if (
    input.outcome === "extend" ||
    !(input.nextReviewDueAt || input.scheduledEndAt)
  ) {
    return;
  }

  throw new Error(
    "Only probation extensions can change the next review or end dates."
  );
}

const employeeLifecycleProbationReviewOutcomeAppliers: Readonly<
  Record<
    EmployeeLifecycleProbationReviewOutcomeValue,
    (
      record: EmployeeLifecycleProbationRecord,
      input: EmployeeLifecycleProbationReviewInput,
      reviewedAt: Date
    ) => EmployeeLifecycleProbationRecord
  >
> = {
  confirm: (
    record: EmployeeLifecycleProbationRecord
  ): EmployeeLifecycleProbationRecord =>
    recalculateEmployeeLifecycleProbationRecord(
      applyEmployeeLifecycleProbationConfirmationReviewOutcome(record)
    ),
  extend: (
    record: EmployeeLifecycleProbationRecord,
    input: EmployeeLifecycleProbationReviewInput,
    reviewedAt: Date
  ): EmployeeLifecycleProbationRecord =>
    recalculateEmployeeLifecycleProbationRecord(
      applyEmployeeLifecycleProbationExtensionReviewOutcome(record, {
        reviewedAt,
        nextReviewDueAt: input.nextReviewDueAt ?? null,
        scheduledEndAt: input.scheduledEndAt ?? null,
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        notes: input.notes ?? null,
        metadata: input.metadata ?? {},
      })
    ),
  termination_recommended: (
    record: EmployeeLifecycleProbationRecord,
    input: EmployeeLifecycleProbationReviewInput,
    reviewedAt: Date
  ): EmployeeLifecycleProbationRecord =>
    recalculateEmployeeLifecycleProbationRecord(
      applyEmployeeLifecycleProbationTerminationReviewOutcome(record, {
        reviewedAt,
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        metadata: input.metadata ?? {},
      })
    ),
} as const;

function applyEmployeeLifecycleProbationReviewOutcome(
  record: EmployeeLifecycleProbationRecord,
  input: EmployeeLifecycleProbationReviewInput,
  reviewedAt: Date
): EmployeeLifecycleProbationRecord {
  assertEmployeeLifecycleProbationReviewOutcomeDates(input);

  const reviewHistoryEntry = employeeLifecycleProbationReviewEntrySchema.parse({
    id: buildEmployeeLifecycleProbationReviewEntryId(
      record.employeeId,
      record.reviewHistory.length,
      input.outcome
    ),
    sequence: record.reviewHistory.length,
    employeeId: record.employeeId,
    outcome: input.outcome,
    reviewedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    nextReviewDueAt: input.nextReviewDueAt ?? null,
    scheduledEndAt: input.scheduledEndAt ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
    createdAt: reviewedAt,
  });

  const nextRecord = buildEmployeeLifecycleProbationReviewBaseRecord(record, {
    reviewedAt,
    reviewHistoryEntry,
    reviewRecordedEvent: buildEmployeeLifecycleProbationReviewRecordedEvent({
      employeeId: record.employeeId,
      sequence: record.events.length,
      reviewedAt,
      actorId: input.actorId ?? undefined,
      reason: input.reason ?? null,
      approvalReference: input.approvalReference ?? null,
      outcome: input.outcome,
      reviewDueAt: record.reviewDueAt,
      scheduledEndAt: record.scheduledEndAt,
      nextReviewDueAt: input.nextReviewDueAt ?? null,
      notes: input.notes ?? null,
      metadata: input.metadata ?? {},
    }),
    outcome: input.outcome,
  });

  return employeeLifecycleProbationReviewOutcomeAppliers[input.outcome](
    nextRecord,
    input,
    reviewedAt
  );
}

export function recordEmployeeLifecycleProbationReviewOutcome(
  record: EmployeeLifecycleProbationRecord,
  input: EmployeeLifecycleProbationReviewInput
): EmployeeLifecycleProbationRecord {
  const parsedRecord = employeeLifecycleProbationRecordSchema.parse(record);
  const parsedInput = employeeLifecycleProbationReviewInputSchema.parse(input);
  const reviewedAt = parsedInput.reviewedAt ?? new Date();
  return applyEmployeeLifecycleProbationReviewOutcome(
    parsedRecord,
    parsedInput,
    reviewedAt
  );
}

export function extendEmployeeLifecycleProbationRecord(
  record: EmployeeLifecycleProbationRecord,
  input: Readonly<
    Omit<EmployeeLifecycleProbationExtensionInput, "employeeId"> & {
      employeeId?: string;
    }
  >
): EmployeeLifecycleProbationRecord {
  const parsedInput = employeeLifecycleProbationExtensionInputSchema.parse({
    ...input,
    employeeId: input.employeeId ?? record.employeeId,
    approvalReference: input.approvalReference ?? undefined,
    notes: input.notes ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  });

  return recordEmployeeLifecycleProbationReviewOutcome(record, {
    employeeId: parsedInput.employeeId,
    outcome: "extend",
    reviewedAt: parsedInput.extendedAt ?? new Date(),
    nextReviewDueAt: parsedInput.nextReviewDueAt,
    scheduledEndAt: parsedInput.scheduledEndAt ?? null,
    actorId: parsedInput.actorId ?? undefined,
    reason: parsedInput.reason ?? null,
    approvalReference: parsedInput.approvalReference ?? null,
    notes: parsedInput.notes ?? null,
    metadata: parsedInput.metadata ?? {},
  });
}

export function approveEmployeeLifecycleProbationConfirmationRecord(
  record: EmployeeLifecycleProbationRecord,
  input: EmployeeLifecycleProbationApprovalInput
): EmployeeLifecycleProbationRecord {
  const parsedRecord = employeeLifecycleProbationRecordSchema.parse(record);
  const parsedInput =
    employeeLifecycleProbationApprovalInputSchema.parse(input);

  if (parsedRecord.workflowStatus === "confirmed") {
    return parsedRecord;
  }

  if (parsedRecord.workflowStatus !== "confirmation_pending") {
    throw new Error(
      `Employee ${parsedRecord.employeeId} is not awaiting probation confirmation approval.`
    );
  }

  const approvedAt = parsedInput.approvedAt ?? new Date();

  return employeeLifecycleProbationRecordSchema.parse({
    ...parsedRecord,
    workflowStatus: "confirmed",
    confirmationApprovedAt: approvedAt,
    confirmationApprovalReference: parsedInput.approvalReference,
    confirmationApprovedBy: parsedInput.actorId ?? undefined,
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleProbationEvent({
        employeeId: parsedRecord.employeeId,
        event: "confirmation_approved",
        sequence: parsedRecord.events.length,
        actorId: parsedInput.actorId ?? undefined,
        reason: parsedInput.reason ?? null,
        approvalReference: parsedInput.approvalReference,
        reviewOutcome: parsedRecord.lastReviewOutcome,
        reviewDueAt: parsedRecord.reviewDueAt,
        scheduledEndAt: parsedRecord.scheduledEndAt,
        metadata: {
          ...(parsedInput.metadata ?? {}),
          approvalReference: parsedInput.approvalReference,
        },
        createdAt: approvedAt,
      }),
    ],
    updatedAt: approvedAt,
  });
}

export function buildEmployeeLifecycleProbationReadModel(
  input: Readonly<{
    state: EmployeeLifecycleState | null;
    record?: EmployeeLifecycleProbationRecord | null;
  }>
): EmployeeLifecycleProbationReadModel | null {
  if (!(input.state && input.record)) {
    return null;
  }

  const record = employeeLifecycleProbationRecordSchema.parse(input.record);
  const now = Date.now();

  return employeeLifecycleProbationReadModelSchema.parse({
    employeeId: input.state.employeeId,
    companyId: record.companyId ?? input.state.companyId ?? undefined,
    tenantId: record.tenantId ?? input.state.tenantId ?? undefined,
    lifecycleStage: input.state.currentStage,
    workflowStatus: record.workflowStatus,
    startedAt: record.startedAt,
    reviewDueAt: record.reviewDueAt,
    scheduledEndAt: record.scheduledEndAt,
    extensionCount: record.extensionCount,
    lastReviewAt: record.lastReviewAt ?? null,
    lastReviewOutcome: record.lastReviewOutcome ?? null,
    confirmationApprovedAt: record.confirmationApprovedAt ?? null,
    confirmationApprovalReference: record.confirmationApprovalReference ?? null,
    confirmationApprovedBy: record.confirmationApprovedBy ?? null,
    reviewHistory: record.reviewHistory,
    events: record.events,
    isReviewDue: isEmployeeLifecycleProbationReviewDue(record),
    isOverdue:
      record.workflowStatus !== "confirmed" &&
      record.workflowStatus !== "termination_recommended" &&
      record.scheduledEndAt.getTime() < now,
  });
}

export const employeeLifecycleMovementKindValues = [
  "promotion",
  "transfer",
  "demotion",
  "job_change",
  "department_change",
  "location_change",
  "manager_change",
  "reporting_line_change",
] as const;

export type EmployeeLifecycleMovementKindValue =
  (typeof employeeLifecycleMovementKindValues)[number];

export const employeeLifecycleMovementFieldValues = [
  "jobTitle",
  "jobCode",
  "gradeCode",
  "departmentId",
  "workLocationCode",
  "managerId",
  "reportingLineId",
] as const;

export type EmployeeLifecycleMovementFieldValue =
  (typeof employeeLifecycleMovementFieldValues)[number];

export const employeeLifecycleMovementEventKindValues = ["recorded"] as const;

export type EmployeeLifecycleMovementEventKindValue =
  (typeof employeeLifecycleMovementEventKindValues)[number];

export const employeeLifecycleAssignmentSnapshotSchema = z.object({
  jobTitle: employeeLifecycleOptionalTrimmedStringSchema,
  jobCode: employeeLifecycleOptionalTrimmedStringSchema,
  gradeCode: employeeLifecycleOptionalTrimmedStringSchema,
  departmentId: employeeLifecycleOptionalTrimmedStringSchema,
  workLocationCode: employeeLifecycleOptionalTrimmedStringSchema,
  managerId: employeeLifecycleOptionalTrimmedStringSchema,
  reportingLineId: employeeLifecycleOptionalTrimmedStringSchema,
});

export const employeeLifecycleMovementEntrySchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  movementKind: z.enum(employeeLifecycleMovementKindValues),
  previousAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  nextAssignment: employeeLifecycleAssignmentSnapshotSchema,
  changeFields: z.array(z.enum(employeeLifecycleMovementFieldValues)),
  effectiveAt: employeeLifecycleDateSchema,
  recordedAt: employeeLifecycleDateSchema,
  appliedAt: employeeLifecycleDateSchema.nullish(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleMovementEventSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  event: z.enum(employeeLifecycleMovementEventKindValues),
  movementKind: z.enum(employeeLifecycleMovementKindValues),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleMovementRecordSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  baselineAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  currentAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  movements: z.array(employeeLifecycleMovementEntrySchema),
  events: z.array(employeeLifecycleMovementEventSchema),
  startedAt: employeeLifecycleDateSchema,
  lastMovementAt: employeeLifecycleDateSchema.nullish(),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleMovementReadModelSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  lifecycleStage: employeeLifecycleStageSchema,
  movementCount: z.number().int().nonnegative(),
  baselineAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  currentAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  pendingAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  latestMovementKind: z.enum(employeeLifecycleMovementKindValues),
  latestMovementAt: employeeLifecycleDateSchema,
  lastAppliedAt: employeeLifecycleDateSchema.nullish(),
  isEffective: z.boolean(),
  isFutureDated: z.boolean(),
  startedAt: employeeLifecycleDateSchema,
  lastMovementAt: employeeLifecycleDateSchema.nullish(),
  latestMovement: employeeLifecycleMovementEntrySchema,
  movements: z.array(employeeLifecycleMovementEntrySchema),
  events: z.array(employeeLifecycleMovementEventSchema),
});

export const employeeLifecycleMovementInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  movementKind: z.enum(employeeLifecycleMovementKindValues),
  previousAssignment: employeeLifecycleAssignmentSnapshotSchema.nullish(),
  nextAssignment: employeeLifecycleAssignmentSnapshotSchema,
  effectiveAt: employeeLifecycleDateSchema.optional(),
  recordedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export type EmployeeLifecycleAssignmentSnapshot = z.infer<
  typeof employeeLifecycleAssignmentSnapshotSchema
>;
export type EmployeeLifecycleMovementEntry = z.infer<
  typeof employeeLifecycleMovementEntrySchema
>;
export type EmployeeLifecycleMovementEvent = z.infer<
  typeof employeeLifecycleMovementEventSchema
>;
export type EmployeeLifecycleMovementRecord = z.infer<
  typeof employeeLifecycleMovementRecordSchema
>;
export type EmployeeLifecycleMovementReadModel = z.infer<
  typeof employeeLifecycleMovementReadModelSchema
>;
export type EmployeeLifecycleMovementInput = z.infer<
  typeof employeeLifecycleMovementInputSchema
>;

function buildEmployeeLifecycleMovementChangeFields(
  previousAssignment: EmployeeLifecycleAssignmentSnapshot | null,
  nextAssignment: EmployeeLifecycleAssignmentSnapshot
): readonly EmployeeLifecycleMovementFieldValue[] {
  const changes: EmployeeLifecycleMovementFieldValue[] = [];

  for (const field of employeeLifecycleMovementFieldValues) {
    if (
      (previousAssignment?.[field] ?? null) !== (nextAssignment[field] ?? null)
    ) {
      changes.push(field);
    }
  }

  return changes;
}

function buildEmployeeLifecycleMovementEntryId(
  employeeId: string,
  sequence: number,
  movementKind: EmployeeLifecycleMovementKindValue
): string {
  return `${employeeId}:movement:${sequence}:${movementKind}`;
}

function buildEmployeeLifecycleMovementEventId(
  employeeId: string,
  sequence: number
): string {
  return `${employeeId}:movement:${sequence}:recorded`;
}

function parseEmployeeLifecycleAssignmentSnapshot(
  snapshot: EmployeeLifecycleAssignmentSnapshot | null | undefined
): EmployeeLifecycleAssignmentSnapshot | null {
  if (snapshot === undefined || snapshot === null) {
    return null;
  }

  return employeeLifecycleAssignmentSnapshotSchema.parse(snapshot);
}

function buildEmployeeLifecycleMovementEvent(
  input: Readonly<{
    employeeId: string;
    sequence: number;
    movementKind: EmployeeLifecycleMovementKindValue;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }>
): EmployeeLifecycleMovementEvent {
  return employeeLifecycleMovementEventSchema.parse({
    id: buildEmployeeLifecycleMovementEventId(input.employeeId, input.sequence),
    sequence: input.sequence,
    employeeId: input.employeeId,
    event: "recorded",
    movementKind: input.movementKind,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt,
  });
}

function buildEmployeeLifecycleMovementEntry(
  input: Readonly<{
    employeeId: string;
    sequence: number;
    movementKind: EmployeeLifecycleMovementKindValue;
    previousAssignment: EmployeeLifecycleAssignmentSnapshot | null;
    nextAssignment: EmployeeLifecycleAssignmentSnapshot;
    effectiveAt: Date;
    recordedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleMovementEntry {
  return employeeLifecycleMovementEntrySchema.parse({
    id: buildEmployeeLifecycleMovementEntryId(
      input.employeeId,
      input.sequence,
      input.movementKind
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    movementKind: input.movementKind,
    previousAssignment: input.previousAssignment ?? null,
    nextAssignment: input.nextAssignment,
    changeFields: buildEmployeeLifecycleMovementChangeFields(
      input.previousAssignment,
      input.nextAssignment
    ),
    effectiveAt: input.effectiveAt,
    recordedAt: input.recordedAt,
    appliedAt:
      input.effectiveAt.getTime() <= input.recordedAt.getTime()
        ? input.recordedAt
        : null,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    metadata: input.metadata ?? {},
  });
}

function ensureEmployeeLifecycleMovementInputsAreConsistent(
  input: Readonly<{
    previousAssignment: EmployeeLifecycleAssignmentSnapshot | null;
    nextAssignment: EmployeeLifecycleAssignmentSnapshot;
    effectiveAt: Date;
    recordedAt: Date;
  }>
): void {
  if (
    input.effectiveAt.getTime() > input.recordedAt.getTime() &&
    input.previousAssignment === null
  ) {
    throw new Error(
      "Scheduled employee movements require a previous assignment snapshot."
    );
  }
}

function buildEmployeeLifecycleMovementRecordFromSeed(
  input: Readonly<{
    employeeId: string;
    companyId?: string | null;
    tenantId?: string | null;
    movementKind: EmployeeLifecycleMovementKindValue;
    previousAssignment: EmployeeLifecycleAssignmentSnapshot | null;
    nextAssignment: EmployeeLifecycleAssignmentSnapshot;
    effectiveAt: Date;
    recordedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleMovementRecord {
  const entry = buildEmployeeLifecycleMovementEntry({
    employeeId: input.employeeId,
    sequence: 0,
    movementKind: input.movementKind,
    previousAssignment: input.previousAssignment,
    nextAssignment: input.nextAssignment,
    effectiveAt: input.effectiveAt,
    recordedAt: input.recordedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    metadata: input.metadata ?? {},
  });

  return employeeLifecycleMovementRecordSchema.parse({
    id: `${input.employeeId}:movement`,
    employeeId: input.employeeId,
    companyId: input.companyId ?? undefined,
    tenantId: input.tenantId ?? undefined,
    baselineAssignment: input.previousAssignment ?? null,
    currentAssignment:
      input.effectiveAt.getTime() <= input.recordedAt.getTime()
        ? input.nextAssignment
        : (input.previousAssignment ?? null),
    movements: [entry],
    events: [
      buildEmployeeLifecycleMovementEvent({
        employeeId: input.employeeId,
        sequence: 0,
        movementKind: input.movementKind,
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        metadata: {
          ...(input.metadata ?? {}),
          changeFields: entry.changeFields,
        },
        createdAt: input.recordedAt,
      }),
    ],
    startedAt: input.recordedAt,
    lastMovementAt: input.recordedAt,
    createdAt: input.recordedAt,
    updatedAt: input.recordedAt,
  });
}

export function createEmployeeLifecycleMovementRecord(
  input: EmployeeLifecycleMovementInput
): EmployeeLifecycleMovementRecord {
  const parsedInput = employeeLifecycleMovementInputSchema.parse(input);
  const effectiveAt = parsedInput.effectiveAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? effectiveAt;
  const previousAssignment = parseEmployeeLifecycleAssignmentSnapshot(
    parsedInput.previousAssignment
  );
  const nextAssignment = employeeLifecycleAssignmentSnapshotSchema.parse(
    parsedInput.nextAssignment
  );

  ensureEmployeeLifecycleMovementInputsAreConsistent({
    previousAssignment,
    nextAssignment,
    effectiveAt,
    recordedAt,
  });

  return buildEmployeeLifecycleMovementRecordFromSeed({
    employeeId: parsedInput.employeeId,
    companyId: parsedInput.companyId,
    tenantId: parsedInput.tenantId,
    movementKind: parsedInput.movementKind,
    previousAssignment,
    nextAssignment,
    effectiveAt,
    recordedAt,
    actorId: parsedInput.actorId ?? undefined,
    reason: parsedInput.reason ?? null,
    approvalReference: parsedInput.approvalReference ?? null,
    metadata: parsedInput.metadata ?? {},
  });
}

function appendEmployeeLifecycleMovementEntry(
  record: EmployeeLifecycleMovementRecord,
  input: EmployeeLifecycleMovementInput
): EmployeeLifecycleMovementRecord {
  const parsedRecord = employeeLifecycleMovementRecordSchema.parse(record);
  const effectiveAt = input.effectiveAt ?? new Date();
  const recordedAt = input.recordedAt ?? effectiveAt;
  const previousAssignment =
    parseEmployeeLifecycleAssignmentSnapshot(input.previousAssignment) ??
    parsedRecord.currentAssignment ??
    parsedRecord.baselineAssignment ??
    null;
  const nextAssignment = employeeLifecycleAssignmentSnapshotSchema.parse(
    input.nextAssignment
  );

  ensureEmployeeLifecycleMovementInputsAreConsistent({
    previousAssignment,
    nextAssignment,
    effectiveAt,
    recordedAt,
  });

  if (
    parsedRecord.currentAssignment &&
    previousAssignment &&
    JSON.stringify(parsedRecord.currentAssignment) !==
      JSON.stringify(previousAssignment)
  ) {
    throw new Error(
      "Employee lifecycle movement previous assignment does not match the current assignment."
    );
  }

  const entry = buildEmployeeLifecycleMovementEntry({
    employeeId: parsedRecord.employeeId,
    sequence: parsedRecord.movements.length,
    movementKind: input.movementKind,
    previousAssignment,
    nextAssignment,
    effectiveAt,
    recordedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    metadata: input.metadata ?? {},
  });

  const isImmediate = effectiveAt.getTime() <= recordedAt.getTime();
  const nextCurrentAssignment = isImmediate
    ? nextAssignment
    : (parsedRecord.currentAssignment ?? previousAssignment);

  return employeeLifecycleMovementRecordSchema.parse({
    ...parsedRecord,
    baselineAssignment:
      parsedRecord.baselineAssignment ?? previousAssignment ?? null,
    currentAssignment: nextCurrentAssignment ?? null,
    movements: [...parsedRecord.movements, entry],
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleMovementEvent({
        employeeId: parsedRecord.employeeId,
        sequence: parsedRecord.events.length,
        movementKind: input.movementKind,
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        metadata: {
          ...(input.metadata ?? {}),
          changeFields: entry.changeFields,
        },
        createdAt: recordedAt,
      }),
    ],
    lastMovementAt: recordedAt,
    updatedAt: recordedAt,
  });
}

export function appendEmployeeLifecycleMovement(
  record: EmployeeLifecycleMovementRecord,
  input: EmployeeLifecycleMovementInput
): EmployeeLifecycleMovementRecord {
  return appendEmployeeLifecycleMovementEntry(record, input);
}

export function buildEmployeeLifecycleMovementReadModel(
  input: Readonly<{
    state: EmployeeLifecycleState | null;
    record?: EmployeeLifecycleMovementRecord | null;
  }>
): EmployeeLifecycleMovementReadModel | null {
  if (!(input.state && input.record)) {
    return null;
  }

  const record = employeeLifecycleMovementRecordSchema.parse(input.record);
  const [latestMovement] = [...record.movements].slice(-1);
  if (!latestMovement) {
    return null;
  }

  const now = Date.now();
  const currentAssignment =
    record.movements.reduce<EmployeeLifecycleAssignmentSnapshot | null>(
      (assignment, movement) => {
        if (movement.effectiveAt.getTime() > now) {
          return assignment;
        }

        return movement.nextAssignment;
      },
      record.baselineAssignment ?? null
    );
  const isEffective = latestMovement.effectiveAt.getTime() <= now;

  return employeeLifecycleMovementReadModelSchema.parse({
    employeeId: input.state.employeeId,
    companyId: record.companyId ?? input.state.companyId ?? undefined,
    tenantId: record.tenantId ?? input.state.tenantId ?? undefined,
    lifecycleStage: input.state.currentStage,
    movementCount: record.movements.length,
    baselineAssignment: record.baselineAssignment ?? null,
    currentAssignment,
    pendingAssignment: isEffective ? null : latestMovement.nextAssignment,
    latestMovementKind: latestMovement.movementKind,
    latestMovementAt: latestMovement.recordedAt,
    lastAppliedAt: latestMovement.appliedAt ?? null,
    isEffective,
    isFutureDated: !isEffective,
    startedAt: record.startedAt,
    lastMovementAt: record.lastMovementAt ?? null,
    latestMovement,
    movements: record.movements,
    events: record.events,
  });
}

export const employeeLifecycleContractReminderKindValues = [
  "review_due",
  "expiry_approaching",
  "expired",
] as const;

export type EmployeeLifecycleContractReminderKindValue =
  (typeof employeeLifecycleContractReminderKindValues)[number];

export const employeeLifecycleContractStatusValues = [
  "active",
  "reminder_due",
  "review_due",
  "expired",
] as const;

export type EmployeeLifecycleContractStatusValue =
  (typeof employeeLifecycleContractStatusValues)[number];

export const employeeLifecycleContractEventKindValues = [
  "started",
  "renewed",
  "review_recorded",
  "reminder_recorded",
] as const;

export type EmployeeLifecycleContractEventKindValue =
  (typeof employeeLifecycleContractEventKindValues)[number];

export const employeeLifecycleContractStartInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  expiryAt: employeeLifecycleDateSchema,
  renewalReviewLeadDays: z.number().int().positive().optional(),
  renewalReminderLeadDays: z.number().int().positive().optional(),
  startedAt: employeeLifecycleDateSchema.optional(),
  recordedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleContractRenewalInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  expiryAt: employeeLifecycleDateSchema,
  renewalReviewLeadDays: z.number().int().positive().optional(),
  renewalReminderLeadDays: z.number().int().positive().optional(),
  renewedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleContractReviewInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  reviewedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleContractReminderInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  reminderKind: z.enum(employeeLifecycleContractReminderKindValues),
  remindedAt: employeeLifecycleDateSchema.optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleContractReviewEntrySchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  reviewedAt: employeeLifecycleDateSchema,
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleContractReminderEntrySchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  reminderKind: z.enum(employeeLifecycleContractReminderKindValues),
  remindedAt: employeeLifecycleDateSchema,
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleContractEventSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  event: z.enum(employeeLifecycleContractEventKindValues),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  reminderKind: z
    .enum(employeeLifecycleContractReminderKindValues)
    .nullable()
    .optional(),
  expiryAt: employeeLifecycleDateSchema.nullish(),
  renewalReviewDueAt: employeeLifecycleDateSchema.nullish(),
  renewalReminderDueAt: employeeLifecycleDateSchema.nullish(),
  notes: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleContractRecordSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  startedAt: employeeLifecycleDateSchema,
  expiryAt: employeeLifecycleDateSchema,
  renewalReviewLeadDays: z.number().int().positive(),
  renewalReminderLeadDays: z.number().int().positive(),
  renewalReviewDueAt: employeeLifecycleDateSchema,
  renewalReminderDueAt: employeeLifecycleDateSchema,
  renewalCount: z.number().int().nonnegative(),
  lastRenewedAt: employeeLifecycleDateSchema.nullish(),
  lastReviewAt: employeeLifecycleDateSchema.nullish(),
  lastReminderAt: employeeLifecycleDateSchema.nullish(),
  reviewHistory: z.array(employeeLifecycleContractReviewEntrySchema),
  reminderHistory: z.array(employeeLifecycleContractReminderEntrySchema),
  events: z.array(employeeLifecycleContractEventSchema),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleContractReadModelSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  lifecycleStage: employeeLifecycleStageSchema,
  contractStatus: z.enum(employeeLifecycleContractStatusValues),
  startedAt: employeeLifecycleDateSchema,
  expiryAt: employeeLifecycleDateSchema,
  renewalReviewLeadDays: z.number().int().positive(),
  renewalReminderLeadDays: z.number().int().positive(),
  renewalReviewDueAt: employeeLifecycleDateSchema,
  renewalReminderDueAt: employeeLifecycleDateSchema,
  renewalCount: z.number().int().nonnegative(),
  lastRenewedAt: employeeLifecycleDateSchema.nullish(),
  lastReviewAt: employeeLifecycleDateSchema.nullish(),
  lastReminderAt: employeeLifecycleDateSchema.nullish(),
  isRenewalDue: z.boolean(),
  isReminderDue: z.boolean(),
  isExpired: z.boolean(),
  reviewHistory: z.array(employeeLifecycleContractReviewEntrySchema),
  reminderHistory: z.array(employeeLifecycleContractReminderEntrySchema),
  events: z.array(employeeLifecycleContractEventSchema),
});

export type EmployeeLifecycleContractStartInput = z.infer<
  typeof employeeLifecycleContractStartInputSchema
>;
export type EmployeeLifecycleContractRenewalInput = z.infer<
  typeof employeeLifecycleContractRenewalInputSchema
>;
export type EmployeeLifecycleContractReviewInput = z.infer<
  typeof employeeLifecycleContractReviewInputSchema
>;
export type EmployeeLifecycleContractReminderInput = z.infer<
  typeof employeeLifecycleContractReminderInputSchema
>;
export type EmployeeLifecycleContractReviewEntry = z.infer<
  typeof employeeLifecycleContractReviewEntrySchema
>;
export type EmployeeLifecycleContractReminderEntry = z.infer<
  typeof employeeLifecycleContractReminderEntrySchema
>;
export type EmployeeLifecycleContractEvent = z.infer<
  typeof employeeLifecycleContractEventSchema
>;
export type EmployeeLifecycleContractRecord = z.infer<
  typeof employeeLifecycleContractRecordSchema
>;
export type EmployeeLifecycleContractReadModel = z.infer<
  typeof employeeLifecycleContractReadModelSchema
>;

const CONTRACT_RENEWAL_REVIEW_LEAD_DAYS = 30;
const CONTRACT_RENEWAL_REMINDER_LEAD_DAYS = 45;

const subtractDays = (value: Date, days: number): Date =>
  new Date(value.getTime() - days * 24 * 60 * 60 * 1000);

const buildEmployeeLifecycleContractReviewEntryId = (
  employeeId: string,
  sequence: number
): string => `${employeeId}:contract-review:${sequence}`;

const buildEmployeeLifecycleContractReminderEntryId = (
  employeeId: string,
  sequence: number,
  reminderKind: EmployeeLifecycleContractReminderKindValue
): string => `${employeeId}:contract-reminder:${sequence}:${reminderKind}`;

const buildEmployeeLifecycleContractEventId = (
  employeeId: string,
  sequence: number,
  event: EmployeeLifecycleContractEventKindValue
): string => `${employeeId}:contract:${sequence}:${event}`;

const buildEmployeeLifecycleContractDueDates = (
  expiryAt: Date,
  renewalReviewLeadDays: number,
  renewalReminderLeadDays: number
): Readonly<{
  renewalReviewDueAt: Date;
  renewalReminderDueAt: Date;
}> => ({
  renewalReviewDueAt: subtractDays(expiryAt, renewalReviewLeadDays),
  renewalReminderDueAt: subtractDays(expiryAt, renewalReminderLeadDays),
});

const ensureEmployeeLifecycleContractLeadDaysAreValid = (
  input: Readonly<{
    renewalReviewLeadDays: number;
    renewalReminderLeadDays: number;
  }>
): void => {
  if (input.renewalReminderLeadDays < input.renewalReviewLeadDays) {
    throw new Error(
      "Contract reminder lead days must be greater than or equal to the review lead days."
    );
  }
};

const ensureEmployeeLifecycleContractDatesAreValid = (
  input: Readonly<{
    startedAt: Date;
    expiryAt: Date;
  }>
): void => {
  if (input.expiryAt.getTime() <= input.startedAt.getTime()) {
    throw new Error("Contract expiry must be after the contract start.");
  }
};

const buildEmployeeLifecycleContractEvent = (
  input: Readonly<{
    employeeId: string;
    sequence: number;
    event: EmployeeLifecycleContractEventKindValue;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    reminderKind?: EmployeeLifecycleContractReminderKindValue | null;
    expiryAt?: Date | null;
    renewalReviewDueAt?: Date | null;
    renewalReminderDueAt?: Date | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }>
): EmployeeLifecycleContractEvent =>
  employeeLifecycleContractEventSchema.parse({
    id: buildEmployeeLifecycleContractEventId(
      input.employeeId,
      input.sequence,
      input.event
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    event: input.event,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    reminderKind: input.reminderKind ?? null,
    expiryAt: input.expiryAt ?? null,
    renewalReviewDueAt: input.renewalReviewDueAt ?? null,
    renewalReminderDueAt: input.renewalReminderDueAt ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt,
  });

const buildEmployeeLifecycleContractReviewEntry = (
  input: Readonly<{
    employeeId: string;
    sequence: number;
    reviewedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    approvalReference?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleContractReviewEntry =>
  employeeLifecycleContractReviewEntrySchema.parse({
    id: buildEmployeeLifecycleContractReviewEntryId(
      input.employeeId,
      input.sequence
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    reviewedAt: input.reviewedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.reviewedAt,
  });

const buildEmployeeLifecycleContractReminderEntry = (
  input: Readonly<{
    employeeId: string;
    sequence: number;
    reminderKind: EmployeeLifecycleContractReminderKindValue;
    remindedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleContractReminderEntry =>
  employeeLifecycleContractReminderEntrySchema.parse({
    id: buildEmployeeLifecycleContractReminderEntryId(
      input.employeeId,
      input.sequence,
      input.reminderKind
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    reminderKind: input.reminderKind,
    remindedAt: input.remindedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
    createdAt: input.remindedAt,
  });

const buildEmployeeLifecycleContractRecordFromSeed = (
  input: Readonly<{
    employeeId: string;
    companyId?: string | null;
    tenantId?: string | null;
    expiryAt: Date;
    renewalReviewLeadDays: number;
    renewalReminderLeadDays: number;
    startedAt: Date;
    recordedAt: Date;
    actorId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleContractRecord => {
  const { renewalReviewDueAt, renewalReminderDueAt } =
    buildEmployeeLifecycleContractDueDates(
      input.expiryAt,
      input.renewalReviewLeadDays,
      input.renewalReminderLeadDays
    );

  return employeeLifecycleContractRecordSchema.parse({
    id: `${input.employeeId}:contract`,
    employeeId: input.employeeId,
    companyId: input.companyId ?? undefined,
    tenantId: input.tenantId ?? undefined,
    startedAt: input.startedAt,
    expiryAt: input.expiryAt,
    renewalReviewLeadDays: input.renewalReviewLeadDays,
    renewalReminderLeadDays: input.renewalReminderLeadDays,
    renewalReviewDueAt,
    renewalReminderDueAt,
    renewalCount: 0,
    lastRenewedAt: null,
    lastReviewAt: null,
    lastReminderAt: null,
    reviewHistory: [],
    reminderHistory: [],
    events: [
      buildEmployeeLifecycleContractEvent({
        employeeId: input.employeeId,
        sequence: 0,
        event: "started",
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        expiryAt: input.expiryAt,
        renewalReviewDueAt,
        renewalReminderDueAt,
        metadata: {
          ...(input.metadata ?? {}),
          renewalReviewLeadDays: input.renewalReviewLeadDays,
          renewalReminderLeadDays: input.renewalReminderLeadDays,
        },
        createdAt: input.recordedAt,
      }),
    ],
    createdAt: input.recordedAt,
    updatedAt: input.recordedAt,
  });
};

export function createEmployeeLifecycleContractRecord(
  input: EmployeeLifecycleContractStartInput
): EmployeeLifecycleContractRecord {
  const parsedInput = employeeLifecycleContractStartInputSchema.parse(input);
  const startedAt = parsedInput.startedAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? startedAt;

  ensureEmployeeLifecycleContractDatesAreValid({
    startedAt,
    expiryAt: parsedInput.expiryAt,
  });

  const renewalReviewLeadDays =
    parsedInput.renewalReviewLeadDays ?? CONTRACT_RENEWAL_REVIEW_LEAD_DAYS;
  const renewalReminderLeadDays =
    parsedInput.renewalReminderLeadDays ?? CONTRACT_RENEWAL_REMINDER_LEAD_DAYS;

  ensureEmployeeLifecycleContractLeadDaysAreValid({
    renewalReviewLeadDays,
    renewalReminderLeadDays,
  });

  return buildEmployeeLifecycleContractRecordFromSeed({
    employeeId: parsedInput.employeeId,
    companyId: parsedInput.companyId,
    tenantId: parsedInput.tenantId,
    expiryAt: parsedInput.expiryAt,
    renewalReviewLeadDays,
    renewalReminderLeadDays,
    startedAt,
    recordedAt,
    actorId: parsedInput.actorId ?? undefined,
    reason: parsedInput.reason ?? null,
    metadata: parsedInput.metadata ?? {},
  });
}

const appendEmployeeLifecycleContractRenewal = (
  record: EmployeeLifecycleContractRecord,
  input: EmployeeLifecycleContractRenewalInput
): EmployeeLifecycleContractRecord => {
  const parsedRecord = employeeLifecycleContractRecordSchema.parse(record);
  const renewedAt = input.renewedAt ?? new Date();
  const renewalReviewLeadDays =
    input.renewalReviewLeadDays ?? parsedRecord.renewalReviewLeadDays;
  const renewalReminderLeadDays =
    input.renewalReminderLeadDays ?? parsedRecord.renewalReminderLeadDays;

  ensureEmployeeLifecycleContractDatesAreValid({
    startedAt: parsedRecord.startedAt,
    expiryAt: input.expiryAt,
  });
  ensureEmployeeLifecycleContractLeadDaysAreValid({
    renewalReviewLeadDays,
    renewalReminderLeadDays,
  });

  if (input.expiryAt.getTime() <= parsedRecord.expiryAt.getTime()) {
    throw new Error("Contract renewal must extend the expiry date.");
  }

  const { renewalReviewDueAt, renewalReminderDueAt } =
    buildEmployeeLifecycleContractDueDates(
      input.expiryAt,
      renewalReviewLeadDays,
      renewalReminderLeadDays
    );

  return employeeLifecycleContractRecordSchema.parse({
    ...parsedRecord,
    expiryAt: input.expiryAt,
    renewalReviewLeadDays,
    renewalReminderLeadDays,
    renewalReviewDueAt,
    renewalReminderDueAt,
    renewalCount: parsedRecord.renewalCount + 1,
    lastRenewedAt: renewedAt,
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleContractEvent({
        employeeId: parsedRecord.employeeId,
        sequence: parsedRecord.events.length,
        event: "renewed",
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        expiryAt: input.expiryAt,
        renewalReviewDueAt,
        renewalReminderDueAt,
        metadata: {
          ...(input.metadata ?? {}),
          previousExpiryAt: parsedRecord.expiryAt.toISOString(),
          renewalCount: parsedRecord.renewalCount + 1,
        },
        createdAt: renewedAt,
      }),
    ],
    updatedAt: renewedAt,
  });
};

const appendEmployeeLifecycleContractReview = (
  record: EmployeeLifecycleContractRecord,
  input: EmployeeLifecycleContractReviewInput
): EmployeeLifecycleContractRecord => {
  const parsedRecord = employeeLifecycleContractRecordSchema.parse(record);
  const reviewedAt = input.reviewedAt ?? new Date();
  const reviewEntry = buildEmployeeLifecycleContractReviewEntry({
    employeeId: parsedRecord.employeeId,
    sequence: parsedRecord.reviewHistory.length,
    reviewedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    approvalReference: input.approvalReference ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
  });

  return employeeLifecycleContractRecordSchema.parse({
    ...parsedRecord,
    reviewHistory: [...parsedRecord.reviewHistory, reviewEntry],
    lastReviewAt: reviewedAt,
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleContractEvent({
        employeeId: parsedRecord.employeeId,
        sequence: parsedRecord.events.length,
        event: "review_recorded",
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        approvalReference: input.approvalReference ?? null,
        notes: input.notes ?? null,
        expiryAt: parsedRecord.expiryAt,
        renewalReviewDueAt: parsedRecord.renewalReviewDueAt,
        renewalReminderDueAt: parsedRecord.renewalReminderDueAt,
        metadata: input.metadata ?? {},
        createdAt: reviewedAt,
      }),
    ],
    updatedAt: reviewedAt,
  });
};

const appendEmployeeLifecycleContractReminder = (
  record: EmployeeLifecycleContractRecord,
  input: EmployeeLifecycleContractReminderInput
): EmployeeLifecycleContractRecord => {
  const parsedRecord = employeeLifecycleContractRecordSchema.parse(record);
  const remindedAt = input.remindedAt ?? new Date();
  const reminderEntry = buildEmployeeLifecycleContractReminderEntry({
    employeeId: parsedRecord.employeeId,
    sequence: parsedRecord.reminderHistory.length,
    reminderKind: input.reminderKind,
    remindedAt,
    actorId: input.actorId ?? undefined,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  });

  return employeeLifecycleContractRecordSchema.parse({
    ...parsedRecord,
    reminderHistory: [...parsedRecord.reminderHistory, reminderEntry],
    lastReminderAt: remindedAt,
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleContractEvent({
        employeeId: parsedRecord.employeeId,
        sequence: parsedRecord.events.length,
        event: "reminder_recorded",
        actorId: input.actorId ?? undefined,
        reason: input.reason ?? null,
        reminderKind: input.reminderKind,
        expiryAt: parsedRecord.expiryAt,
        renewalReviewDueAt: parsedRecord.renewalReviewDueAt,
        renewalReminderDueAt: parsedRecord.renewalReminderDueAt,
        metadata: input.metadata ?? {},
        createdAt: remindedAt,
      }),
    ],
    updatedAt: remindedAt,
  });
};

export function applyEmployeeLifecycleContractRenewal(
  record: EmployeeLifecycleContractRecord,
  input: EmployeeLifecycleContractRenewalInput
): EmployeeLifecycleContractRecord {
  return appendEmployeeLifecycleContractRenewal(record, input);
}

export function applyEmployeeLifecycleContractReview(
  record: EmployeeLifecycleContractRecord,
  input: EmployeeLifecycleContractReviewInput
): EmployeeLifecycleContractRecord {
  return appendEmployeeLifecycleContractReview(record, input);
}

export function applyEmployeeLifecycleContractReminder(
  record: EmployeeLifecycleContractRecord,
  input: EmployeeLifecycleContractReminderInput
): EmployeeLifecycleContractRecord {
  return appendEmployeeLifecycleContractReminder(record, input);
}

export function buildEmployeeLifecycleContractReadModel(
  input: Readonly<{
    state: EmployeeLifecycleState | null;
    record?: EmployeeLifecycleContractRecord | null;
  }>
): EmployeeLifecycleContractReadModel | null {
  if (!(input.state && input.record)) {
    return null;
  }

  const record = employeeLifecycleContractRecordSchema.parse(input.record);
  const now = Date.now();
  const isExpired = record.expiryAt.getTime() <= now;
  const lastReviewAt =
    record.lastReviewAt?.getTime() ?? Number.NEGATIVE_INFINITY;
  const lastReminderAt =
    record.lastReminderAt?.getTime() ?? Number.NEGATIVE_INFINITY;
  const isRenewalDue =
    !isExpired &&
    record.renewalReviewDueAt.getTime() <= now &&
    lastReviewAt < record.renewalReviewDueAt.getTime();
  const isReminderDue =
    !isExpired &&
    record.renewalReminderDueAt.getTime() <= now &&
    lastReminderAt < record.renewalReminderDueAt.getTime() &&
    !isRenewalDue;

  return employeeLifecycleContractReadModelSchema.parse({
    employeeId: input.state.employeeId,
    companyId: record.companyId ?? input.state.companyId ?? undefined,
    tenantId: record.tenantId ?? input.state.tenantId ?? undefined,
    lifecycleStage: input.state.currentStage,
    contractStatus: (() => {
      if (isExpired) {
        return "expired";
      }

      if (isRenewalDue) {
        return "review_due";
      }

      if (isReminderDue) {
        return "reminder_due";
      }

      return "active";
    })(),
    startedAt: record.startedAt,
    expiryAt: record.expiryAt,
    renewalReviewLeadDays: record.renewalReviewLeadDays,
    renewalReminderLeadDays: record.renewalReminderLeadDays,
    renewalReviewDueAt: record.renewalReviewDueAt,
    renewalReminderDueAt: record.renewalReminderDueAt,
    renewalCount: record.renewalCount,
    lastRenewedAt: record.lastRenewedAt ?? null,
    lastReviewAt: record.lastReviewAt ?? null,
    lastReminderAt: record.lastReminderAt ?? null,
    isRenewalDue,
    isReminderDue,
    isExpired,
    reviewHistory: record.reviewHistory,
    reminderHistory: record.reminderHistory,
    events: record.events,
  });
}

export const employeeLifecycleSuspensionKindValues = [
  "suspension",
  "hold",
] as const;

export type EmployeeLifecycleSuspensionKindValue =
  (typeof employeeLifecycleSuspensionKindValues)[number];

export const employeeLifecycleSuspensionStatusValues = [
  "active",
  "released",
  "resolved",
] as const;

export type EmployeeLifecycleSuspensionStatusValue =
  (typeof employeeLifecycleSuspensionStatusValues)[number];

export const employeeLifecycleSuspensionEventKindValues = [
  "started",
  "released",
  "resolved",
] as const;

export type EmployeeLifecycleSuspensionEventKindValue =
  (typeof employeeLifecycleSuspensionEventKindValues)[number];

export const employeeLifecycleSuspensionStartInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  suspensionKind: z.enum(employeeLifecycleSuspensionKindValues),
  effectiveAt: employeeLifecycleDateSchema.optional(),
  recordedAt: employeeLifecycleDateSchema.optional(),
  authorizationReference: employeeLifecycleTrimmedStringSchema,
  approvalReference: z.string().trim().min(1).nullable().optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleSuspensionResolutionInputSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  suspensionKind: z.enum(employeeLifecycleSuspensionKindValues),
  closedAt: employeeLifecycleDateSchema.optional(),
  resolutionReference: employeeLifecycleTrimmedStringSchema,
  resolutionEvidenceReference:
    employeeLifecycleOptionalTrimmedStringSchema.nullable().optional(),
  approvalReference: z.string().trim().min(1).nullable().optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleSuspensionEntrySchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  suspensionKind: z.enum(employeeLifecycleSuspensionKindValues),
  status: z.enum(employeeLifecycleSuspensionStatusValues),
  effectiveAt: employeeLifecycleDateSchema,
  recordedAt: employeeLifecycleDateSchema,
  authorizationReference: employeeLifecycleTrimmedStringSchema,
  approvalReference: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  closedAt: employeeLifecycleDateSchema.nullish(),
  resolutionPath: z.enum(["released", "resolved"]).nullable().optional(),
  resolutionReference: employeeLifecycleTrimmedStringSchema.nullish(),
  resolutionEvidenceReference:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  resolutionReason: z.string().trim().nullable().optional(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  resolutionActorId: employeeLifecycleOptionalTrimmedStringSchema,
  metadata: employeeLifecycleMetadataSchema,
});

export const employeeLifecycleSuspensionEventSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  sequence: z.number().int().nonnegative(),
  employeeId: employeeLifecycleTrimmedStringSchema,
  event: z.enum(employeeLifecycleSuspensionEventKindValues),
  suspensionKind: z.enum(employeeLifecycleSuspensionKindValues),
  authorizationReference: employeeLifecycleTrimmedStringSchema,
  approvalReference: z.string().trim().min(1).nullable().optional(),
  resolutionReference: employeeLifecycleTrimmedStringSchema.nullish(),
  resolutionEvidenceReference:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  resolutionPath: z.enum(["released", "resolved"]).nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  closedAt: employeeLifecycleDateSchema.nullish(),
  actorId: employeeLifecycleOptionalTrimmedStringSchema,
  resolutionActorId: employeeLifecycleOptionalTrimmedStringSchema,
  metadata: employeeLifecycleMetadataSchema,
  createdAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleSuspensionRecordSchema = z.object({
  id: employeeLifecycleTrimmedStringSchema,
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  entries: z.array(employeeLifecycleSuspensionEntrySchema),
  events: z.array(employeeLifecycleSuspensionEventSchema),
  startedAt: employeeLifecycleDateSchema,
  lastSuspendedAt: employeeLifecycleDateSchema.nullish(),
  lastClosedAt: employeeLifecycleDateSchema.nullish(),
  lastReleasedAt: employeeLifecycleDateSchema.nullish(),
  lastResolvedAt: employeeLifecycleDateSchema.nullish(),
  createdAt: employeeLifecycleDateSchema,
  updatedAt: employeeLifecycleDateSchema,
});

export const employeeLifecycleSuspensionReadModelSchema = z.object({
  employeeId: employeeLifecycleTrimmedStringSchema,
  companyId: employeeLifecycleOptionalTrimmedStringSchema,
  tenantId: employeeLifecycleOptionalTrimmedStringSchema,
  lifecycleStage: employeeLifecycleStageSchema,
  suspensionKind: z.enum(employeeLifecycleSuspensionKindValues),
  suspensionStatus: z.enum(employeeLifecycleSuspensionStatusValues),
  suspensionCount: z.number().int().nonnegative(),
  startedAt: employeeLifecycleDateSchema,
  lastSuspendedAt: employeeLifecycleDateSchema.nullish(),
  lastClosedAt: employeeLifecycleDateSchema.nullish(),
  lastReleasedAt: employeeLifecycleDateSchema.nullish(),
  lastResolvedAt: employeeLifecycleDateSchema.nullish(),
  authorizationReference: employeeLifecycleTrimmedStringSchema,
  approvalReference: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().nullable().optional(),
  closedAt: employeeLifecycleDateSchema.nullish(),
  resolutionPath: z.enum(["released", "resolved"]).nullable().optional(),
  resolutionReference: employeeLifecycleTrimmedStringSchema.nullish(),
  resolutionEvidenceReference:
    employeeLifecycleOptionalTrimmedStringSchema.nullish(),
  resolutionReason: z.string().trim().nullable().optional(),
  isRestricted: z.boolean(),
  isClosed: z.boolean(),
  isEffective: z.boolean(),
  isFutureDated: z.boolean(),
  entries: z.array(employeeLifecycleSuspensionEntrySchema),
  events: z.array(employeeLifecycleSuspensionEventSchema),
});

export type EmployeeLifecycleSuspensionStartInput = z.infer<
  typeof employeeLifecycleSuspensionStartInputSchema
>;
export type EmployeeLifecycleSuspensionResolutionInput = z.infer<
  typeof employeeLifecycleSuspensionResolutionInputSchema
>;
export type EmployeeLifecycleSuspensionEntry = z.infer<
  typeof employeeLifecycleSuspensionEntrySchema
>;
export type EmployeeLifecycleSuspensionEvent = z.infer<
  typeof employeeLifecycleSuspensionEventSchema
>;
export type EmployeeLifecycleSuspensionRecord = z.infer<
  typeof employeeLifecycleSuspensionRecordSchema
>;
export type EmployeeLifecycleSuspensionReadModel = z.infer<
  typeof employeeLifecycleSuspensionReadModelSchema
>;

const buildEmployeeLifecycleSuspensionEntryId = (
  employeeId: string,
  sequence: number,
  suspensionKind: EmployeeLifecycleSuspensionKindValue
): string => `${employeeId}:suspension:${sequence}:${suspensionKind}`;

const buildEmployeeLifecycleSuspensionEventId = (
  employeeId: string,
  sequence: number,
  event: EmployeeLifecycleSuspensionEventKindValue
): string => `${employeeId}:suspension:${sequence}:${event}`;

const buildEmployeeLifecycleSuspensionEvent = (
  input: Readonly<{
    employeeId: string;
    sequence: number;
    event: EmployeeLifecycleSuspensionEventKindValue;
    suspensionKind: EmployeeLifecycleSuspensionKindValue;
    authorizationReference: string;
    approvalReference?: string | null;
    resolutionReference?: string | null;
    resolutionEvidenceReference?: string | null;
    resolutionPath?: "released" | "resolved" | null;
    reason?: string | null;
    closedAt?: Date | null;
    actorId?: string | null;
    resolutionActorId?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }>
): EmployeeLifecycleSuspensionEvent =>
  employeeLifecycleSuspensionEventSchema.parse({
    id: buildEmployeeLifecycleSuspensionEventId(
      input.employeeId,
      input.sequence,
      input.event
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    event: input.event,
    suspensionKind: input.suspensionKind,
    authorizationReference: input.authorizationReference,
    approvalReference: input.approvalReference ?? null,
    resolutionReference: input.resolutionReference ?? null,
    resolutionEvidenceReference: input.resolutionEvidenceReference ?? null,
    resolutionPath: input.resolutionPath ?? null,
    reason: input.reason ?? null,
    closedAt: input.closedAt ?? null,
    actorId: input.actorId ?? undefined,
    resolutionActorId: input.resolutionActorId ?? undefined,
    metadata: input.metadata ?? {},
    createdAt: input.createdAt,
  });

const buildEmployeeLifecycleSuspensionEntry = (
  input: Readonly<{
    employeeId: string;
    sequence: number;
    suspensionKind: EmployeeLifecycleSuspensionKindValue;
    status: EmployeeLifecycleSuspensionStatusValue;
    effectiveAt: Date;
    recordedAt: Date;
    authorizationReference: string;
    approvalReference?: string | null;
    reason?: string | null;
    closedAt?: Date | null;
    resolutionPath?: "released" | "resolved" | null;
    resolutionReference?: string | null;
    resolutionEvidenceReference?: string | null;
    resolutionReason?: string | null;
    actorId?: string | null;
    resolutionActorId?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleSuspensionEntry =>
  employeeLifecycleSuspensionEntrySchema.parse({
    id: buildEmployeeLifecycleSuspensionEntryId(
      input.employeeId,
      input.sequence,
      input.suspensionKind
    ),
    sequence: input.sequence,
    employeeId: input.employeeId,
    suspensionKind: input.suspensionKind,
    status: input.status,
    effectiveAt: input.effectiveAt,
    recordedAt: input.recordedAt,
    authorizationReference: input.authorizationReference,
    approvalReference: input.approvalReference ?? null,
    reason: input.reason ?? null,
    closedAt: input.closedAt ?? null,
    resolutionPath: input.resolutionPath ?? null,
    resolutionReference: input.resolutionReference ?? null,
    resolutionEvidenceReference: input.resolutionEvidenceReference ?? null,
    resolutionReason: input.resolutionReason ?? null,
    actorId: input.actorId ?? undefined,
    resolutionActorId: input.resolutionActorId ?? undefined,
    metadata: input.metadata ?? {},
  });

const buildEmployeeLifecycleSuspensionRecordFromSeed = (
  input: Readonly<{
    employeeId: string;
    companyId?: string | null;
    tenantId?: string | null;
    suspensionKind: EmployeeLifecycleSuspensionKindValue;
    effectiveAt: Date;
    recordedAt: Date;
    authorizationReference: string;
    approvalReference?: string | null;
    actorId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
  }>
): EmployeeLifecycleSuspensionRecord =>
  employeeLifecycleSuspensionRecordSchema.parse({
    id: `${input.employeeId}:suspension`,
    employeeId: input.employeeId,
    companyId: input.companyId ?? undefined,
    tenantId: input.tenantId ?? undefined,
    entries: [
      buildEmployeeLifecycleSuspensionEntry({
        employeeId: input.employeeId,
        sequence: 0,
        suspensionKind: input.suspensionKind,
        status: "active",
        effectiveAt: input.effectiveAt,
        recordedAt: input.recordedAt,
        authorizationReference: input.authorizationReference,
        approvalReference: input.approvalReference ?? null,
        reason: input.reason ?? null,
        actorId: input.actorId ?? undefined,
        metadata: input.metadata ?? {},
      }),
    ],
    events: [
      buildEmployeeLifecycleSuspensionEvent({
        employeeId: input.employeeId,
        sequence: 0,
        event: "started",
        suspensionKind: input.suspensionKind,
        authorizationReference: input.authorizationReference,
        approvalReference: input.approvalReference ?? null,
        reason: input.reason ?? null,
        closedAt: null,
        actorId: input.actorId ?? undefined,
        metadata: {
          ...(input.metadata ?? {}),
          suspensionKind: input.suspensionKind,
        },
        createdAt: input.recordedAt,
      }),
    ],
    startedAt: input.recordedAt,
    lastSuspendedAt: input.recordedAt,
    lastClosedAt: null,
    lastReleasedAt: null,
    lastResolvedAt: null,
    createdAt: input.recordedAt,
    updatedAt: input.recordedAt,
  });

export function createEmployeeLifecycleSuspensionRecord(
  input: EmployeeLifecycleSuspensionStartInput
): EmployeeLifecycleSuspensionRecord {
  const parsedInput = employeeLifecycleSuspensionStartInputSchema.parse(input);
  const effectiveAt = parsedInput.effectiveAt ?? new Date();
  const recordedAt = parsedInput.recordedAt ?? effectiveAt;

  return buildEmployeeLifecycleSuspensionRecordFromSeed({
    employeeId: parsedInput.employeeId,
    companyId: parsedInput.companyId,
    tenantId: parsedInput.tenantId,
    suspensionKind: parsedInput.suspensionKind,
    effectiveAt,
    recordedAt,
    authorizationReference: parsedInput.authorizationReference,
    approvalReference: parsedInput.approvalReference ?? null,
    actorId: parsedInput.actorId ?? undefined,
    reason: parsedInput.reason ?? null,
    metadata: parsedInput.metadata ?? {},
  });
}

const appendEmployeeLifecycleSuspensionEntry = (
  record: EmployeeLifecycleSuspensionRecord,
  input: EmployeeLifecycleSuspensionStartInput
): EmployeeLifecycleSuspensionRecord => {
  const parsedRecord = employeeLifecycleSuspensionRecordSchema.parse(record);
  const effectiveAt = input.effectiveAt ?? new Date();
  const recordedAt = input.recordedAt ?? effectiveAt;
  const latestEntry = parsedRecord.entries.at(-1);

  if (latestEntry && latestEntry.status === "active") {
    throw new Error(
      `Employee ${parsedRecord.employeeId} already has an active suspension or hold.`
    );
  }

  const entry = buildEmployeeLifecycleSuspensionEntry({
    employeeId: parsedRecord.employeeId,
    sequence: parsedRecord.entries.length,
    suspensionKind: input.suspensionKind,
    status: "active",
    effectiveAt,
    recordedAt,
    authorizationReference: input.authorizationReference,
    approvalReference: input.approvalReference ?? null,
    reason: input.reason ?? null,
    actorId: input.actorId ?? undefined,
    metadata: input.metadata ?? {},
  });

  return employeeLifecycleSuspensionRecordSchema.parse({
    ...parsedRecord,
    entries: [...parsedRecord.entries, entry],
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleSuspensionEvent({
        employeeId: parsedRecord.employeeId,
        sequence: parsedRecord.events.length,
        event: "started",
        suspensionKind: input.suspensionKind,
        authorizationReference: input.authorizationReference,
        approvalReference: input.approvalReference ?? null,
        reason: input.reason ?? null,
        closedAt: null,
        actorId: input.actorId ?? undefined,
        metadata: {
          ...(input.metadata ?? {}),
          suspensionKind: input.suspensionKind,
        },
        createdAt: recordedAt,
      }),
    ],
    lastSuspendedAt: recordedAt,
    updatedAt: recordedAt,
  });
};

const closeEmployeeLifecycleSuspensionEntry = (
  record: EmployeeLifecycleSuspensionRecord,
  input: EmployeeLifecycleSuspensionResolutionInput,
  resolutionPath: "released" | "resolved"
): EmployeeLifecycleSuspensionRecord => {
  const parsedRecord = employeeLifecycleSuspensionRecordSchema.parse(record);
  const closedAt = input.closedAt ?? new Date();
  const currentEntry = parsedRecord.entries.at(-1);

  if (!currentEntry || currentEntry.status !== "active") {
    throw new Error(
      `Employee ${parsedRecord.employeeId} does not have an active suspension or hold to ${resolutionPath}.`
    );
  }

  const nextEntry = buildEmployeeLifecycleSuspensionEntry({
    ...currentEntry,
    status: resolutionPath === "released" ? "released" : "resolved",
    closedAt,
    resolutionPath,
    resolutionReference: input.resolutionReference,
    resolutionEvidenceReference:
      input.resolutionEvidenceReference ?? undefined,
    resolutionReason: input.reason ?? null,
    resolutionActorId: input.actorId ?? undefined,
    metadata: input.metadata ?? {},
  });

  const nextEntries = [...parsedRecord.entries];
  nextEntries[nextEntries.length - 1] = nextEntry;

  return employeeLifecycleSuspensionRecordSchema.parse({
    ...parsedRecord,
    entries: nextEntries,
    events: [
      ...parsedRecord.events,
      buildEmployeeLifecycleSuspensionEvent({
        employeeId: parsedRecord.employeeId,
        sequence: parsedRecord.events.length,
        event: resolutionPath,
        suspensionKind: currentEntry.suspensionKind,
        authorizationReference: currentEntry.authorizationReference,
        approvalReference: input.approvalReference ?? null,
        resolutionReference: input.resolutionReference,
        resolutionEvidenceReference:
          input.resolutionEvidenceReference ?? null,
        resolutionPath,
        reason: input.reason ?? null,
        closedAt,
        actorId: currentEntry.actorId ?? undefined,
        resolutionActorId: input.actorId ?? undefined,
        metadata: {
          ...(input.metadata ?? {}),
          suspensionKind: currentEntry.suspensionKind,
          resolutionPath,
        },
        createdAt: closedAt,
      }),
    ],
    lastClosedAt: closedAt,
    lastReleasedAt:
      resolutionPath === "released" ? closedAt : parsedRecord.lastReleasedAt,
    lastResolvedAt:
      resolutionPath === "resolved" ? closedAt : parsedRecord.lastResolvedAt,
    updatedAt: closedAt,
  });
};

export function appendEmployeeLifecycleSuspension(
  record: EmployeeLifecycleSuspensionRecord,
  input: EmployeeLifecycleSuspensionStartInput
): EmployeeLifecycleSuspensionRecord {
  return appendEmployeeLifecycleSuspensionEntry(record, input);
}

export function releaseEmployeeLifecycleSuspension(
  record: EmployeeLifecycleSuspensionRecord,
  input: EmployeeLifecycleSuspensionResolutionInput
): EmployeeLifecycleSuspensionRecord {
  return closeEmployeeLifecycleSuspensionEntry(record, input, "released");
}

export function resolveEmployeeLifecycleSuspension(
  record: EmployeeLifecycleSuspensionRecord,
  input: EmployeeLifecycleSuspensionResolutionInput
): EmployeeLifecycleSuspensionRecord {
  return closeEmployeeLifecycleSuspensionEntry(record, input, "resolved");
}

export function buildEmployeeLifecycleSuspensionReadModel(
  input: Readonly<{
    state: EmployeeLifecycleState | null;
    record?: EmployeeLifecycleSuspensionRecord | null;
  }>
): EmployeeLifecycleSuspensionReadModel | null {
  if (!(input.state && input.record)) {
    return null;
  }

  const record = employeeLifecycleSuspensionRecordSchema.parse(input.record);
  const [currentSuspension] = [...record.entries].slice(-1);
  if (!currentSuspension) {
    return null;
  }

  const now = Date.now();
  const isEffective = currentSuspension.effectiveAt.getTime() <= now;
  const isFutureDated = !isEffective;
  const isRestricted = currentSuspension.status === "active";
  const isClosed = currentSuspension.status !== "active";

  return employeeLifecycleSuspensionReadModelSchema.parse({
    employeeId: input.state.employeeId,
    companyId: record.companyId ?? input.state.companyId ?? undefined,
    tenantId: record.tenantId ?? input.state.tenantId ?? undefined,
    lifecycleStage: input.state.currentStage,
    suspensionKind: currentSuspension.suspensionKind,
    suspensionStatus: currentSuspension.status,
    suspensionCount: record.entries.length,
    startedAt: record.startedAt,
    lastSuspendedAt: record.lastSuspendedAt ?? null,
    lastClosedAt: record.lastClosedAt ?? null,
    lastReleasedAt: record.lastReleasedAt ?? null,
    lastResolvedAt: record.lastResolvedAt ?? null,
    authorizationReference: currentSuspension.authorizationReference,
    approvalReference: currentSuspension.approvalReference ?? null,
    reason: currentSuspension.reason ?? null,
    closedAt: currentSuspension.closedAt ?? null,
    resolutionPath: currentSuspension.resolutionPath ?? null,
    resolutionReference: currentSuspension.resolutionReference ?? null,
    resolutionEvidenceReference:
      currentSuspension.resolutionEvidenceReference ?? null,
    resolutionReason: currentSuspension.resolutionReason ?? null,
    isRestricted,
    isClosed,
    isEffective,
    isFutureDated,
    entries: record.entries,
    events: record.events,
  });
}
