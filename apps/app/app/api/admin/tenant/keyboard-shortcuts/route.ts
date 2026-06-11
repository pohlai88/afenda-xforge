import { NextResponse } from "next/server";
import { resolveOptionalCompanyId } from "../../../../_runtime-access.ts";
import { mapWorkspaceShortcutApiError } from "../../../../../lib/workspace-shortcuts/api-errors.ts";
import { executeTenantKeyboardShortcutPolicyUpdate } from "../../../../../lib/workspace-shortcuts/execution.server.ts";
import { queryTenantKeyboardShortcutPolicy } from "../../../../../lib/workspace-shortcuts/queries.server.ts";
import { tenantKeyboardShortcutPolicyPostSchema } from "../../../../../lib/workspace-shortcuts/tenant-policy-schema.ts";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const companyId = await resolveOptionalCompanyId();
    const payload = await queryTenantKeyboardShortcutPolicy({
      companyId,
      requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return mapWorkspaceShortcutApiError(
      error,
      "Tenant keyboard shortcut policy read failed"
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = tenantKeyboardShortcutPolicyPostSchema.parse(
      await request.json()
    );
    const companyId = await resolveOptionalCompanyId();
    const payload = await executeTenantKeyboardShortcutPolicyUpdate(body, {
      companyId,
      requestId: request.headers.get("x-request-id")?.trim() ?? undefined,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return mapWorkspaceShortcutApiError(
      error,
      "Tenant keyboard shortcut policy update failed"
    );
  }
}
