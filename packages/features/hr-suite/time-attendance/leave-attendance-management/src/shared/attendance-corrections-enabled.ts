import type { LamCompanyAttendanceSettings } from "../schema.ts";

export const defaultLamAttendanceCorrectionsEnabled = true;

export const resolveLamAttendanceCorrectionsEnabled = (args: {
  companyId: string;
  companyAttendanceSettings: readonly LamCompanyAttendanceSettings[];
  contextEnabled?: boolean;
}): boolean => {
  if (args.contextEnabled === false) {
    return false;
  }

  const settings = args.companyAttendanceSettings.find(
    (entry) => entry.companyId === args.companyId
  );

  if (settings?.attendanceCorrectionsEnabled === false) {
    return false;
  }

  return defaultLamAttendanceCorrectionsEnabled;
};
