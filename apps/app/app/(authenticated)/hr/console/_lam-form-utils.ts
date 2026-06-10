import type { UpsertLamLeaveApprovalRouteInput } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { lamLeaveApprovalStepKindSchema } from "@repo/features-time-attendance-leave-attendance-management/contract";
import { z } from "zod";

export const readOptionalFormId = (formData: FormData): string | undefined => {
  const id = String(formData.get("id") ?? "").trim();
  return id.length > 0 ? id : undefined;
};

export const readFormActive = (
  formData: FormData,
  defaultActive = true
): boolean => {
  const raw = formData.get("active");
  if (raw === "true" || raw === "on") {
    return true;
  }
  if (raw === "false" || raw === "off") {
    return false;
  }

  return defaultActive;
};

export const formatDateInputValue = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
};

const defaultApprovalRouteSteps = (): UpsertLamLeaveApprovalRouteInput["steps"] => [
  {
    fallbackToHr: true,
    kind: "direct_manager",
    order: 1,
  },
];

const approvalRouteStepFormSchema = z.object({
  approverRef: z.string().trim().optional(),
  fallbackToHr: z.boolean().optional(),
  kind: lamLeaveApprovalStepKindSchema,
  label: z.string().trim().optional(),
  order: z.number().int().positive(),
});

export const parseApprovalRouteStepsFromFormData = (
  formData: FormData
): UpsertLamLeaveApprovalRouteInput["steps"] => {
  const raw = String(formData.get("stepsJson") ?? "").trim();
  if (!raw) {
    return defaultApprovalRouteSteps();
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const steps = z.array(approvalRouteStepFormSchema).min(1).parse(parsed);
    return steps.map((step) => ({
      ...(step.approverRef ? { approverRef: step.approverRef } : {}),
      ...(step.label ? { label: step.label } : {}),
      ...(step.fallbackToHr === undefined ? {} : { fallbackToHr: step.fallbackToHr }),
      kind: step.kind,
      order: step.order,
    }));
  } catch {
    return defaultApprovalRouteSteps();
  }
};

export const formatApprovalRouteStepsSummary = (
  steps: readonly {
    kind: string;
    order: number;
  }[]
): string =>
  [...steps]
    .sort((left, right) => left.order - right.order)
    .map((step) => `${step.order}. ${step.kind.replaceAll("_", " ")}`)
    .join(" → ");

const optionalScopeFieldSchema = z.string().trim().min(1).optional();

const approvalRouteScopeFormSchema = z
  .object({
    countryCode: optionalScopeFieldSchema,
    departmentId: optionalScopeFieldSchema,
    employmentType: optionalScopeFieldSchema,
    grade: optionalScopeFieldSchema,
    legalEntityCode: optionalScopeFieldSchema,
    policyGroupId: optionalScopeFieldSchema,
    workLocationCode: optionalScopeFieldSchema,
  })
  .partial();

export const parseApprovalRouteScopeFromFormData = (
  formData: FormData
): UpsertLamLeaveApprovalRouteInput["scope"] | undefined => {
  const parsed = approvalRouteScopeFormSchema.parse({
    countryCode: String(formData.get("scopeCountryCode") ?? "").trim() || undefined,
    departmentId: String(formData.get("scopeDepartmentId") ?? "").trim() || undefined,
    employmentType:
      String(formData.get("scopeEmploymentType") ?? "").trim() || undefined,
    grade: String(formData.get("scopeGrade") ?? "").trim() || undefined,
    legalEntityCode:
      String(formData.get("scopeLegalEntityCode") ?? "").trim() || undefined,
    policyGroupId:
      String(formData.get("scopePolicyGroupId") ?? "").trim() || undefined,
    workLocationCode:
      String(formData.get("scopeWorkLocationCode") ?? "").trim() || undefined,
  });

  const entries = Object.entries(parsed).filter(
    ([, value]) => typeof value === "string" && value.length > 0
  );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
};

export const parseOptionalDurationDays = (
  formData: FormData,
  fieldName: "minDurationDays" | "maxDurationDays"
): number | null | undefined => {
  const raw = String(formData.get(fieldName) ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};
