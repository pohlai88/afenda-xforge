"use server";

import {
  deactivateEmployeeUserAccountLink,
  listEmployeeUserAccountLinks,
  upsertEmployeeUserAccountLink,
} from "@repo/features-employee-management-employee-records-management/server";
import { revalidatePath } from "next/cache";
import {
  resolveHrConsoleEmployeeAccessContext,
  resolveHrConsoleEmployeeAccessWriteContext,
} from "./_employee-access-context.ts";

export type EmployeeAccessActionState = {
  message: string;
  ok: boolean;
};

const toActionState = (result: {
  error?: string;
  message?: string;
  ok: boolean;
}): EmployeeAccessActionState => ({
  message: result.ok
    ? (result.message ?? "Saved")
    : (result.error ?? "Request failed"),
  ok: result.ok,
});

export const loadEmployeeAccessLinks = async () => {
  const context = await resolveHrConsoleEmployeeAccessContext();
  const result = await listEmployeeUserAccountLinks({}, context);

  if (!result.ok) {
    return [];
  }

  return result.links ?? [];
};

export const bindEmployeeUserAccountAction = async (
  _previousState: EmployeeAccessActionState,
  formData: FormData
): Promise<EmployeeAccessActionState> => {
  const context = await resolveHrConsoleEmployeeAccessWriteContext();
  const result = await upsertEmployeeUserAccountLink(
    {
      employeeId: String(formData.get("employeeId") ?? "").trim(),
      userId: String(formData.get("userId") ?? "").trim(),
    },
    context
  );

  if (result.ok) {
    revalidatePath("/hr/console/employee-access");
  }

  return toActionState(result);
};

export const deactivateEmployeeUserAccountAction = async (
  formData: FormData
): Promise<void> => {
  const context = await resolveHrConsoleEmployeeAccessWriteContext();
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    return;
  }

  await deactivateEmployeeUserAccountLink({ userId }, context);
  revalidatePath("/hr/console/employee-access");
};
