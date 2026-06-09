import { getEmployeeLifecycleOverviewSnapshot } from "@repo/features-employee-management-employee-lifecycle-management/server";
import { NextResponse } from "next/server";
import {
  createEmployeeLifecycleReadContext,
  createEmployeeLifecycleRepositoryScope,
} from "../_lib/context.ts";

export function GET(request: Request) {
  const context = createEmployeeLifecycleReadContext(request);
  const data = getEmployeeLifecycleOverviewSnapshot(
    createEmployeeLifecycleRepositoryScope(context),
    context
  );

  return NextResponse.json(data);
}
