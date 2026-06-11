import { listEmployeeLifecycleAuditTrailEntries } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
  getEmployeeLifecycleQuery,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const context = await createEmployeeLifecycleReadContext(request);
  const query = getEmployeeLifecycleQuery(request);
  const data = listEmployeeLifecycleAuditTrailEntries(
    query.employeeId,
    createEmployeeLifecycleRepositoryScope(context),
    context
  );

  return NextResponse.json(data);
}
