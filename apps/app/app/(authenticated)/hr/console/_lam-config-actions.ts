"use server";

import type {
  ProcessLamLeaveEncashmentInput,
  UpsertLamAttendancePolicyInput,
  UpsertLamHolidayCalendarInput,
  UpsertLamLeaveApprovalRouteInput,
  UpsertLamLeaveBlackoutPeriodInput,
  UpsertLamLeaveEncashmentPolicyInput,
  UpsertLamLeaveEntitlementRuleInput,
  UpsertLamLeaveTypeInput,
  UpsertLamWorkCalendarInput,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import {
  processLamLeaveEncashment,
  upsertLamAttendancePolicy,
  upsertLamHolidayCalendar,
  upsertLamLeaveApprovalRoute,
  upsertLamLeaveBlackoutPeriod,
  upsertLamLeaveEncashmentPolicy,
  upsertLamLeaveEntitlementRule,
  upsertLamLeaveType,
  upsertLamWorkCalendar,
} from "@repo/features-time-attendance-leave-attendance-management/server";
import { revalidatePath } from "next/cache";
import {
  parseApprovalRouteScopeFromFormData,
  parseApprovalRouteStepsFromFormData,
  parseOptionalDurationDays,
  readFormActive,
  readOptionalFormId,
} from "./_lam-form-utils.ts";
import {
  resolveHrConsoleLamConfigContext,
  resolveHrConsoleLamReadContext,
} from "./_lam-session-context.ts";

const revalidateConsolePathOnSuccess = (
  path: string,
  result: { ok: boolean }
): void => {
  if (result.ok) {
    revalidatePath(path);
  }
};

const standardWeekdayRules = {
  monday: "working_day",
  tuesday: "working_day",
  wednesday: "working_day",
  thursday: "working_day",
  friday: "working_day",
  saturday: "off_day",
  sunday: "off_day",
} as const;

export type LamConfigActionState = {
  ok: boolean;
  message: string;
  targetId?: string;
};

const toActionState = (
  result: { ok: true; targetId: string } | { ok: false; error: string }
): LamConfigActionState =>
  result.ok
    ? {
        ok: true,
        message: "Saved successfully",
        targetId: result.targetId,
      }
    : {
        ok: false,
        message: result.error,
      };

export const upsertEncashmentPolicyAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const input: UpsertLamLeaveEncashmentPolicyInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    leaveTypeId: String(formData.get("leaveTypeId") ?? "").trim(),
    maxEncashableDays: Number(formData.get("maxEncashableDays") ?? 0),
    encashmentRatePercent: Number(formData.get("encashmentRatePercent") ?? 0),
    minRemainingBalanceDays: formData.get("minRemainingBalanceDays")
      ? Number(formData.get("minRemainingBalanceDays"))
      : undefined,
    effectiveFrom: new Date(String(formData.get("effectiveFrom") ?? "")),
    active: readFormActive(formData),
  };

  const result = await upsertLamLeaveEncashmentPolicy(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/encashment");
  }

  return toActionState(result);
};

export const toggleEncashmentPolicyActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamLeaveEncashmentPolicyById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamLeaveEncashmentPolicyById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamLeaveEncashmentPolicy(
    {
      active: readFormActive(formData, existing.active),
      code: existing.code,
      effectiveFrom: existing.effectiveFrom,
      encashmentRatePercent: existing.encashmentRatePercent,
      id: existing.id,
      leaveTypeId: existing.leaveTypeId,
      maxEncashableDays: existing.maxEncashableDays,
      minRemainingBalanceDays: existing.minRemainingBalanceDays ?? undefined,
      title: existing.title,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/encashment", result);
};

export const processEncashmentAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const input: ProcessLamLeaveEncashmentInput = {
    employeeId: String(formData.get("employeeId") ?? "").trim(),
    leaveTypeId: String(formData.get("leaveTypeId") ?? "").trim(),
    policyId: String(formData.get("policyId") ?? "").trim(),
    periodYear: Number(formData.get("periodYear") ?? new Date().getFullYear()),
    encashmentDays: Number(formData.get("encashmentDays") ?? 0),
    payPeriodStart: new Date(String(formData.get("payPeriodStart") ?? "")),
    payPeriodEnd: new Date(String(formData.get("payPeriodEnd") ?? "")),
    authorizedBy: String(formData.get("authorizedBy") ?? "").trim(),
    reason: String(formData.get("reason") ?? "").trim(),
  };

  const result = await processLamLeaveEncashment(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/encashment");
  }

  return toActionState(result);
};

export const upsertLeaveTypeAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const input: UpsertLamLeaveTypeInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    kind: String(formData.get("kind") ?? "annual") as UpsertLamLeaveTypeInput["kind"],
    paid: formData.get("paid") === "on",
    active: readFormActive(formData),
  };

  const result = await upsertLamLeaveType(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/leave");
  }

  return toActionState(result);
};

export const toggleLeaveTypeActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamLeaveTypeById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamLeaveTypeById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamLeaveType(
    {
      active: readFormActive(formData, existing.active),
      code: existing.code,
      id: existing.id,
      kind: existing.kind,
      name: existing.name,
      paid: existing.paid,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/leave", result);
};

export const upsertEntitlementRuleAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const readContext = await resolveHrConsoleLamReadContext();
  const existingId = readOptionalFormId(formData);
  const { getLamLeaveEntitlementRuleById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = existingId
    ? await getLamLeaveEntitlementRuleById(existingId, readContext)
    : null;
  const input: UpsertLamLeaveEntitlementRuleInput = {
    ...(existingId ? { id: existingId } : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    leaveTypeId: String(formData.get("leaveTypeId") ?? "").trim(),
    entitlementDays: Number(formData.get("entitlementDays") ?? 0),
    accrualRule: existing?.accrualRule ?? "annual_grant",
    effectiveFrom: new Date(String(formData.get("effectiveFrom") ?? "")),
    active: readFormActive(formData),
  };

  const result = await upsertLamLeaveEntitlementRule(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/leave");
  }

  return toActionState(result);
};

export const toggleEntitlementRuleActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamLeaveEntitlementRuleById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamLeaveEntitlementRuleById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamLeaveEntitlementRule(
    {
      accrualRule: existing.accrualRule,
      active: readFormActive(formData, existing.active),
      code: existing.code,
      effectiveFrom: existing.effectiveFrom,
      entitlementDays: existing.entitlementDays,
      id: existing.id,
      leaveTypeId: existing.leaveTypeId,
      title: existing.title,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/leave", result);
};

export const upsertBlackoutPeriodAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const leaveTypeId = String(formData.get("leaveTypeId") ?? "").trim();
  const input: UpsertLamLeaveBlackoutPeriodInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    leaveTypeId: leaveTypeId.length > 0 ? leaveTypeId : undefined,
    startDate: new Date(String(formData.get("startDate") ?? "")),
    endDate: new Date(String(formData.get("endDate") ?? "")),
    reason: String(formData.get("reason") ?? "").trim(),
    active: readFormActive(formData),
  };

  const result = await upsertLamLeaveBlackoutPeriod(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/leave");
  }

  return toActionState(result);
};

export const toggleBlackoutPeriodActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamLeaveBlackoutPeriodById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamLeaveBlackoutPeriodById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamLeaveBlackoutPeriod(
    {
      active: readFormActive(formData, existing.active),
      code: existing.code,
      endDate: existing.endDate,
      id: existing.id,
      leaveTypeId: existing.leaveTypeId,
      reason: existing.reason,
      startDate: existing.startDate,
      title: existing.title,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/leave", result);
};

export const upsertApprovalRouteAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const leaveTypeId = String(formData.get("leaveTypeId") ?? "").trim();
  const input: UpsertLamLeaveApprovalRouteInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    leaveTypeId: leaveTypeId.length > 0 ? leaveTypeId : undefined,
    scope: parseApprovalRouteScopeFromFormData(formData),
    minDurationDays: parseOptionalDurationDays(formData, "minDurationDays"),
    maxDurationDays: parseOptionalDurationDays(formData, "maxDurationDays"),
    steps: parseApprovalRouteStepsFromFormData(formData),
    active: readFormActive(formData),
  };

  const result = await upsertLamLeaveApprovalRoute(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/leave");
  }

  return toActionState(result);
};

export const toggleApprovalRouteActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamLeaveApprovalRouteById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamLeaveApprovalRouteById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamLeaveApprovalRoute(
    {
      active: readFormActive(formData, existing.active),
      code: existing.code,
      id: existing.id,
      leaveTypeId: existing.leaveTypeId,
      maxDurationDays: existing.maxDurationDays,
      minDurationDays: existing.minDurationDays,
      scope: existing.scope,
      steps: existing.steps,
      title: existing.title,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/leave", result);
};

export const upsertWorkCalendarAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const input: UpsertLamWorkCalendarInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    weekdayRules: standardWeekdayRules,
    effectiveFrom: new Date(String(formData.get("effectiveFrom") ?? "")),
    active: readFormActive(formData),
  };

  const result = await upsertLamWorkCalendar(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/calendars");
  }

  return toActionState(result);
};

export const toggleWorkCalendarActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamWorkCalendarById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamWorkCalendarById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamWorkCalendar(
    {
      active: readFormActive(formData, existing.active),
      code: existing.code,
      effectiveFrom: existing.effectiveFrom,
      id: existing.id,
      title: existing.title,
      weekdayRules: existing.weekdayRules,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/calendars", result);
};

export const upsertHolidayCalendarAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const input: UpsertLamHolidayCalendarInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    effectiveFrom: new Date(String(formData.get("effectiveFrom") ?? "")),
    active: readFormActive(formData),
  };

  const result = await upsertLamHolidayCalendar(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/calendars");
  }

  return toActionState(result);
};

export const toggleHolidayCalendarActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamHolidayCalendarById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamHolidayCalendarById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamHolidayCalendar(
    {
      active: readFormActive(formData, existing.active),
      code: existing.code,
      effectiveFrom: existing.effectiveFrom,
      holidays: existing.holidays,
      id: existing.id,
      title: existing.title,
      workCalendarId: existing.workCalendarId,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/calendars", result);
};

export const upsertAttendancePolicyAction = async (
  _previousState: LamConfigActionState,
  formData: FormData
): Promise<LamConfigActionState> => {
  const context = await resolveHrConsoleLamConfigContext();
  const input: UpsertLamAttendancePolicyInput = {
    ...(readOptionalFormId(formData)
      ? { id: readOptionalFormId(formData) }
      : {}),
    code: String(formData.get("code") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    gracePeriodMinutes: Number(formData.get("gracePeriodMinutes") ?? 0),
    latenessThresholdMinutes: Number(formData.get("latenessThresholdMinutes") ?? 15),
    earlyDepartureThresholdMinutes: Number(
      formData.get("earlyDepartureThresholdMinutes") ?? 15
    ),
    absenceThresholdMinutes: Number(formData.get("absenceThresholdMinutes") ?? 240),
    effectiveFrom: new Date(String(formData.get("effectiveFrom") ?? "")),
    active: readFormActive(formData),
  };

  const result = await upsertLamAttendancePolicy(input, context);
  if (result.ok) {
    revalidatePath("/hr/console/policy");
  }

  return toActionState(result);
};

export const toggleAttendancePolicyActiveAction = async (
  formData: FormData
): Promise<void> => {
  const id = readOptionalFormId(formData);
  if (!id) {
    return;
  }

  const readContext = await resolveHrConsoleLamReadContext();
  const writeContext = await resolveHrConsoleLamConfigContext();
  const { getLamAttendancePolicyById } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );
  const existing = await getLamAttendancePolicyById(id, readContext);
  if (!existing) {
    return;
  }

  const result = await upsertLamAttendancePolicy(
    {
      absenceThresholdMinutes: existing.absenceThresholdMinutes,
      active: readFormActive(formData, existing.active),
      code: existing.code,
      earlyDepartureThresholdMinutes: existing.earlyDepartureThresholdMinutes,
      effectiveFrom: existing.effectiveFrom,
      gracePeriodMinutes: existing.gracePeriodMinutes,
      id: existing.id,
      latenessThresholdMinutes: existing.latenessThresholdMinutes,
      title: existing.title,
      workCalendarId: existing.workCalendarId,
    },
    writeContext
  );
  revalidateConsolePathOnSuccess("/hr/console/policy", result);
};

export const loadEncashmentHubRecords = async () => {
  const readContext = await resolveHrConsoleLamReadContext();
  const { listLamLeaveEncashmentPoliciesRecords, listLamLeaveTypesRecords } =
    await import("@repo/features-time-attendance-leave-attendance-management/server");

  const [policies, leaveTypes] = await Promise.all([
    listLamLeaveEncashmentPoliciesRecords({}, readContext),
    listLamLeaveTypesRecords({}, readContext),
  ]);

  return { leaveTypes, policies };
};

export const loadLeaveHubRecords = async () => {
  const readContext = await resolveHrConsoleLamReadContext();
  const {
    listLamLeaveApprovalRoutesRecords,
    listLamLeaveBlackoutPeriodsRecords,
    listLamLeaveEntitlementRulesRecords,
    listLamLeaveTypesRecords,
  } = await import("@repo/features-time-attendance-leave-attendance-management/server");

  const [leaveTypes, entitlementRules, blackoutPeriods, approvalRoutes] =
    await Promise.all([
      listLamLeaveTypesRecords({}, readContext),
      listLamLeaveEntitlementRulesRecords({}, readContext),
      listLamLeaveBlackoutPeriodsRecords({}, readContext),
      listLamLeaveApprovalRoutesRecords({}, readContext),
    ]);

  return {
    approvalRoutes,
    blackoutPeriods,
    entitlementRules,
    leaveTypes,
  };
};

export const loadCalendarHubRecords = async () => {
  const readContext = await resolveHrConsoleLamReadContext();
  const {
    listLamHolidayCalendarsRecords,
    listLamWorkCalendarsRecords,
  } = await import("@repo/features-time-attendance-leave-attendance-management/server");

  const [workCalendars, holidayCalendars] = await Promise.all([
    listLamWorkCalendarsRecords({}, readContext),
    listLamHolidayCalendarsRecords({}, readContext),
  ]);

  return { holidayCalendars, workCalendars };
};

export const loadPolicyHubRecords = async () => {
  const readContext = await resolveHrConsoleLamReadContext();
  const { listLamAttendancePoliciesRecords } = await import(
    "@repo/features-time-attendance-leave-attendance-management/server"
  );

  return listLamAttendancePoliciesRecords({}, readContext);
};
