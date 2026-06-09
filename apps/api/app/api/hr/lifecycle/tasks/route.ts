import { listEmployeeLifecycleTaskEntries } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
  getEmployeeLifecycleQuery,
} from "../_lib/context.ts";

export async function GET(request: Request) {
  const context = createEmployeeLifecycleReadContext(request);
  const query = getEmployeeLifecycleQuery(request);
  const data = listEmployeeLifecycleTaskEntries(
    query.employeeId,
    createEmployeeLifecycleRepositoryScope(context),
    context
  );

  return NextResponse.json(data);
}

