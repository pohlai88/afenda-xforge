import { z } from "zod";

const audit7w1hRequiredString = z.string().trim().min(1);
const audit7w1hOptionalString = audit7w1hRequiredString.optional();
const audit7w1hOptionalNullableString = audit7w1hRequiredString
  .nullable()
  .optional();

export const audit7w1hRecordMapSchema = z.record(z.string(), z.unknown());

export type Audit7W1HRecordMap = z.infer<typeof audit7w1hRecordMapSchema>;

export const audit7w1hDiffKindSchema = z.enum(["added", "removed", "changed"]);

export type Audit7W1HDiffKind = z.infer<typeof audit7w1hDiffKindSchema>;

export const audit7w1hActorTypeSchema = z.enum([
  "user",
  "system",
  "service",
  "integration",
  "agent",
]);

export type Audit7W1HActorType = z.infer<typeof audit7w1hActorTypeSchema>;

export const audit7w1hOutcomeSchema = z.enum(["success", "failure", "denied"]);

export type Audit7W1HOutcome = z.infer<typeof audit7w1hOutcomeSchema>;

export const audit7w1hChannelSchema = z.enum([
  "web",
  "api",
  "server_action",
  "cron",
  "webhook",
  "migration",
]);

export type Audit7W1HChannel = z.infer<typeof audit7w1hChannelSchema>;

export const audit7w1hChangeSchema = z
  .object({
    field: audit7w1hRequiredString,
    change: audit7w1hDiffKindSchema,
    oldValue: z.unknown(),
    newValue: z.unknown(),
  })
  .strict();

export type Audit7W1HChange = z.infer<typeof audit7w1hChangeSchema>;

export const audit7w1hEventInputSchema = z
  .object({
    tenantId: audit7w1hRequiredString,
    companyId: audit7w1hOptionalNullableString,
    grantId: audit7w1hOptionalNullableString,

    actorId: audit7w1hRequiredString,
    actorType: audit7w1hActorTypeSchema.optional(),
    actorRole: audit7w1hOptionalString,

    module: audit7w1hOptionalString,
    surface: audit7w1hOptionalString,
    route: audit7w1hOptionalString,

    subjectType: audit7w1hOptionalString,
    subjectId: audit7w1hOptionalString,

    action: audit7w1hRequiredString,
    summary: audit7w1hOptionalString,
    outcome: audit7w1hOutcomeSchema.optional(),

    targetType: audit7w1hRequiredString,
    targetId: audit7w1hRequiredString,
    targetDisplayName: audit7w1hOptionalString,

    reason: audit7w1hOptionalString,
    policyReference: audit7w1hOptionalString,
    approvalId: audit7w1hOptionalString,

    channel: audit7w1hChannelSchema.optional(),
    requestId: audit7w1hOptionalString,
    operationId: audit7w1hOptionalString,

    before: audit7w1hRecordMapSchema.optional(),
    after: audit7w1hRecordMapSchema.optional(),
    diff: z.array(audit7w1hChangeSchema).readonly().optional(),
    metadata: audit7w1hRecordMapSchema.nullable().optional(),

    occurredAt: z.date().optional(),
  })
  .strict();

export type Audit7W1HEventInput = z.infer<typeof audit7w1hEventInputSchema>;

export const audit7w1hEventSchema = audit7w1hEventInputSchema
  .extend({
    id: audit7w1hRequiredString,

    actorType: audit7w1hActorTypeSchema,
    actorRole: audit7w1hRequiredString.nullable(),
    before: audit7w1hRecordMapSchema,
    after: audit7w1hRecordMapSchema,
    channel: audit7w1hChannelSchema.nullable(),
    companyId: audit7w1hRequiredString.nullable(),
    createdAt: z.date(),
    diff: z.array(audit7w1hChangeSchema),
    grantId: audit7w1hRequiredString.nullable(),
    metadata: audit7w1hRecordMapSchema,
    module: audit7w1hRequiredString,
    occurredAt: z.date(),
    operationId: audit7w1hRequiredString,
    outcome: audit7w1hOutcomeSchema,
    approvalId: audit7w1hRequiredString.nullable(),
    policyReference: audit7w1hRequiredString.nullable(),
    reason: audit7w1hRequiredString,
    requestId: audit7w1hRequiredString,
    route: audit7w1hRequiredString.nullable(),
    subjectId: audit7w1hRequiredString.nullable(),
    subjectType: audit7w1hRequiredString.nullable(),
    summary: audit7w1hRequiredString,
    surface: audit7w1hRequiredString.nullable(),
    targetDisplayName: audit7w1hRequiredString.nullable(),
  })
  .strict();

export type Audit7W1HEvent = z.infer<typeof audit7w1hEventSchema>;

export const audit7w1hQueryOptionsSchema = z
  .object({
    tenantId: audit7w1hRequiredString,
    companyId: audit7w1hOptionalNullableString,

    actorId: audit7w1hOptionalString,
    actorType: audit7w1hActorTypeSchema.optional(),
    actorRole: audit7w1hOptionalString,

    module: audit7w1hOptionalString,
    surface: audit7w1hOptionalString,
    route: audit7w1hOptionalString,

    subjectType: audit7w1hOptionalString,
    subjectId: audit7w1hOptionalString,

    action: audit7w1hOptionalString,
    summary: audit7w1hOptionalString,
    outcome: audit7w1hOutcomeSchema.optional(),

    targetType: audit7w1hOptionalString,
    targetId: audit7w1hOptionalString,
    targetDisplayName: audit7w1hOptionalString,

    channel: audit7w1hChannelSchema.optional(),
    requestId: audit7w1hOptionalString,
    operationId: audit7w1hOptionalString,

    from: z.date().optional(),
    to: z.date().optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  })
  .strict();

export type Audit7W1HQueryOptions = z.infer<typeof audit7w1hQueryOptionsSchema>;

export type Audit7W1HQueryResult = {
  events: Audit7W1HEvent[];
  total: number;
};

export type Audit7W1HWriter = {
  write: (event: Audit7W1HEvent) => Promise<void> | void;
};

export type Audit7W1HExportFormat = "json" | "csv";
