import { z } from "zod";

const lifecycleOptionalTrimmedStringSchema = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional();

const lifecycleDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }

  return value;
}, z.date());

export const employeeLifecycleBootstrapProfileSchema = z.object({
  employeeId: z.string().trim().min(1),
  companyId: lifecycleOptionalTrimmedStringSchema,
  tenantId: lifecycleOptionalTrimmedStringSchema,
  employmentType: lifecycleOptionalTrimmedStringSchema,
  legalEntityCode: lifecycleOptionalTrimmedStringSchema,
  departmentId: lifecycleOptionalTrimmedStringSchema,
  workLocationCode: lifecycleOptionalTrimmedStringSchema,
  roleTitle: lifecycleOptionalTrimmedStringSchema,
  roleCode: lifecycleOptionalTrimmedStringSchema,
});

export const employeeLifecycleAutomationActionKindValues = [
  "onboarding_auto_start",
  "probation_review_due",
  "contract_reminder_due",
  "contract_review_due",
  "offboarding_handoff",
] as const;

export const employeeLifecycleAutomationActionKindSchema = z.enum(
  employeeLifecycleAutomationActionKindValues
);

export const employeeLifecycleNotificationAudienceRoleValues = [
  "employee",
  "manager",
  "hr",
  "hr_operations",
  "payroll",
  "it",
  "security",
] as const;

export const employeeLifecycleNotificationAudienceRoleSchema = z.enum(
  employeeLifecycleNotificationAudienceRoleValues
);

export const employeeLifecycleNotificationKindValues = [
  "onboarding_pending",
  "onboarding_ready",
  "probation_review_due",
  "probation_review_overdue",
  "contract_reminder_due",
  "contract_review_due",
  "contract_review_overdue",
  "suspension_open",
  "exit_notice_active",
  "offboarding_pending",
] as const;

export const employeeLifecycleNotificationKindSchema = z.enum(
  employeeLifecycleNotificationKindValues
);

export const employeeLifecycleOffboardingHandoffStatusValues = [
  "requested",
  "linked",
] as const;

export const employeeLifecycleOffboardingHandoffStatusSchema = z.enum(
  employeeLifecycleOffboardingHandoffStatusValues
);

export const employeeLifecycleAutomationActionSchema = z.object({
  id: z.string().trim().min(1),
  kind: employeeLifecycleAutomationActionKindSchema,
  employeeId: z.string().trim().min(1),
  companyId: lifecycleOptionalTrimmedStringSchema,
  tenantId: lifecycleOptionalTrimmedStringSchema,
  dueAt: lifecycleDateSchema.nullish(),
  sourceEventId: lifecycleOptionalTrimmedStringSchema,
  dedupeKey: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const employeeLifecycleNotificationIntentSchema = z.object({
  id: z.string().trim().min(1),
  kind: employeeLifecycleNotificationKindSchema,
  employeeId: z.string().trim().min(1),
  companyId: lifecycleOptionalTrimmedStringSchema,
  tenantId: lifecycleOptionalTrimmedStringSchema,
  audienceRole: employeeLifecycleNotificationAudienceRoleSchema,
  dueAt: lifecycleDateSchema.nullish(),
  sourceEventId: lifecycleOptionalTrimmedStringSchema,
  dedupeKey: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: lifecycleDateSchema,
});

export const employeeLifecycleOffboardingHandoffRecordSchema = z.object({
  id: z.string().trim().min(1),
  employeeId: z.string().trim().min(1),
  companyId: lifecycleOptionalTrimmedStringSchema,
  tenantId: lifecycleOptionalTrimmedStringSchema,
  lifecycleExitReference: z.string().trim().min(1),
  exitKind: z.enum([
    "resignation",
    "termination",
    "retirement",
    "contract_expiry",
  ]),
  effectiveSeparationDate: lifecycleDateSchema,
  noticeEndsAt: lifecycleDateSchema.nullish(),
  lastWorkingAt: lifecycleDateSchema.nullish(),
  dedupeKey: z.string().trim().min(1),
  status: employeeLifecycleOffboardingHandoffStatusSchema,
  offboardingCaseId: lifecycleOptionalTrimmedStringSchema,
  createdAt: lifecycleDateSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const runEmployeeLifecycleAutomationInputSchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  now: lifecycleDateSchema.optional(),
  source: z.string().trim().min(1).optional(),
  employeeProfile: employeeLifecycleBootstrapProfileSchema.optional(),
  enqueueNotifications: z.boolean().optional(),
  triggerOffboardingHandoff: z.boolean().optional(),
});

export type EmployeeLifecycleBootstrapProfile = z.infer<
  typeof employeeLifecycleBootstrapProfileSchema
>;
export type EmployeeLifecycleAutomationActionKindValue = z.infer<
  typeof employeeLifecycleAutomationActionKindSchema
>;
export type EmployeeLifecycleNotificationAudienceRoleValue = z.infer<
  typeof employeeLifecycleNotificationAudienceRoleSchema
>;
export type EmployeeLifecycleNotificationKindValue = z.infer<
  typeof employeeLifecycleNotificationKindSchema
>;
export type EmployeeLifecycleOffboardingHandoffStatusValue = z.infer<
  typeof employeeLifecycleOffboardingHandoffStatusSchema
>;
export type EmployeeLifecycleAutomationAction = z.infer<
  typeof employeeLifecycleAutomationActionSchema
>;
export type EmployeeLifecycleNotificationIntent = z.infer<
  typeof employeeLifecycleNotificationIntentSchema
>;
export type EmployeeLifecycleOffboardingHandoffRecord = z.infer<
  typeof employeeLifecycleOffboardingHandoffRecordSchema
>;
export type RunEmployeeLifecycleAutomationInput = z.infer<
  typeof runEmployeeLifecycleAutomationInputSchema
>;
