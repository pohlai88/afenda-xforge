import "server-only";

import { loadLamRepository } from "../repository.ts";
import type {
  LamCompanyAttendanceSettings,
  LamReadContext,
} from "../schema.ts";
import {
  defaultLamAttendanceCorrectionsEnabled,
  resolveLamAttendanceCorrectionsEnabled,
} from "../shared/attendance-corrections-enabled.ts";
import { readContext } from "./shared.ts";

export type LamCompanyAttendanceSettingsView = Pick<
  LamCompanyAttendanceSettings,
  "companyId" | "attendanceCorrectionsEnabled"
> &
  Partial<Pick<LamCompanyAttendanceSettings, "id" | "updatedAt" | "updatedBy">>;

export const getLamCompanyAttendanceSettings = async (
  context?: LamReadContext
): Promise<LamCompanyAttendanceSettingsView | null> => {
  const ctx = readContext(context);
  if (!ctx.companyId) {
    return null;
  }

  const state = await loadLamRepository({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
  });

  const existing = state.companyAttendanceSettings.find(
    (entry) => entry.companyId === ctx.companyId
  );

  if (existing) {
    return existing;
  }

  return {
    companyId: ctx.companyId,
    attendanceCorrectionsEnabled: defaultLamAttendanceCorrectionsEnabled,
  };
};

export const isLamAttendanceCorrectionsEnabledForContext = async (
  context?: LamReadContext
): Promise<boolean> => {
  const ctx = readContext(context);
  if (!ctx.companyId) {
    return false;
  }

  const state = await loadLamRepository({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
  });

  return resolveLamAttendanceCorrectionsEnabled({
    companyId: ctx.companyId,
    companyAttendanceSettings: state.companyAttendanceSettings,
    contextEnabled: context?.attendanceCorrectionsEnabled,
  });
};
